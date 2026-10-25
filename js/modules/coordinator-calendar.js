/* Trang Coordinator - Lich hoat dong.
   JS giu nguyen logic cu: doi thang, chon ngay, them/sua/xoa su kien,
   loc theo nong ho va loai. Chi thay Bootstrap modal bang the <dialog> chung. */

// Kiem tra dang nhap + ve lai sidebar/topbar dung nguoi dung
(function () {
    const me = CM.auth.guard('coordinator');
    if (!me) return;
    CM.ui.mountShell(me);
})();

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

// Trang thai thang/nam hien tai (Khoi dau o thang 10 nam 2026)
let currentYear = 2026;
let currentMonth = 10; // 1 den 12
let selectedDate = "2026-10-25";

document.addEventListener("DOMContentLoaded", function () {
    renderCalendar();
    renderLateTasks();
    renderDayDetail(selectedDate);
});

// ----- Cac ham mo/dong modal <dialog> -----

// Mo modal theo id
function openModal(id) {
    const dlg = document.getElementById(id);
    if (dlg && !dlg.open) dlg.showModal();
}

// Dong modal theo id
function closeModal(id) {
    const dlg = document.getElementById(id);
    if (dlg && dlg.open) dlg.close();
}

// Bam vao vung mo (backdrop) thi dong modal
document.addEventListener("click", function (e) {
    if (e.target.classList && e.target.classList.contains("modal")) {
        e.target.close();
    }
});

// Ham chuyen doi thang (direction: -1 la lui thang, +1 la tien thang)
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

// Nut "Hom nay" quay ve thang hien tai (Thang 10/2026 theo demo)
function goToToday() {
    currentYear = 2026;
    currentMonth = 10;
    selectedDate = "2026-10-25";
    renderCalendar();
    renderDayDetail(selectedDate);
}

// Render lich bang bang .cal cua giao dien chung
function renderCalendar() {
    const labelEl = document.getElementById("currentMonthLabel");
    labelEl.innerText = "Tháng " + currentMonth + ", " + currentYear;

    const grid = document.getElementById("calendarGrid");

    // So ngay trong thang hien tai
    const totalDays = new Date(currentYear, currentMonth, 0).getDate();

    // Ngay trong tuan cua ngay mung 1 (0: Chu Nhat, 1: Thu Hai, ...)
    const firstDayIndex = new Date(currentYear, currentMonth - 1, 1).getDay();
    // Quy doi ve chuan Thu Hai la dau tuan (T2=0, T3=1, ..., CN=6)
    const emptySpaces = (firstDayIndex === 0) ? 6 : firstDayIndex - 1;

    const filterFarm = document.getElementById("filterFarm").value;
    const filterType = document.getElementById("filterType").value;

    let html = '<table class="cal"><thead><tr>';
    html += "<th>T2</th><th>T3</th><th>T4</th><th>T5</th><th>T6</th><th>T7</th><th>CN</th>";
    html += "</tr></thead><tbody><tr>";

    // Cac o trong dau thang
    for (let i = 0; i < emptySpaces; i++) {
        html += '<td class="out"></td>';
    }

    // Cac ngay trong thang
    for (let d = 1; d <= totalDays; d++) {
        const mStr = currentMonth < 10 ? "0" + currentMonth : "" + currentMonth;
        const dStr = d < 10 ? "0" + d : "" + d;
        const fullDate = currentYear + "-" + mStr + "-" + dStr;
        const isToday = (fullDate === selectedDate);

        // Loc su kien theo nong ho va loai
        const dayEvents = eventsData.filter(function (ev) {
            if (ev.date !== fullDate) return false;
            if (filterFarm !== "all" && ev.farm !== filterFarm && ev.farm !== "HTX Điều phối") return false;
            if (filterType !== "all" && ev.type !== filterType) return false;
            return true;
        });

        // Mau chip su kien theo trang thai (dung class .ev cua giao dien chung)
        const tagsHTML = dayEvents.map(function (ev) {
            let cls = "ev";
            if (ev.status === "late") cls += " late";       // Tre han: do
            else if (ev.status === "warning") cls += " meeting"; // Hop/canh bao: vang
            else if (ev.status === "info") cls += " task";  // Thong tin: xanh duong
            return '<span class="' + cls + '" title="' + ev.title + '">' + ev.title + "</span>";
        }).join("");

        html += '<td class="' + (isToday ? "today sel" : "") + '">' +
            '<button type="button" class="daybtn" onclick="selectDate(\'' + fullDate + '\')">' +
            '<span class="dn">' + d + "</span>" + tagsHTML +
            "</button></td>";

        // Het tuan thi xuong hang
        const cellIndex = emptySpaces + d - 1;
        if ((cellIndex + 1) % 7 === 0 && d < totalDays) {
            html += "</tr><tr>";
        }
    }

    // Cac o trong cuoi thang cho du hang
    const totalCells = emptySpaces + totalDays;
    const trailing = (7 - (totalCells % 7)) % 7;
    for (let i = 0; i < trailing; i++) {
        html += '<td class="out"></td>';
    }

    html += "</tr></tbody></table>";
    grid.innerHTML = html;
}

