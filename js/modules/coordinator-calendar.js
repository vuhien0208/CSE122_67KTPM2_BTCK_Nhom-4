let eventsData = [
    { id: 1, title: "Tỉa lá già và chồi nách", farm: "Vườn rau Mai Hương", date: "2026-10-19", type: "task", status: "late", daysLate: 6, season: "Cà chua đông 2026" },
    { id: 2, title: "Tổng kết vụ Hè Thu", farm: "HTX Điều phối", date: "2026-10-20", type: "meeting", status: "warning" },
    { id: 3, title: "Kiểm tra rầy và sâu cuốn lá", farm: "Trang trại Hải Lúa", date: "2026-10-21", type: "task", status: "late", daysLate: 4, season: "Lúa Thu Đông 2026" },
    { id: 4, title: "Phun phòng bệnh sau mưa", farm: "Vườn rau Mai Hương", date: "2026-10-23", type: "task", status: "late", daysLate: 2, season: "Cà chua đông 2026" },
    { id: 5, title: "Lịch tưới đợt 2 - Cà chua", farm: "Vườn rau Mai Hương", date: "2026-10-26", type: "task", status: "normal" },
    { id: 6, title: "Họp điều phối tuần tới", farm: "HTX Điều phối", date: "2026-10-27", type: "meeting", status: "warning" },
    { id: 7, title: "Kiểm tra đồng ruộng", farm: "Trang trại Hải Lúa", date: "2026-10-29", type: "task", status: "normal" },
    { id: 8, title: "Bón thúc đợt 2 (đón đòng)", farm: "Trang trại Hải Lúa", date: "2026-10-29", type: "task", status: "info" },
    { id: 9, title: "Bón thúc kali", farm: "Vườn rau Mai Hương", date: "2026-10-30", type: "task", status: "info" }
];

// Trạng thái tháng/năm hiện tại (Khởi đầu ở tháng 10 năm 2026)
let currentYear = 2026;
let currentMonth = 10; // 1 đến 12
let selectedDate = "2026-10-25";

document.addEventListener("DOMContentLoaded", function() {
    renderCalendar();
    renderLateTasks();
    renderDayDetail(selectedDate);
});

// Hàm chuyển đổi tháng (direction: -1 là lùi tháng, +1 là tiến tháng)
function changeMonth(direction) {
    currentMonth += direction;
    if (currentMonth > 12) {
        currentMonth = 1;
        currentYear++;
    } else if (currentMonth < 1) {
        currentMonth = 12;
        currentYear--;
    }
    renderCalendar();
}

// Nút "Hôm nay" quay về tháng hiện tại (Tháng 10/2026 theo demo)
function goToToday() {
    currentYear = 2026;
    currentMonth = 10;
    selectedDate = "2026-10-25";
    renderCalendar();
    renderDayDetail(selectedDate);
}

