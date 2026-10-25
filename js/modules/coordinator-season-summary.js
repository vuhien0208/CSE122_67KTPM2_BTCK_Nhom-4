/* Trang Coordinator - Tong ket mua vu.
   JS giu nguyen logic cu: tim kiem, loc trang thai, them/sua/xoa/xem bao cao.
   Chi thay Bootstrap modal bang the <dialog> chung va dung class badge/btn chung. */

// Kiem tra dang nhap + ve lai sidebar/topbar dung nguoi dung
(function () {
    const me = CM.auth.guard('coordinator');
    if (!me) return;
    CM.ui.mountShell(me);
})();

// Du lieu ban dau cua cac bao cao tong ket
let reportsData = [
    {
        id: 1,
        title: "Báo cáo tổng kết Lúa Hè Thu 2026",
        season: "Lúa Hè Thu 2026",
        yield: "6.2 tấn/ha",
        status: "Đã chốt",
        date: "01/08/2026",
        note: "Vụ mùa đạt năng suất cao, thời tiết thuận lợi, hoàn thành đúng tiến độ."
    }
];

document.addEventListener("DOMContentLoaded", function () {
    renderReportsTable();
});

// ----- Cac ham mo/dong modal <dialog> -----

function openModal(id) {
    const dlg = document.getElementById(id);
    if (dlg && !dlg.open) dlg.showModal();
}

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

// Render danh sach bao cao ra bang (co ho tro tim kiem va loc trang thai)
function renderReportsTable() {
    const tbody = document.getElementById("reportTableBody");
    const searchTerm = document.getElementById("searchReportInput").value.toLowerCase().trim();
    const statusFilter = document.getElementById("statusReportFilter").value.trim();

    const filtered = reportsData.filter(function (rep) {
        const matchText = (rep.title + " " + rep.season + " " + rep.note).toLowerCase().includes(searchTerm);
        const matchStatus = (statusFilter === "all") || (rep.status === statusFilter);
        return matchText && matchStatus;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5"><div class="empty" style="padding:24px 16px"><p>Không tìm thấy báo cáo nào phù hợp.</p></div></td></tr>';
        return;
    }

    let html = "";
    filtered.forEach(function (rep) {
        const badgeHTML = rep.status === "Đã chốt"
            ? '<span class="badge ok">Đã chốt</span>'
            : '<span class="badge warn">Nháp</span>';

        html += '<tr data-status="' + rep.status + '">' +
            "<td><strong>" + rep.title + "</strong>" +
            '<span class="sub">' + rep.season + "</span></td>" +
            "<td>" + rep.yield + "</td>" +
            "<td>" + badgeHTML + "</td>" +
            "<td>" + rep.date + "</td>" +
            "<td>" +
            '<div class="actions">' +
            '<button class="btn btn-sm btn-outline" type="button" onclick="viewReport(' + rep.id + ')">Xem</button>' +
            '<button class="btn btn-sm btn-outline" type="button" onclick="editReport(' + rep.id + ')">Sửa</button>' +
            '<button class="btn btn-sm btn-danger" type="button" onclick="deleteReport(' + rep.id + ')">Xóa</button>' +
            "</div></td>" +
            "</tr>";
    });
    tbody.innerHTML = html;
}

// Mo modal tao bao cao moi
function openCreateReportModal() {
    document.getElementById("reportModalTitle").innerText = "Lập báo cáo tổng kết mùa vụ";
    document.getElementById("reportEditId").value = "";
    document.getElementById("modalYieldInput").value = "";
    document.getElementById("modalNoteInput").value = "";
    document.getElementById("modalStatusInput").value = "Đã chốt";

    openModal("reportModal");
}

// Lap bao cao nhanh tu nut "Lap bao cao" o bang so lieu mua vu phia tren
function generateReportFromSeason(seasonName) {
    openCreateReportModal();
    document.getElementById("modalSeasonSelect").value = seasonName;
}

// Luu bao cao (Xu ly ca Them moi va Chinh sua)
function saveReportData() {
    const editId = document.getElementById("reportEditId").value;
    const season = document.getElementById("modalSeasonSelect").value;
    const yieldVal = document.getElementById("modalYieldInput").value.trim();
    const status = document.getElementById("modalStatusInput").value;
    const note = document.getElementById("modalNoteInput").value.trim();

    if (!yieldVal) {
        alert("Vui lòng nhập năng suất ước tính!");
        return;
    }

    const today = new Date();
    const dateStr = String(today.getDate()).padStart(2, "0") + "/" + String(today.getMonth() + 1).padStart(2, "0") + "/" + today.getFullYear();

    if (editId === "") {
        // Tao moi
        const newReport = {
            id: Date.now(),
            title: "Báo cáo tổng kết " + season,
            season: season,
            yield: yieldVal,
            status: status,
            date: dateStr,
            note: note || "Chưa có nhận xét chi tiết."
        };
        reportsData.push(newReport);
        alert("Đã tạo và lưu báo cáo thành công!");
    } else {
        // Cap nhat
        const idNum = parseInt(editId);
        const report = reportsData.find(function (r) { return r.id === idNum; });
        if (report) {
            report.season = season;
            report.title = "Báo cáo tổng kết " + season;
            report.yield = yieldVal;
            report.status = status;
            report.note = note;
        }
        alert("Đã cập nhật báo cáo thành công!");
    }

    // Dong modal va lam moi bang
    closeModal("reportModal");
    renderReportsTable();
}

// Xem chi tiet bao cao
function viewReport(id) {
    const report = reportsData.find(function (r) { return r.id === id; });
    if (!report) return;

    document.getElementById("viewReportTitle").innerText = report.title;
    document.getElementById("viewReportSeason").innerText = report.season;
    document.getElementById("viewReportYield").innerText = report.yield;
    document.getElementById("viewReportStatus").innerText = report.status;
    document.getElementById("viewReportDate").innerText = report.date;
    document.getElementById("viewReportNote").innerText = report.note;

    openModal("viewReportModal");
}

// Mo modal chinh sua bao cao
function editReport(id) {
    const report = reportsData.find(function (r) { return r.id === id; });
    if (!report) return;

    document.getElementById("reportModalTitle").innerText = "Chỉnh sửa báo cáo tổng kết";
    document.getElementById("reportEditId").value = report.id;
    document.getElementById("modalSeasonSelect").value = report.season;
    document.getElementById("modalYieldInput").value = report.yield;
    document.getElementById("modalStatusInput").value = report.status;
    document.getElementById("modalNoteInput").value = report.note;

    openModal("reportModal");
}

// Xoa bao cao
function deleteReport(id) {
    if (confirm("Bạn có chắc chắn muốn xóa báo cáo tổng kết này không?")) {
        reportsData = reportsData.filter(function (r) { return r.id !== id; });
        renderReportsTable();
    }
}
