/* Trang Farmer: xử lý dữ liệu và thao tác của trang này. */
(function () {
  const app = window.CM;
  const ui = app.ui;
  const store = app.store;
  const queries = app.q;
  const me = app.auth.guard('farmer');
  if (!me) return;
  ui.mountShell(me);
  const view = ui.qs('#view');
  const seasons = () => queries.seasonsOfFarmer(me.id).filter((s) => s.status === 'active');
  const state = { seasonId: ui.param('season') || '' };

  function ensureList(seasonId) {
    let cl = queries.checklistOf(seasonId);
    if (!cl) cl = store.create('checklists', { seasonId: seasonId, items: [], source: 'manual', updatedAt: app.today() });
    return cl;
  }
  function saveItems(cl, items, source) {
    store.update('checklists', cl.id, { items: items, updatedAt: app.today(), source: source || cl.source });
  }

  // Chọn mùa vụ và hiển thị nội dung checklist.
  function shell() {
    const activeSeasons = seasons();
    const noSeasonBox = ui.qs('#checklist-no-season', view);
    const noSeasonMessage = ui.qs('#checklist-no-season-message', view);
    const checklistContent = ui.qs('#checklist-content', view);

    if (!activeSeasons.length) {
      noSeasonMessage.innerHTML = ui.empty(
        'clipboard',
        'Chưa có mùa vụ đang canh tác',
        'Tạo mùa vụ để lập checklist công việc.',
        '<a class="btn" href="farmer-seasons.html">Tạo mùa vụ</a>'
      );

      noSeasonBox.hidden = false;
      checklistContent.hidden = true;
      return;
    }

    noSeasonBox.hidden = true;
    checklistContent.hidden = false;

    if (!activeSeasons.some((season) => season.id === state.seasonId)) {
      state.seasonId = activeSeasons[0].id;
    }

    ui.qs('#sel-season', view).innerHTML = ui.optionList(
      activeSeasons.map((season) => ({
        value: season.id,
        label: season.name
      })),
      state.seasonId
    );

    drawList();
  }

  function drawList() {
    const cl = queries.checklistOf(state.seasonId), box = ui.qs('#cl', view), today = app.today();
    const items = cl ? cl.items.slice().sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1)) : [];
    if (!items.length) { box.innerHTML = ui.empty('clipboard', 'Checklist đang trống', 'Nhấn “Thêm việc” để tự tạo công việc cho mùa vụ này.'); return; }
    const pr = queries.progressOf(state.seasonId);
    box.innerHTML = '<div style="padding:14px 20px;border-bottom:1px solid var(--line)"><div class="row spread small" style="margin-bottom:4px"><span>Hoàn thành ' + pr.done + '/' + pr.total + ' việc</span><span>' + (pr.overdue ? '<strong style="color:var(--danger)">' + pr.overdue + ' việc trễ hạn</strong>' : 'Đúng tiến độ') + '</span></div><div class="progress ' + (pr.overdue ? 'warn' : '') + '" role="progressbar" aria-valuenow="' + pr.pct + '" aria-valuemin="0" aria-valuemax="100" aria-label="Tiến độ checklist"><span style="width:' + pr.pct + '%"></span></div></div>' +
      items.map((i) => {
        const late = i.status !== 'done' && i.dueDate < today;
        return '<div class="task ' + (i.status === 'done' ? 'done' : '') + '"><input type="checkbox" data-toggle="' + i.id + '"' + (i.status === 'done' ? ' checked' : '') + ' aria-label="Hoàn thành: ' + ui.esc(i.title) + '">' +
          '<div><div class="t-title strong">' + ui.esc(i.title) + '</div><div class="small muted">' + ui.esc(i.desc || '') + '</div><div class="row small" style="margin-top:6px"><span style="color:' + (late ? 'var(--danger)' : 'var(--muted)') + '">' + ui.fmtDate(i.dueDate) + (late ? ' · Trễ hạn' : '') + '</span>' + ui.mapBadge(ui.TASK_STATUS, i.status) + (i.stage ? '<span class="small muted">' + ui.esc(i.stage) + '</span>' : '') + '</div></div>' +
          '<div class="actions" style="display:flex;gap:4px"><button class="btn btn-sm btn-ghost" data-edit="' + i.id + '" aria-label="Sửa ' + ui.esc(i.title) + '">' + ui.icon('edit') + '</button><button class="btn btn-sm btn-ghost" data-del="' + i.id + '" aria-label="Xóa ' + ui.esc(i.title) + '">' + ui.icon('trash') + '</button></div></div>';
      }).join('');
  }

  function itemForm(item) {
    const m = ui.openModal({
      title: item ? 'Sửa công việc' : 'Thêm công việc',
      body: '<form id="cf" novalidate><div class="form-grid">' +
        ui.field({ name: 'title', label: 'Tên công việc', required: true, value: item ? item.title : '', full: true }) +
        ui.field({ name: 'desc', label: 'Mô tả', type: 'textarea', rows: 3, value: item ? item.desc : '', full: true }) +
        ui.field({ name: 'dueDate', label: 'Ngày dự kiến', type: 'date', required: true, value: item ? item.dueDate : app.today() }) +
        ui.field({ name: 'status', label: 'Trạng thái', type: 'select', options: Object.keys(ui.TASK_STATUS).map((k) => ({ value: k, label: ui.TASK_STATUS[k][1] })), value: item ? item.status : 'todo' }) +
        ui.field({ name: 'stage', label: 'Giai đoạn', type: 'select', options: app.STAGES, value: item ? item.stage : (queries.season(state.seasonId) || {}).stage, full: true }) + '</div></form>',
      footer: '<button class="btn btn-outline" data-close>Hủy</button><button class="btn" form="cf" type="submit">' + (item ? 'Lưu thay đổi' : 'Thêm việc') + '</button>',
    });
    const form = ui.qs('#cf', m.el); ui.clearErrorsOnInput(form);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!ui.validate(form, { title: { label: 'Tên công việc', required: true, min: 3, max: 100 }, dueDate: { label: 'Ngày dự kiến', required: true } })) return;
      const d = ui.formData(form), cl = ensureList(state.seasonId);
      let items = cl.items.slice();
      if (item) items = items.map((x) => (x.id === item.id ? Object.assign({}, x, d) : x));
      else items.push({ id: store.uid('ci'), title: d.title, desc: d.desc, dueDate: d.dueDate, status: d.status, stage: d.stage });
      saveItems(cl, items);
      m.close(); ui.toast(item ? 'Đã cập nhật công việc.' : 'Đã thêm công việc.'); drawList();
    });
  }

  view.addEventListener('click', async (e) => {
    const t = e.target.closest('button'); if (!t) return;
    const cl = queries.checklistOf(state.seasonId);
    if (t.hasAttribute('data-add')) itemForm(null);
    else if (t.dataset.edit) itemForm(cl.items.find((i) => i.id === t.dataset.edit));
    else if (t.dataset.del) {
      if (await ui.confirm({ title: 'Xóa công việc', message: 'Xóa công việc này khỏi checklist?', confirmText: 'Xóa', danger: true })) { saveItems(cl, cl.items.filter((i) => i.id !== t.dataset.del)); ui.toast('Đã xóa công việc.'); drawList(); }
    }
  });
  view.addEventListener('change', (e) => {
    if (e.target.id === 'sel-season') {
      state.seasonId = e.target.value;
      history.replaceState(null, '', '?season=' + state.seasonId);
      drawList();
      return;
    }

    const cb = e.target.closest('[data-toggle]');
    if (!cb) return;

    const cl = queries.checklistOf(state.seasonId);
    if (!cl) return;

    const updatedItems = cl.items.map((item) => {
      if (item.id === cb.dataset.toggle) {
        return Object.assign({}, item, {
          status: cb.checked ? 'done' : 'todo'
        });
      }

      return item;
    });

    saveItems(cl, updatedItems);
    drawList();
  });

  // Hiển thị trang sau khi đã chuẩn bị các hàm xử lý.
  shell();
})();