// Render lưới lịch động theo tháng/năm
function renderCalendar() {
    const labelEl = document.getElementById("currentMonthLabel");
    labelEl.innerText = `Tháng ${currentMonth}, ${currentYear}`;

    const grid = document.getElementById("calendarGrid");
    const headersHTML = `
        <div class="calendar-header">T2</div>
        <div class="calendar-header">T3</div>
        <div class="calendar-header">T4</div>
        <div class="calendar-header">T5</div>
        <div class="calendar-header">T6</div>
        <div class="calendar-header">T7</div>
        <div class="calendar-header">CN</div>
    `;

    // Tính số ngày trong tháng hiện tại
    let totalDays = new Date(currentYear, currentMonth, 0).getDate();

    // Tính ngày trong tuần của ngày mùng 1 (0: Chủ Nhật, 1: Thứ Hai, ...)
    let firstDayIndex = new Date(currentYear, currentMonth - 1, 1).getDay();
    // Quy đổi về chuẩn T2 là đầu tuần (T2=0, T3=1, ..., CN=6)
    let emptySpaces = (firstDayIndex === 0) ? 6 : firstDayIndex - 1;

    let daysHTML = "";
    // Điền các ô trống đầu tháng
    for (let i = 0; i < emptySpaces; i++) {
        daysHTML += `<div class="calendar-day text-muted bg-light"></div>`;
    }

    const filterFarm = document.getElementById("filterFarm").value;
    const filterType = document.getElementById("filterType").value;

    // Điền các ngày trong tháng
    for (let i = 1; i <= totalDays; i++) {
        let mStr = currentMonth < 10 ? `0${currentMonth}` : `${currentMonth}`;
        let dStr = i < 10 ? `0${i}` : `${i}`;
        let fullDate = `${currentYear}-${mStr}-${dStr}`;
        let isToday = (fullDate === selectedDate);

        // Lọc sự kiện
        let dayEvents = eventsData.filter(ev => {
            if (ev.date !== fullDate) return false;
            if (filterFarm !== "all" && ev.farm !== filterFarm && ev.farm !== "HTX Điều phối") return false;
            if (filterType !== "all" && ev.type !== filterType) return false;
            return true;
        });

        let eventsTagsHTML = dayEvents.map(ev => {
            let badgeClass = "event-normal";
            if (ev.status === "late") badgeClass = "event-late";
            else if (ev.status === "warning") badgeClass = "event-warning";
            else if (ev.status === "info") badgeClass = "event-info";

            return `<div class="event-tag ${badgeClass}" title="${ev.title}" onclick="event.stopPropagation();">${ev.title}</div>`;
        }).join("");

        daysHTML += `
            <div class="calendar-day ${isToday ? 'active-today' : ''}" onclick="selectDate('${fullDate}')">
                <span class="day-num ${isToday ? 'text-success fw-bold' : ''}">${i}</span>
                ${eventsTagsHTML}
            </div>
        `;
    }

    grid.innerHTML = headersHTML + daysHTML;
}

// Khi click vào một ô ngày trên lịch
function selectDate(dateStr) {
    selectedDate = dateStr;
    renderCalendar();
    renderDayDetail(dateStr);
}

// Hiển thị chi tiết sự kiện ngày được chọn
function renderDayDetail(dateStr) {
    const titleEl = document.getElementById("selectedDateTitle");
    const container = document.getElementById("dayDetailContainer");

    let parts = dateStr.split("-");
    titleEl.innerText = `Ngày ${parts[2]}/${parts[1]}/${parts[0]}`;

    let dayEvents = eventsData.filter(ev => ev.date === dateStr);

    if (dayEvents.length === 0) {
        container.innerHTML = `
            <div class="text-center py-3">
                <div class="rounded-circle bg-light d-inline-flex align-items-center justify-content-center mb-2" style="width: 50px; height: 50px;">
                    <i class="fa-regular fa-calendar-plus fs-4 text-success"></i>
                </div>
                <h6 class="fw-bold text-dark mb-1">Không có hoạt động</h6>
                <p class="text-muted mb-0" style="font-size: 0.85rem;">Thêm sự kiện cho ngày này.</p>
            </div>
        `;
    } else {
        let html = `<div class="list-group list-group-flush">`;
        dayEvents.forEach((ev) => {
            let globalIndex = eventsData.findIndex(item => item.id === ev.id);
            html += `
                <div class="list-group-item px-0 py-2 d-flex justify-content-between align-items-center border-bottom">
                    <div>
                        <div class="fw-bold text-dark">${ev.title}</div>
                        <div class="text-muted" style="font-size: 0.8rem;">${ev.farm} ${ev.season ? '· ' + ev.season : ''}</div>
                    </div>
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-outline-primary py-0 px-2" onclick="editEvent(${globalIndex})"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn btn-sm btn-outline-danger py-0 px-2" onclick="deleteEvent(${globalIndex})"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            `;
        });
        html += `</div>`;
        container.innerHTML = html;
    }
}

