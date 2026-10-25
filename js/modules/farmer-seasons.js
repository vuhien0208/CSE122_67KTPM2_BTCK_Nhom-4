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
  const state = { tab: 'seasons', q: '', status: '' };

  const farm = () => queries.farmsOf(me.id)[0];
  const myFields = () => store.where('fields', (f) => queries.farmsOf(me.id).some((x) => x.id === f.farmId));
  const mySeasons = () => queries.seasonsOfFarmer(me.id);
  const cropOptions = () => store.where('crops', (c) => c.status === 'active').map((c) => ({ value: c.id, label: c.name }));

  // Gắn sự kiện cho các bộ lọc và hiển thị tab mặc định.
  function shell() {
    ui.qs('#flt-q', view).value = state.q;
    ui.qs('#flt-st', view).value = state.status;

    ui.qs('#flt-q', view).addEventListener(
      'input',
      ui.debounce((event) => {
        state.q = event.target.value;
        renderSeasons();
      }, 150)
    );

    ui.qs('#flt-st', view).addEventListener('change', (event) => {
      state.status = event.target.value;
      renderSeasons();
    });

    draw();
  }

  // Chuyển giữa tab mùa vụ và thửa ruộng.
  function draw() {
    ui.qsa('.tab', view).forEach((tab) => {
      const selected = tab.dataset.tab === state.tab;
      tab.setAttribute('aria-selected', selected ? 'true' : 'false');
    });

    ui.qs('#season-panel', view).hidden = state.tab !== 'seasons';
    ui.qs('#field-panel', view).hidden = state.tab !== 'fields';

    if (state.tab === 'fields') {
      renderFields();
    } else {
      renderSeasons();
    }
  }

  // Lọc và hiển thị danh sách mùa vụ.
  function renderSeasons() {
    const box = ui.qs('#season-list', view);
    let rows = mySeasons();

    if (state.status) {
      rows = rows.filter((season) => season.status === state.status);
    } else {
      rows = rows.filter((season) => season.status !== 'archived');
    }

    const keyword = ui.norm(state.q);

    if (keyword) {
      rows = rows.filter((season) =>
        ui.norm(season.name + ' ' + queries.cropName(season.cropId)).includes(keyword)
      );
    }

    rows.sort((a, b) => (a.startDate < b.startDate ? 1 : -1));

    if (!rows.length) {
      const hasFilter = keyword || state.status;

      box.innerHTML = ui.empty(
        'leaf',
        hasFilter ? 'Không tìm thấy mùa vụ' : 'Chưa có mùa vụ',
        hasFilter
          ? 'Thử đổi từ khóa hoặc bộ lọc.'
          : 'Tạo mùa vụ đầu tiên cho thửa ruộng của bạn.',
        hasFilter ? '' : '<button class="btn" data-new="season">Tạo mùa vụ</button>'
      );

      return;
    }

    box.innerHTML = '<div class="table-wrap"><table class="data">' +
      '<caption class="sr-only">Danh sách mùa vụ</caption>' +
      '<thead><tr>' +
        '<th>Mùa vụ</th><th>Thửa ruộng</th><th>Thời gian</th>' +
        '<th>Giai đoạn</th><th>Trạng thái</th><th>Thao tác</th>' +
      '</tr></thead><tbody>' +

      rows.map((season) => {
        const field = store.find('fields', season.fieldId);

        return '<tr>' +
          '<td><strong>' + ui.esc(season.name) + '</strong>' +
            '<span class="sub">' + ui.esc(queries.cropName(season.cropId)) + '</span></td>' +
          '<td>' + ui.esc(field ? field.name + ' · ' + field.area + ' ha' : '—') + '</td>' +
          '<td>' + ui.fmtDate(season.startDate) + ' – ' + ui.fmtDate(season.endDate) + '</td>' +
          '<td>' + ui.esc(season.stage) + '</td>' +
          '<td>' + ui.mapBadge(ui.SEASON_STATUS, season.status) + '</td>' +
          '<td><div class="actions">' +
            '<button class="btn btn-sm btn-outline" data-edit-season="' + season.id + '">' +
              ui.icon('edit') + ' Sửa</button>' +
            '<a class="btn btn-sm btn-ghost" href="farmer-checklist.html?season=' + season.id + '">' +
              'Checklist</a>' +
            (season.status !== 'archived'
              ? '<button class="btn btn-sm btn-ghost" data-archive-season="' + season.id + '">' +
                ui.icon('archive') + ' Lưu trữ</button>'
              : '<button class="btn btn-sm btn-ghost" data-restore-season="' + season.id + '">' +
                'Khôi phục</button>') +
          '</div></td>' +
        '</tr>';
      }).join('') +

      '</tbody></table></div>';
  }

  // Hiển thị các thửa ruộng của nông hộ.
  function renderFields() {
    const box = ui.qs('#field-list', view);
    const rows = myFields();

    if (!rows.length) {
      box.innerHTML = ui.empty(
        'map',
        'Chưa có thửa ruộng',
        'Thêm thửa ruộng trước khi tạo mùa vụ.',
        '<button class="btn" data-new="field">Thêm thửa ruộng</button>'
      );

      return;
    }

    box.innerHTML = '<div class="table-wrap"><table class="data">' +
      '<caption class="sr-only">Danh sách thửa ruộng</caption>' +
      '<thead><tr>' +
        '<th>Thửa ruộng</th><th>Diện tích</th><th>Cây trồng chính</th>' +
        '<th>Mùa vụ</th><th>Thao tác</th>' +
      '</tr></thead><tbody>' +

      rows.map((field) => {
        const seasonCount = mySeasons().filter(
          (season) => season.fieldId === field.id
        ).length;

        return '<tr>' +
          '<td><strong>' + ui.esc(field.name) + '</strong></td>' +
          '<td>' + field.area + ' ha</td>' +
          '<td>' + ui.esc(queries.cropName(field.cropId)) + '</td>' +
          '<td>' + seasonCount + '</td>' +
          '<td><div class="actions">' +
            '<button class="btn btn-sm btn-outline" data-edit-field="' + field.id + '">' +
              ui.icon('edit') + ' Sửa</button>' +
            '<button class="btn btn-sm btn-ghost" data-del-field="' + field.id + '">' +
              ui.icon('trash') + ' Xóa</button>' +
          '</div></td>' +
        '</tr>';
      }).join('') +

      '</tbody></table></div>';
  }

  /* ---- form thửa ruộng ---- */
  function fieldForm(f) {
    const m = ui.openModal({
      title: f ? 'Sửa thửa ruộng' : 'Thêm thửa ruộng',
      body: '<form id="ff" novalidate><div class="form-grid">' +
        ui.field({ name: 'name', label: 'Tên thửa ruộng', required: true, value: f ? f.name : '', placeholder: 'Ví dụ: Thửa A3' }) +
        ui.field({ name: 'area', label: 'Diện tích (ha)', type: 'number', required: true, value: f ? f.area : '', attrs: 'step="0.01" min="0.01"' }) +
        ui.field({ name: 'cropId', label: 'Cây trồng chính', type: 'select', options: cropOptions(), blank: 'Chọn cây trồng', required: true, value: f ? f.cropId : '', full: true }) + '</div></form>',
      footer: '<button class="btn btn-outline" data-close>Hủy</button><button class="btn" form="ff" type="submit">' + (f ? 'Lưu thay đổi' : 'Thêm thửa ruộng') + '</button>',
    });
    const form = ui.qs('#ff', m.el); ui.clearErrorsOnInput(form);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const ok = ui.validate(form, {
        name: { label: 'Tên thửa ruộng', required: true, max: 60 },
        area: { label: 'Diện tích', required: true, custom: (v) => (!(parseFloat(v) > 0) ? 'Diện tích phải lớn hơn 0.' : parseFloat(v) > 1000 ? 'Diện tích quá lớn, hãy kiểm tra đơn vị (ha).' : '') },
        cropId: { label: 'Cây trồng', required: true },
      });
      if (!ok) return;
      const d = ui.formData(form), rec = { name: d.name, area: parseFloat(d.area), cropId: d.cropId };
      if (f) store.update('fields', f.id, rec); else store.create('fields', Object.assign({ farmId: farm().id }, rec));
      m.close(); ui.toast(f ? 'Đã cập nhật thửa ruộng.' : 'Đã thêm thửa ruộng.'); draw();
    });
  }

  /* ---- form mùa vụ ---- */
  function seasonForm(s) {
    const fields = myFields();
    if (!fields.length) { ui.toast('Hãy thêm thửa ruộng trước khi tạo mùa vụ.', 'warn'); state.tab = 'fields'; draw(); return; }
    const m = ui.openModal({
      title: s ? 'Sửa mùa vụ' : 'Tạo mùa vụ', size: 'lg',
      body: '<form id="sf" novalidate><div class="form-grid">' +
        ui.field({ name: 'name', label: 'Tên mùa vụ', required: true, value: s ? s.name : '', placeholder: 'Ví dụ: Lúa Đông Xuân 2026-27', full: true }) +
        ui.field({ name: 'fieldId', label: 'Thửa ruộng', type: 'select', options: fields.map((f) => ({ value: f.id, label: f.name + ' — ' + queries.cropName(f.cropId) })), blank: 'Chọn thửa ruộng', required: true, value: s ? s.fieldId : '', help: 'Cây trồng được lấy theo thửa ruộng.' }) +
        ui.field({ name: 'stage', label: 'Giai đoạn hiện tại', type: 'select', options: app.STAGES, required: true, value: s ? s.stage : app.STAGES[0] }) +
        ui.field({ name: 'startDate', label: 'Ngày bắt đầu', type: 'date', required: true, value: s ? s.startDate : app.today() }) +
        ui.field({ name: 'endDate', label: 'Ngày dự kiến kết thúc', type: 'date', required: true, value: s ? s.endDate : '' }) +
        ui.field({ name: 'status', label: 'Trạng thái', type: 'select', options: [{ value: 'active', label: 'Đang canh tác' }, { value: 'completed', label: 'Đã hoàn thành' }], value: s ? (s.status === 'archived' ? 'completed' : s.status) : 'active' }) +
        ui.field({ name: 'note', label: 'Ghi chú', type: 'textarea', rows: 3, value: s ? s.note : '', full: true }) + '</div></form>',
      footer: '<button class="btn btn-outline" data-close>Hủy</button><button class="btn" form="sf" type="submit">' + (s ? 'Lưu thay đổi' : 'Tạo mùa vụ') + '</button>',
    });
    const form = ui.qs('#sf', m.el); ui.clearErrorsOnInput(form);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const ok = ui.validate(form, {
        name: { label: 'Tên mùa vụ', required: true, min: 3, max: 80 },
        fieldId: { label: 'Thửa ruộng', required: true },
        startDate: { label: 'Ngày bắt đầu', required: true },
        endDate: { label: 'Ngày kết thúc', required: true, custom: (v, f) => (v && f.elements.startDate.value && v <= f.elements.startDate.value ? 'Ngày kết thúc phải sau ngày bắt đầu.' : '') },
      });
      if (!ok) return;
      const d = ui.formData(form), fld = store.find('fields', d.fieldId);
      const rec = { name: d.name, fieldId: d.fieldId, farmId: fld.farmId, cropId: fld.cropId, stage: d.stage, startDate: d.startDate, endDate: d.endDate, status: d.status, note: d.note };
      if (s) store.update('seasons', s.id, rec); else store.create('seasons', rec);
      m.close(); ui.toast(s ? 'Đã cập nhật mùa vụ.' : 'Đã tạo mùa vụ.'); draw();
    });
  }

  view.addEventListener('click', async (e) => {
    const t = e.target.closest('button,a'); if (!t) return;
    if (t.dataset.tab) { state.tab = t.dataset.tab; draw(); }
    else if (t.dataset.new === 'field') fieldForm(null);
    else if (t.dataset.new === 'season') seasonForm(null);
    else if (t.dataset.editField) fieldForm(store.find('fields', t.dataset.editField));
    else if (t.dataset.editSeason) seasonForm(store.find('seasons', t.dataset.editSeason));
    else if (t.dataset.delField) {
      const f = store.find('fields', t.dataset.delField);
      if (mySeasons().some((s) => s.fieldId === f.id)) { ui.toast('Không thể xóa thửa ruộng đang có mùa vụ. Hãy lưu trữ mùa vụ trước hoặc sửa thông tin thửa.', 'error'); return; }
      if (await ui.confirm({ title: 'Xóa thửa ruộng', message: 'Xóa "' + f.name + '"? Thao tác này không thể hoàn tác.', confirmText: 'Xóa', danger: true })) { store.remove('fields', f.id); ui.toast('Đã xóa thửa ruộng.'); draw(); }
    } else if (t.dataset.archiveSeason) {
      const s = store.find('seasons', t.dataset.archiveSeason);
      if (await ui.confirm({ title: 'Lưu trữ mùa vụ', message: 'Lưu trữ "' + s.name + '"? Mùa vụ sẽ ẩn khỏi danh sách đang canh tác, dữ liệu nhật ký vẫn được giữ.', confirmText: 'Lưu trữ' })) { store.update('seasons', s.id, { status: 'archived' }); ui.toast('Đã lưu trữ mùa vụ.'); draw(); }
    } else if (t.dataset.restoreSeason) { store.update('seasons', t.dataset.restoreSeason, { status: 'completed' }); ui.toast('Đã khôi phục mùa vụ.'); draw(); }
  });

  shell();
})();
