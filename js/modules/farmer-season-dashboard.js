/* Tổng quan mùa vụ của nông dân */
(function () {
  const app = window.CM;
  const ui = app.ui;
  const store = app.store;
  const queries = app.q;

  const farmer = app.auth.guard('farmer');
  if (!farmer) return;

  ui.mountShell(farmer);

  const view = ui.qs('#view');

  // Hiển thị các số liệu tổng quan và danh sách gần đây.
  function renderDashboard() {
    const farms = queries.farmsOf(farmer.id);
    const seasons = queries.seasonsOfFarmer(farmer.id);
    const activeSeasons = seasons.filter((season) => season.status === 'active');
    const today = app.today();

    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - 30);
    const dateFromText = dateFrom.toISOString().slice(0, 10);

    const logs = store.where(
      'fieldLogs',
      (log) => log.farmerId === farmer.id && !log.archived
    );
    const requests = store.where(
      'helpRequests',
      (request) => request.farmerId === farmer.id
    );

    const seasonIds = seasons.map((season) => season.id);
    const checklistItems = [];

    store.all('checklists')
      .filter((checklist) => seasonIds.includes(checklist.seasonId))
      .forEach((checklist) => {
        checklist.items.forEach((item) => {
          checklistItems.push(
            Object.assign(
              { seasonId: checklist.seasonId, listId: checklist.id },
              item
            )
          );
        });
      });

    const unfinishedItems = checklistItems.filter((item) => item.status !== 'done');
    const overdueItems = unfinishedItems.filter(
      (item) => item.dueDate && item.dueDate < today
    );
    const openRequests = requests.filter((request) => queries.isOpen(request));

    const noFarmMessage = ui.qs('#dashboard-no-farm', view);
    const dashboardContent = ui.qs('#dashboard-content', view);

    // Nếu chưa có nông hộ thì không hiển thị các số liệu còn lại.
    if (!farms.length) {
      noFarmMessage.innerHTML = '<div class="card">' +
        ui.empty(
          'leaf',
          'Chưa có nông hộ nào',
          'Tài khoản của bạn chưa gắn với nông hộ. Hãy liên hệ quản trị viên hoặc đăng ký lại.'
        ) +
        '</div>';

      noFarmMessage.hidden = false;
      dashboardContent.hidden = true;
      return;
    }

    noFarmMessage.hidden = true;
    dashboardContent.hidden = false;

    ui.qs('#farmer-greeting', view).textContent = 'Xin chào, ' + farmer.name;
    ui.qs('#farm-info', view).textContent =
      farms[0].name + ' · ' + (farms[0].address || 'Chưa cập nhật địa chỉ');

    // Cập nhật bốn thẻ số liệu đầu trang.
    ui.qs('#stat-active-seasons', view).textContent = activeSeasons.length;
    ui.qs('#stat-recent-logs', view).textContent =
      logs.filter((log) => log.date >= dateFromText).length;
    ui.qs('#stat-open-requests', view).textContent = openRequests.length;
    ui.qs('#stat-overdue', view).textContent = overdueItems.length;

    ui.qs('#stat-overdue-card', view).classList.toggle(
      'danger',
      overdueItems.length > 0
    );

    renderActiveSeasons(activeSeasons);
    renderUpcomingTasks(unfinishedItems, today);
    renderExpertReplies(requests);
    renderRecentLogs(logs);
  }

  // Hiển thị các mùa vụ đang canh tác.
  function renderActiveSeasons(seasons) {
    const box = ui.qs('#active-seasons', view);

    if (!seasons.length) {
      box.innerHTML = '<div class="card">' +
        ui.empty(
          'leaf',
          'Chưa có mùa vụ đang canh tác',
          'Tạo mùa vụ để bắt đầu ghi nhật ký và lập checklist.',
          '<a class="btn" href="farmer-seasons.html">Tạo mùa vụ</a>'
        ) +
        '</div>';

      return;
    }

    box.innerHTML = '<div class="card-grid">' +
      seasons.map((season) => {
        const progress = queries.progressOf(season.id);
        const daysLeft = ui.daysFromToday(season.endDate);
        const field = store.find('fields', season.fieldId);

        return '<article class="card card-pad stack" style="gap:10px">' +
          '<div class="row spread">' +
            '<h3>' + ui.esc(season.name) + '</h3>' +
            ui.mapBadge(ui.SEASON_STATUS, season.status) +
          '</div>' +

          '<p class="small muted">' +
            ui.esc(queries.cropName(season.cropId)) + ' · ' +
            ui.esc(field ? field.name + ' (' + field.area + ' ha)' : '—') +
          '</p>' +

          '<div class="row spread small">' +
            '<span>Giai đoạn: <strong>' + ui.esc(season.stage) + '</strong></span>' +
            '<span class="muted">' +
              (daysLeft >= 0
                ? 'Còn ' + daysLeft + ' ngày'
                : 'Quá hạn ' + Math.abs(daysLeft) + ' ngày') +
            '</span>' +
          '</div>' +

          '<div>' +
            '<div class="row spread small" style="margin-bottom:4px">' +
              '<span>Tiến độ checklist</span>' +
              '<span>' +
                (progress.total
                  ? progress.done + '/' + progress.total + ' việc'
                  : 'Chưa có checklist') +
              '</span>' +
            '</div>' +

            '<div class="progress ' + (progress.overdue ? 'warn' : '') +
              '" role="progressbar" aria-valuenow="' + progress.pct +
              '" aria-valuemin="0" aria-valuemax="100" aria-label="Tiến độ checklist ' +
              ui.esc(season.name) + '">' +
              '<span style="width:' + progress.pct + '%"></span>' +
            '</div>' +
          '</div>' +

          (progress.overdue
            ? '<p class="small" style="color:var(--danger)">' +
              progress.overdue + ' việc trễ hạn</p>'
            : '') +

          '<div class="row">' +
            '<a class="btn btn-sm btn-outline" href="farmer-field-log.html?season=' +
              season.id + '">Nhật ký</a>' +
            '<a class="btn btn-sm btn-outline" href="farmer-checklist.html?season=' +
              season.id + '">Checklist</a>' +
          '</div>' +
        '</article>';
      }).join('') +
    '</div>';
  }

  // Hiển thị tối đa sáu việc chưa hoàn thành.
  function renderUpcomingTasks(items, today) {
    const box = ui.qs('#upcoming-tasks', view);
    const upcomingItems = items.slice()
      .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1))
      .slice(0, 6);

    if (!upcomingItems.length) {
      box.innerHTML = ui.empty(
        'check',
        'Không có việc tồn đọng',
        'Bạn đã hoàn thành các việc trong checklist.'
      );

      return;
    }

    box.innerHTML = '<div>' +
      upcomingItems.map((item) => {
        const isLate = item.dueDate && item.dueDate < today;

        return '<div class="task">' +
          '<input type="checkbox" data-done="' + item.listId + '|' + item.id +
            '" aria-label="Đánh dấu hoàn thành: ' + ui.esc(item.title) + '">' +
          '<div>' +
            '<div class="t-title strong">' + ui.esc(item.title) + '</div>' +
            '<div class="small muted">' + ui.esc(queries.seasonName(item.seasonId)) + '</div>' +
          '</div>' +
          '<div class="small" style="text-align:right;color:' +
            (isLate ? 'var(--danger)' : 'var(--muted)') + '">' +
            ui.fmtDate(item.dueDate) +
            (isLate ? '<br><strong>Trễ hạn</strong>' : '') +
          '</div>' +
        '</div>';
      }).join('') +
    '</div>';
  }

  // Hiển thị các phản hồi gần đây nhất của chuyên gia.
  function renderExpertReplies(requests) {
    const box = ui.qs('#expert-replies', view);
    const repliedRequests = requests
      .filter((request) => request.responses && request.responses.length)
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
      .slice(0, 4);

    if (!repliedRequests.length) {
      box.innerHTML = ui.empty(
        'lifebuoy',
        'Chưa có phản hồi',
        'Khi gửi yêu cầu hỗ trợ, phản hồi của chuyên gia sẽ hiển thị tại đây.',
        '<a class="btn" href="farmer-help-request.html?new=1">Gửi yêu cầu</a>'
      );

      return;
    }

    box.innerHTML = '<ul class="list">' +
      repliedRequests.map((request) => {
        const lastResponse = request.responses[request.responses.length - 1];

        return '<li>' +
          '<div>' +
            '<a class="strong" href="farmer-help-request.html?id=' + request.id + '">' +
              ui.esc(request.title) +
            '</a>' +
            '<p class="small muted">' +
              ui.esc(queries.userName(lastResponse.expertId)) + ' · ' +
              ui.fmtDateTime(lastResponse.date) +
            '</p>' +
            '<p class="small">' +
              ui.esc(
                lastResponse.text.length > 110
                  ? lastResponse.text.slice(0, 110) + '…'
                  : lastResponse.text
              ) +
            '</p>' +
          '</div>' +
          ui.mapBadge(ui.REQ_STATUS, request.status) +
        '</li>';
      }).join('') +
    '</ul>';
  }

  // Hiển thị năm nhật ký gần đây nhất.
  function renderRecentLogs(logs) {
    const box = ui.qs('#recent-logs', view);
    const recentLogs = logs.slice()
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, 5);

    if (!recentLogs.length) {
      box.innerHTML = ui.empty(
        'book',
        'Chưa có nhật ký',
        'Hãy ghi hoạt động đầu tiên của mùa vụ.',
        '<a class="btn" href="farmer-field-log.html?new=1">Ghi nhật ký</a>'
      );

      return;
    }

    box.innerHTML = '<div class="table-wrap">' +
      '<table class="data">' +
        '<thead><tr><th>Ngày</th><th>Mùa vụ</th><th>Hoạt động</th><th>Ghi chú</th></tr></thead>' +
        '<tbody>' +
          recentLogs.map((log) =>
            '<tr>' +
              '<td>' + ui.fmtDate(log.date) + '</td>' +
              '<td>' + ui.esc(queries.seasonName(log.seasonId)) + '</td>' +
              '<td>' + ui.badge('plain', log.activity) + '</td>' +
              '<td>' + ui.esc(log.note) + '</td>' +
            '</tr>'
          ).join('') +
        '</tbody>' +
      '</table>' +
    '</div>';
  }

  // Đánh dấu hoàn thành công việc ngay trên trang tổng quan.
  view.addEventListener('change', (event) => {
    const checkbox = event.target.closest('[data-done]');
    if (!checkbox) return;

    const parts = checkbox.dataset.done.split('|');
    const checklist = store.find('checklists', parts[0]);

    if (!checklist) return;

    checklist.items.forEach((item) => {
      if (item.id === parts[1]) {
        item.status = 'done';
      }
    });

    store.update('checklists', checklist.id, {
      items: checklist.items,
      updatedAt: app.today()
    });

    ui.toast('Đã đánh dấu hoàn thành công việc.');
    renderDashboard();
  });

  renderDashboard();
})();