// Render danh sách việc trễ hạn
function renderLateTasks() {
    const listEl = document.getElementById("lateTasksList");
    let lateEvents = eventsData.filter(ev => ev.status === "late");

    if (lateEvents.length === 0) {
        listEl.innerHTML = `<p class="text-muted text-center py-3">Không có công việc trễ hạn.</p>`;
        return;
    }

    let html = "";
    lateEvents.forEach(ev => {
        html += `
            <div class="list-group-item px-0 py-3 d-flex justify-content-between align-items-start border-bottom">
                <div>
                    <div class="fw-bold text-dark mb-1">${ev.title}</div>
                    <div class="text-muted" style="font-size: 0.8rem;">${ev.farm} · ${ev.season || 'Canh tác chung'}</div>
                </div>
                <span class="text-danger fw-bold text-nowrap ms-2" style="font-size: 0.8rem;">Trễ ${ev.daysLate || 2} ngày</span>
            </div>
        `;
    });
    listEl.innerHTML = html;
}

// Mở modal thêm sự kiện
function openAddEventModal() {
    document.getElementById("modalTitle").innerHTML = `<i class="fa-solid fa-plus me-2"></i> Thêm sự kiện mới`;
    document.getElementById("eventIndex").value = "";
    document.getElementById("eventTitleInput").value = "";
    document.getElementById("eventDateInput").value = selectedDate;
    document.getElementById("eventFarmInput").value = "HTX Điều phối";
    document.getElementById("eventTypeInput").value = "task";

    var modal = new bootstrap.Modal(document.getElementById('eventModal'));
    modal.show();
}

function openAddEventForSelectedDate() {
    openAddEventModal();
}

// Lưu dữ liệu sự kiện
function saveEventData() {
    let index = document.getElementById("eventIndex").value;
    let title = document.getElementById("eventTitleInput").value.trim();
    let farm = document.getElementById("eventFarmInput").value;
    let date = document.getElementById("eventDateInput").value;
    let type = document.getElementById("eventTypeInput").value;

    if (!title || !date) {
        alert("Vui lòng nhập đầy đủ tên sự kiện và ngày thực hiện!");
        return;
    }

    if (index === "") {
        let newEvent = {
            id: Date.now(),
            title: title,
            farm: farm,
            date: date,
            type: type,
            status: "normal"
        };
        eventsData.push(newEvent);
    } else {
        let idx = parseInt(index);
        eventsData[idx].title = title;
        eventsData[idx].farm = farm;
        eventsData[idx].date = date;
        eventsData[idx].type = type;
    }

    var modalEl = document.getElementById('eventModal');
    var modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();

    // Nếu ngày sự kiện thêm nằm ở tháng khác, tự động chuyển tháng sang ngày đó để thấy ngay
    let parts = date.split("-");
    currentYear = parseInt(parts[0]);
    currentMonth = parseInt(parts[1]);
    selectedDate = date;

    renderCalendar();
    renderLateTasks();
    renderDayDetail(selectedDate);
}

// Chỉnh sửa sự kiện
function editEvent(index) {
    let ev = eventsData[index];
    document.getElementById("modalTitle").innerHTML = `<i class="fa-solid fa-pen me-2"></i> Chỉnh sửa sự kiện`;
    document.getElementById("eventIndex").value = index;
    document.getElementById("eventTitleInput").value = ev.title;
    document.getElementById("eventDateInput").value = ev.date;
    document.getElementById("eventFarmInput").value = ev.farm;
    document.getElementById("eventTypeInput").value = ev.type;

    var modal = new bootstrap.Modal(document.getElementById('eventModal'));
    modal.show();
}

// Xóa sự kiện
function deleteEvent(index) {
    if (confirm("Bạn có chắc chắn muốn xóa sự kiện này không?")) {
        eventsData.splice(index, 1);
        renderCalendar();
        renderLateTasks();
        renderDayDetail(selectedDate);
    }
}