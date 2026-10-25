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
  const state = { q: '', status: '' };

  const seasons = () => queries.seasonsOfFarmer(me.id).filter((s) => s.status !== 'archived');
  const mine = () => store.where('helpRequests', (r) => r.farmerId === me.id);

  // Gắn các sự kiện tìm kiếm và lọc yêu cầu hỗ trợ.
  function shell() {
    ui.qs('#flt-q', view).value = state.q;
    ui.qs('#flt-st', view).value = state.status;

    ui.qs('#flt-q', view).addEventListener(
      'input',
      ui.debounce((event) => {
        state.q = event.target.value;
        list();
      }, 150)
    );

    ui.qs('#flt-st', view).addEventListener('change', (event) => {
      state.status = event.target.value;
      list();
    });

    list();

    const requestId = ui.param('id');

    if (ui.param('new') === '1') {
      history.replaceState(null, '', location.pathname);
      requestForm(null);
    } else if (requestId && store.find('helpRequests', requestId)) {
      detail(requestId);
    }
  }

  function list() {
    const box = ui.qs('#list', view), q = ui.norm(state.q);
    const rows = mine().filter((r) => !state.status || r.status === state.status).filter((r) => !q || ui.norm(r.title + ' ' + r.description).includes(q)).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    if (!rows.length) {
      const f = q || state.status;
      box.innerHTML = ui.empty('lifebuoy', f ? 'Không có yêu cầu phù hợp' : 'Bạn chưa gửi yêu cầu nào', f ? 'Thử đổi từ khóa hoặc trạng thái.' : 'Khi cây trồng gặp vấn đề, hãy gửi yêu cầu để chuyên gia hỗ trợ.', f ? '' : '<button class="btn" data-new>Tạo yêu cầu</button>');
      return;
    }
    box.innerHTML = '<div class="table-wrap"><table class="data"><caption class="sr-only">Danh sách yêu cầu hỗ trợ</caption><thead><tr><th>Yêu cầu</th><th>Nhóm</th><th>Ưu tiên</th><th>Trạng thái</th><th>Phản hồi</th><th>Gửi lúc</th><th></th></tr></thead><tbody>' +
      rows.map((r) => '<tr><td style="min-width:220px"><strong>' + ui.esc(r.title) + '</strong><span class="sub">' + ui.esc(queries.seasonName(r.seasonId)) + '</span></td><td>' + ui.esc(ui.CAT_LABEL[r.category] || '—') + '</td><td>' + ui.mapBadge(ui.PRIORITY, r.priority) + '</td><td>' + ui.mapBadge(ui.REQ_STATUS, r.status) + '</td><td>' + (r.responses.length ? r.responses.length + ' phản hồi' : '<span class="muted">Chưa có</span>') + '</td><td>' + ui.fmtDateTime(r.createdAt) + '</td>' +
        '<td><button class="btn btn-sm btn-outline" data-view="' + r.id + '">' + ui.icon('eye') + ' Xem</button></td></tr>').join('') + '</tbody></table></div>';
  }

  /* ---------- chi tiết ---------- */
  function detail(id) {
    const r = store.find('helpRequests', id); if (!r) return;
    const body =
      '<dl class="kv"><dt>Trạng thái</dt><dd>' + ui.mapBadge(ui.REQ_STATUS, r.status) + '</dd><dt>Mức ưu tiên</dt><dd>' + ui.mapBadge(ui.PRIORITY, r.priority) + '</dd><dt>Nhóm vấn đề</dt><dd>' + ui.esc(ui.CAT_LABEL[r.category] || '—') + '</dd>' +
      '<dt>Mùa vụ</dt><dd>' + ui.esc(queries.seasonName(r.seasonId)) + ' · ' + ui.esc(queries.cropName(r.cropId)) + ' · ' + ui.esc(r.stage) + '</dd><dt>Gửi lúc</dt><dd>' + ui.fmtDateTime(r.createdAt) + '</dd>' +
      '<dt>Chuyên gia</dt><dd>' + (r.expertId ? ui.esc(queries.userName(r.expertId)) : '<span class="muted">Chưa có người tiếp nhận</span>') + '</dd><dt>Mô tả</dt><dd>' + ui.nl2br(r.description) + '</dd>' +
      (r.images.length ? '<dt>Ảnh</dt><dd><div class="thumbs">' + r.images.map((s) => '<img src="' + s + '" alt="Ảnh minh họa" data-zoom>').join('') + '</div></dd>' : '') + '</dl>' +
      '<h3 style="margin:20px 0 10px">Phản hồi từ chuyên gia</h3>' +
      (r.responses.length ? '<ol class="timeline">' + r.responses.map((x) => {
        const res = x.resourceId ? store.find('resources', x.resourceId) : null;
        return '<li><div class="row spread"><strong>' + ui.esc(queries.userName(x.expertId)) + '</strong><span class="small muted">' + ui.fmtDateTime(x.date) + '</span></div><p>' + ui.nl2br(x.text) + '</p>' + (res ? '<p class="small">Tài liệu tham khảo: <a href="' + ui.esc(res.url) + '" target="_blank" rel="noopener">' + ui.esc(res.title) + '</a></p>' : '') + '<p style="margin-top:4px">' + ui.mapBadge(ui.REQ_STATUS, x.status) + '</p></li>';
      }).join('') + '</ol>' : '<div class="alert info">' + ui.icon('alert') + '<div>Chưa có phản hồi. Chuyên gia sẽ tiếp nhận yêu cầu sớm nhất có thể.</div></div>');
    const foot = (r.status === 'pending' ? '<button class="btn btn-outline" data-edit-req="' + r.id + '">' + ui.icon('edit') + ' Sửa yêu cầu</button><button class="btn btn-danger" data-cancel-req="' + r.id + '">Hủy yêu cầu</button>' : '') + '<button class="btn btn-outline" data-close>Đóng</button>';
    const m = ui.openModal({ title: r.title, size: 'lg', body: body, footer: foot, autofocus: false });
    m.el.addEventListener('click', async (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.editReq) { m.close(); requestForm(store.find('helpRequests', b.dataset.editReq)); }
      if (b.dataset.cancelReq) {
        if (await ui.confirm({ title: 'Hủy yêu cầu', message: 'Hủy yêu cầu này? Chuyên gia sẽ không còn thấy nó trong hàng chờ.', confirmText: 'Hủy yêu cầu', cancelText: 'Giữ lại', danger: true })) {
          store.update('helpRequests', r.id, { status: 'cancelled', updatedAt: new Date().toISOString() });
          m.close(); ui.toast('Đã hủy yêu cầu.'); list();
        }
      }
    });
  }

  /* ---------- form tạo/sửa yêu cầu hỗ trợ ---------- */
  function requestForm(r) {
    const ss = seasons();
    if (!ss.length) { ui.toast('Bạn cần có mùa vụ đang canh tác để gửi yêu cầu.', 'warn'); return; }
    const m = ui.openModal({
      title: r ? 'Sửa yêu cầu hỗ trợ' : 'Tạo yêu cầu hỗ trợ', size: 'lg',
      body: '<form id="rf" novalidate><div class="form-grid">' +
        ui.field({ name: 'seasonId', label: 'Mùa vụ', type: 'select', options: ss.map((s) => ({ value: s.id, label: s.name + ' — ' + queries.cropName(s.cropId) })), blank: 'Chọn mùa vụ', required: true, value: r ? r.seasonId : (ss.length === 1 ? ss[0].id : '') }) +
        ui.field({ name: 'stage', label: 'Giai đoạn phát triển', type: 'select', options: app.STAGES, blank: 'Chọn giai đoạn', required: true, value: r ? r.stage : (ss.length === 1 ? ss[0].stage : '') }) +
        ui.field({ name: 'title', label: 'Tiêu đề', required: true, value: r ? r.title : '', placeholder: 'Ví dụ: Lá cà chua có đốm nâu', full: true }) +
        ui.field({ name: 'description', label: 'Mô tả vấn đề', type: 'textarea', rows: 4, required: true, value: r ? r.description : '', placeholder: 'Triệu chứng, vị trí, thời điểm bắt đầu, đã xử lý gì…', help: 'Mô tả càng cụ thể, chuyên gia càng dễ đánh giá vấn đề.', full: true }) +
        '<div class="field full"><span class="label">Ảnh minh họa (không bắt buộc)</span><div id="pick"></div></div>' +
        ui.field({ name: 'category', label: 'Nhóm vấn đề', type: 'select', options: app.CATEGORIES, required: true, value: r ? r.category : 'other' }) +
        ui.field({ name: 'priority', label: 'Mức ưu tiên', type: 'select', options: app.PRIORITIES, required: true, value: r ? r.priority : 'medium' }) +
        '</div></form>',
      footer: '<button class="btn btn-outline" data-close>Hủy</button><button class="btn" form="rf" type="submit">' + ui.icon('send') + (r ? ' Lưu thay đổi' : ' Gửi yêu cầu') + '</button>',
      autofocus: false,
    });
    const form = ui.qs('#rf', m.el); ui.clearErrorsOnInput(form);
    const pick = ui.imagePicker(ui.qs('#pick', m.el), r ? r.images : [], 3);
    form.elements.seasonId.addEventListener('change', () => { const s = queries.season(form.elements.seasonId.value); if (s) form.elements.stage.value = s.stage; });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const ok = ui.validate(form, {
        seasonId: { label: 'Mùa vụ', required: true },
        stage: { label: 'Giai đoạn', required: true },
        title: { label: 'Tiêu đề', required: true, min: 8, max: 120 },
        description: { label: 'Mô tả vấn đề', required: true, min: 20, max: 1200 },
        category: { label: 'Nhóm vấn đề', required: true },
      });
      if (!ok) return;
      const d = ui.formData(form), s = queries.season(d.seasonId), now = new Date().toISOString();
      const rec = { seasonId: d.seasonId, cropId: s.cropId, stage: d.stage, title: d.title, description: d.description, category: d.category, priority: d.priority, images: pick.get(), aiResult: null, updatedAt: now };
      let saved;
      if (r) saved = store.update('helpRequests', r.id, rec);
      else {
        saved = store.create('helpRequests', Object.assign({ farmerId: me.id, status: 'pending', expertId: null, responses: [], aiSummary: null, createdAt: now }, rec));
        if (saved) store.notify({ role: 'expert' }, d.priority === 'urgent' ? 'Yêu cầu khẩn cấp mới' : 'Yêu cầu hỗ trợ mới', me.name + ': "' + d.title + '"', 'pages/expert/expert-request-detail.html?id=' + saved.id);
      }
      if (!saved) { ui.toast('Không lưu được: bộ nhớ trình duyệt đã đầy. Hãy xóa bớt ảnh.', 'error'); return; }
      m.close(); ui.toast(r ? 'Đã cập nhật yêu cầu.' : 'Đã gửi yêu cầu. Chuyên gia sẽ thấy yêu cầu trong hàng chờ.'); list();
    });
  }

  view.addEventListener('click', (e) => {
    const t = e.target.closest('button'); if (!t) return;
    if (t.hasAttribute('data-new')) requestForm(null);
    else if (t.dataset.view) detail(t.dataset.view);
  });

  shell();
})();