// Khi click vao mot o ngay tren lich
function selectDate(dateStr) {
    selectedDate = dateStr;
    renderCalendar();
    renderDayDetail(dateStr);
}

// Hien thi chi tiet su kien ngay duoc chon
function renderDayDetail(dateStr) {
    const titleEl = document.getElementById("selectedDateTitle");
    const container = document.getElementById("dayDetailContainer");

    const parts = dateStr.split("-");
    titleEl.innerText = "Ngày " + parts[2] + "/" + parts[1] + "/" + parts[0];

    const dayEvents = eventsData.filter(function (ev) { return ev.date === dateStr; });

    if (dayEvents.length === 0) {
        container.innerHTML =
            '<div class="empty">' +
            '<div class="ico"><svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg></div>' +
            "<h3>Không có hoạt động</h3>" +
            "<p>Thêm sự kiện cho ngày này.</p>" +
            "</div>";
        return;
    }

    let html = '<ul class="list">';
    dayEvents.forEach(function (ev) {
        const globalIndex = eventsData.findIndex(function (item) { return item.id === ev.id; });
        html += "<li>" +
            "<div><strong>" + ev.title + "</strong>" +
            '<div class="small muted">' + ev.farm + (ev.season ? " · " + ev.season : "") + "</div></div>" +
            '<div class="row" style="gap:6px">' +
            '<button class="btn btn-sm btn-outline" type="button" onclick="editEvent(' + globalIndex + ')">Sửa</button>' +
            '<button class="btn btn-sm btn-danger" type="button" onclick="deleteEvent(' + globalIndex + ')">Xóa</button>' +
            "</div></li>";
    });
    html += "</ul>";
    container.innerHTML = html;
}

// Render danh sach viec tre han
function renderLateTasks() {
    const listEl = document.getElementById("lateTasksList");
    const lateEvents = eventsData.filter(function (ev) { return ev.status === "late"; });

    if (lateEvents.length === 0) {
        listEl.innerHTML = '<li><p class="small muted" style="padding:4px 0">Không có công việc trễ hạn.</p></li>';
        return;
    }

    let html = "";
    lateEvents.forEach(function (ev) {
        html += "<li>" +
            "<div><strong>" + ev.title + "</strong>" +
            '<div class="small muted">' + ev.farm + " · " + (ev.season || "Canh tác chung") + "</div></div>" +
            '<span class="badge danger">Trễ ' + (ev.daysLate || 2) + " ngày</span>" +
            "</li>";
    });
    listEl.innerHTML = html;
}

// Mo modal them su kien
function openAddEventModal() {
    document.getElementById("eventModalTitle").innerText = "Thêm sự kiện mới";
    document.getElementById("eventIndex").value = "";
    document.getElementById("eventTitleInput").value = "";
    document.getElementById("eventDateInput").value = selectedDate;
    document.getElementById("eventFarmInput").value = "HTX Điều phối";
    document.getElementById("eventTypeInput").value = "task";

    openModal("eventModal");
}

function openAddEventForSelectedDate() {
    openAddEventModal();
}

// Luu du lieu su kien
function saveEventData() {
    const index = document.getElementById("eventIndex").value;
    const title = document.getElementById("eventTitleInput").value.trim();
    const farm = document.getElementById("eventFarmInput").value;
    const date = document.getElementById("eventDateInput").value;
    const type = document.getElementById("eventTypeInput").value;

    if (!title || !date) {
        alert("Vui lòng nhập đầy đủ tên sự kiện và ngày thực hiện!");
        return;
    }

    if (index === "") {
        const newEvent = {
            id: Date.now(),
            title: title,
            farm: farm,
            date: date,
            type: type,
            status: "normal"
        };
        eventsData.push(newEvent);
    } else {
        const idx = parseInt(index);
        eventsData[idx].title = title;
        eventsData[idx].farm = farm;
        eventsData[idx].date = date;
        eventsData[idx].type = type;
    }

    closeModal("eventModal");

    // Neu ngay su kien nam o thang khac, tu dong chuyen thang sang ngay do de thay ngay
    const parts = date.split("-");
    currentYear = parseInt(parts[0]);
    currentMonth = parseInt(parts[1]);
    selectedDate = date;

    renderCalendar();
    renderLateTasks();
    renderDayDetail(selectedDate);
}

// Chinh sua su kien
function editEvent(index) {
    const ev = eventsData[index];
    document.getElementById("eventModalTitle").innerText = "Chỉnh sửa sự kiện";
    document.getElementById("eventIndex").value = index;
    document.getElementById("eventTitleInput").value = ev.title;
    document.getElementById("eventDateInput").value = ev.date;
    document.getElementById("eventFarmInput").value = ev.farm;
    document.getElementById("eventTypeInput").value = ev.type;

    openModal("eventModal");
}

// Xoa su kien
function deleteEvent(index) {
    if (confirm("Bạn có chắc chắn muốn xóa sự kiện này không?")) {
        eventsData.splice(index, 1);
        renderCalendar();
        renderLateTasks();
        renderDayDetail(selectedDate);
    }
}
