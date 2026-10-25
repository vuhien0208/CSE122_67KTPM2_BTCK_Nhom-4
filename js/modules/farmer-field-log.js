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
  const state = { q: '', season: ui.param('season') || '', activity: '', from: '', to: '', archived: false };

  const seasons = () => queries.seasonsOfFarmer(me.id).filter((s) => s.status !== 'archived');

  // Chuẩn bị các bộ lọc có sẵn trong HTML rồi hiển thị nhật ký.
  function shell() {
    const seasonSelect = ui.qs('#flt-season', view);
    seasonSelect.innerHTML = ui.optionList(
      [{ value: '', label: 'Tất cả mùa vụ' }].concat(
        seasons().map((season) => ({
          value: season.id,
          label: season.name
        }))
      ),
      state.season
    );

    ui.qs('#flt-act', view).innerHTML = ui.optionList(
      [{ value: '', label: 'Tất cả' }].concat(app.ACTIVITIES),
      state.activity
    );

    ui.qs('#flt-q', view).value = state.q;
    ui.qs('#flt-from', view).value = state.from;
    ui.qs('#flt-to', view).value = state.to;
    ui.qs('#flt-arc', view).checked = state.archived;

    const bindFilter = (id, key) => {
      ui.qs('#' + id, view).addEventListener('change', (event) => {
        state[key] = event.target.type === 'checkbox'
          ? event.target.checked
          : event.target.value;

        list();
      });
    };

    ui.qs('#flt-q', view).addEventListener(
      'input',
      ui.debounce((event) => {
        state.q = event.target.value;
        list();
      }, 150)
    );

    bindFilter('flt-season', 'season');
    bindFilter('flt-act', 'activity');
    bindFilter('flt-from', 'from');
    bindFilter('flt-to', 'to');
    bindFilter('flt-arc', 'archived');

    list();

    if (ui.param('new') === '1') {
      history.replaceState(
        null,
        '',
        location.pathname + (state.season ? '?season=' + state.season : '')
      );

      logForm(null);
    }
  }

  function filtered() {
    const ids = queries.seasonsOfFarmer(me.id).map((s) => s.id), q = ui.norm(state.q);
    return store.where('fieldLogs', (l) => l.farmerId === me.id && ids.includes(l.seasonId))
      .filter((l) => !!l.archived === state.archived)
      .filter((l) => !state.season || l.seasonId === state.season)
      .filter((l) => !state.activity || l.activity === state.activity)
      .filter((l) => !state.from || l.date >= state.from)
      .filter((l) => !state.to || l.date <= state.to)
      .filter((l) => !q || ui.norm(l.note + ' ' + l.activity).includes(q))
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  function list() {
    const box = ui.qs('#list', view), rows = filtered();
    const hasFilter = state.q || state.season || state.activity || state.from || state.to;
    if (!rows.length) {
      box.innerHTML = ui.empty('book', hasFilter ? 'Không có nhật ký phù hợp' : state.archived ? 'Chưa có nhật ký lưu trữ' : 'Chưa có nhật ký nào', hasFilter ? 'Thử bỏ bớt bộ lọc để xem nhiều kết quả hơn.' : 'Ghi hoạt động đầu tiên để bắt đầu theo dõi mùa vụ.', hasFilter ? '' : '<button class="btn" data-new>Thêm nhật ký</button>');
      return;
    }
    box.innerHTML = '<div class="table-wrap"><table class="data"><caption class="sr-only">Danh sách nhật ký canh tác</caption><thead><tr><th>Ngày</th><th>Mùa vụ</th><th>Hoạt động</th><th>Ghi chú</th><th>Ảnh</th><th>Thao tác</th></tr></thead><tbody>' +
      rows.map((l) => '<tr><td>' + ui.fmtDate(l.date) + '</td><td>' + ui.esc(queries.seasonName(l.seasonId)) + '</td><td>' + ui.badge('plain', l.activity) + '</td><td style="min-width:240px">' + ui.esc(l.note) + '</td><td>' + (l.images && l.images.length ? '<div class="thumbs">' + l.images.slice(0, 2).map((s) => '<img src="' + s + '" alt="Ảnh nhật ký" data-zoom style="width:44px;height:44px">').join('') + '</div>' : '<span class="muted">—</span>') + '</td>' +
        '<td><div class="actions"><button class="btn btn-sm btn-outline" data-edit="' + l.id + '">' + ui.icon('edit') + ' Sửa</button>' +
        (l.archived ? '<button class="btn btn-sm btn-ghost" data-restore="' + l.id + '">Khôi phục</button>' : '<button class="btn btn-sm btn-ghost" data-archive="' + l.id + '">' + ui.icon('archive') + ' Lưu trữ</button>') +
        '<button class="btn btn-sm btn-ghost" data-del="' + l.id + '">' + ui.icon('trash') + ' Xóa</button></div></td></tr>').join('') + '</tbody></table></div>' +
      '<p class="small muted" style="padding:10px 20px">Hiển thị ' + rows.length + ' bản ghi.</p>';
  }

  function logForm(l) {
    const ss = seasons();
    if (!ss.length) { ui.toast('Bạn cần có mùa vụ đang canh tác để ghi nhật ký.', 'warn'); return; }
    const m = ui.openModal({
      title: l ? 'Sửa nhật ký' : 'Thêm nhật ký canh tác',
      body: '<form id="lf" novalidate><div class="form-grid">' +
        ui.field({ name: 'seasonId', label: 'Mùa vụ', type: 'select', options: ss.map((s) => ({ value: s.id, label: s.name })), blank: 'Chọn mùa vụ', required: true, value: l ? l.seasonId : (state.season || (ss.length === 1 ? ss[0].id : '')) }) +
        ui.field({ name: 'date', label: 'Ngày thực hiện', type: 'date', required: true, value: l ? l.date : app.today(), attrs: 'max="' + app.today() + '"' }) +
        ui.field({ name: 'activity', label: 'Hoạt động', type: 'select', options: app.ACTIVITIES, required: true, value: l ? l.activity : '', blank: 'Chọn hoạt động', full: true }) +
        ui.field({ name: 'note', label: 'Ghi chú', type: 'textarea', required: true, value: l ? l.note : '', rows: 4, placeholder: 'Ghi rõ liều lượng, vị trí, thời tiết, quan sát…', full: true }) +
        '<div class="field full"><span class="label">Ảnh minh họa (không bắt buộc)</span><div id="pick"></div></div></div></form>',
      footer: '<button class="btn btn-outline" data-close>Hủy</button><button class="btn" form="lf" type="submit">' + (l ? 'Lưu thay đổi' : 'Lưu nhật ký') + '</button>',
    });
    const form = ui.qs('#lf', m.el); ui.clearErrorsOnInput(form);
    const pick = ui.imagePicker(ui.qs('#pick', m.el), l ? l.images : [], 3);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const ok = ui.validate(form, {
        seasonId: { label: 'Mùa vụ', required: true },
        date: { label: 'Ngày thực hiện', required: true, custom: (v) => (v > app.today() ? 'Ngày thực hiện không được ở tương lai.' : '') },
        activity: { label: 'Hoạt động', required: true },
        note: { label: 'Ghi chú', required: true, min: 5, max: 600 },
      });
      if (!ok) return;
      const d = ui.formData(form), rec = { seasonId: d.seasonId, date: d.date, activity: d.activity, note: d.note, images: pick.get() };
      const saved = l ? store.update('fieldLogs', l.id, rec) : store.create('fieldLogs', Object.assign({ farmerId: me.id, archived: false }, rec));
      if (!saved) { ui.toast('Không lưu được: bộ nhớ trình duyệt đã đầy. Hãy xóa bớt ảnh.', 'error'); return; }
      m.close(); ui.toast(l ? 'Đã cập nhật nhật ký.' : 'Đã lưu nhật ký.'); list();
    });
  }

  view.addEventListener('click', async (e) => {
    const t = e.target.closest('button'); if (!t) return;
    if (t.hasAttribute('data-new')) logForm(null);
    else if (t.dataset.edit) logForm(store.find('fieldLogs', t.dataset.edit));
    else if (t.dataset.archive) { if (await ui.confirm({ title: 'Lưu trữ nhật ký', message: 'Lưu trữ bản ghi này? Bạn có thể khôi phục trong mục "Xem đã lưu trữ".', confirmText: 'Lưu trữ' })) { store.update('fieldLogs', t.dataset.archive, { archived: true }); ui.toast('Đã lưu trữ nhật ký.'); list(); } }
    else if (t.dataset.restore) { store.update('fieldLogs', t.dataset.restore, { archived: false }); ui.toast('Đã khôi phục nhật ký.'); list(); }
    else if (t.dataset.del) { if (await ui.confirm({ title: 'Xóa nhật ký', message: 'Xóa bản ghi này vĩnh viễn? Không thể hoàn tác.', confirmText: 'Xóa', danger: true })) { store.remove('fieldLogs', t.dataset.del); ui.toast('Đã xóa nhật ký.'); list(); } }
  });

  shell();
})();
