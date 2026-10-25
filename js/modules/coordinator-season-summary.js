// Dữ liệu ban đầu của các báo cáo tổng kết
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

document.addEventListener("DOMContentLoaded", function() {
    renderReportsTable();
});

// Render danh sách báo cáo ra bảng (có hỗ trợ tìm kiếm và lọc trạng thái)
function renderReportsTable() {
    const tbody = document.getElementById("reportTableBody");
    const searchTerm = document.getElementById("searchReportInput").value.toLowerCase().trim();
    const statusFilter = document.getElementById("statusReportFilter").value.trim();

    let filtered = reportsData.filter(rep => {
        let matchText = (rep.title + " " + rep.season + " " + rep.note).toLowerCase().includes(searchTerm);
        let matchStatus = (statusFilter === "all") || (rep.status === statusFilter);
        return matchText && matchStatus;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">Không tìm thấy báo cáo nào phù hợp.</td></tr>`;
        return;
    }

    let html = "";
    filtered.forEach(rep => {
        let badgeClass = rep.status === "Đã chốt" ? "bg-success text-success bg-opacity-10" : "bg-warning text-dark bg-opacity-10";
        let dotColor = rep.status === "Đã chốt" ? "text-success" : "text-warning";

        html += `
            <tr data-status="${rep.status}">
                <td>
                    <div class="fw-bold text-dark">${rep.title}</div>
                    <div class="text-muted" style="font-size: 0.78rem;">${rep.season}</div>
                </td>
                <td>${rep.yield}</td>
                <td>
                    <span class="badge ${badgeClass} px-2 py-1" style="font-size: 0.8rem; font-weight: 500;">
                        <i class="fa-solid fa-circle ${dotColor} me-1" style="font-size: 0.4rem;"></i> ${rep.status}
                    </span>
                </td>
                <td>${rep.date}</td>
                <td class="text-end">
                    <button class="btn btn-outline-secondary btn-sm px-2 py-1 me-1" style="border-radius: 6px; font-size: 0.85rem;" onclick="viewReport(${rep.id})"><i class="fa-regular fa-eye me-1"></i> Xem</button>
                    <button class="btn btn-outline-primary btn-sm px-2 py-1 me-1" style="border-radius: 6px; font-size: 0.85rem;" onclick="editReport(${rep.id})"><i class="fa-solid fa-pen me-1"></i> Sửa</button>
                    <button class="btn btn-outline-danger btn-sm px-2 py-1" style="border-radius: 6px; font-size: 0.85rem;" onclick="deleteReport(${rep.id})"><i class="fa-solid fa-trash me-1"></i> Xóa</button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

// Mở modal tạo báo cáo mới
function openCreateReportModal() {
    document.getElementById("reportModalTitle").innerHTML = `<i class="fa-solid fa-chart-column me-2"></i> Lập báo cáo tổng kết mùa vụ`;
    document.getElementById("reportEditId").value = "";
    document.getElementById("modalYieldInput").value = "";
    document.getElementById("modalNoteInput").value = "";
    document.getElementById("modalStatusInput").value = "Đã chốt";

    var modal = new bootstrap.Modal(document.getElementById('reportModal'));
    modal.show();
}

// Lập báo cáo nhanh từ nút "Lập báo cáo" ở bảng số liệu mùa vụ phía trên
function generateReportFromSeason(seasonName) {
    openCreateReportModal();
    document.getElementById("modalSeasonSelect").value = seasonName;
}

// Lưu báo cáo (Xử lý cả Thêm mới và Chỉnh sửa)
function saveReportData() {
    let editId = document.getElementById("reportEditId").value;
    let season = document.getElementById("modalSeasonSelect").value;
    let yieldVal = document.getElementById("modalYieldInput").value.trim();
    let status = document.getElementById("modalStatusInput").value;
    let note = document.getElementById("modalNoteInput").value.trim();

    if (!yieldVal) {
        alert("Vui lòng nhập năng suất ước tính!");
        return;
    }

    let today = new Date();
    let dateStr = String(today.getDate()).padStart(2, '0') + '/' + String(today.getMonth() + 1).padStart(2, '0') + '/' + today.getFullYear();

    if (editId === "") {
        // Tạo mới
        let newReport = {
            id: Date.now(),
            title: `Báo cáo tổng kết ${season}`,
            season: season,
            yield: yieldVal,
            status: status,
            date: dateStr,
            note: note || "Chưa có nhận xét chi tiết."
        };
        reportsData.push(newReport);
        alert("Đã tạo và lưu báo cáo thành công!");
    } else {
        // Cập nhật
        let idNum = parseInt(editId);
        let report = reportsData.find(r => r.id === idNum);
        if (report) {
            report.season = season;
            report.title = `Báo cáo tổng kết ${season}`;
            report.yield = yieldVal;
            report.status = status;
            report.note = note;
        }
        alert("Đã cập nhật báo cáo thành công!");
    }

    // Đóng modal và làm mới bảng
    var modalEl = document.getElementById('reportModal');
    var modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();

    renderReportsTable();
}

// Xem chi tiết báo cáo
function viewReport(id) {
    let report = reportsData.find(r => r.id === id);
    if (!report) return;

    document.getElementById("viewReportTitle").innerText = report.title;
    document.getElementById("viewReportSeason").innerText = report.season;
    document.getElementById("viewReportYield").innerText = report.yield;
    document.getElementById("viewReportStatus").innerText = report.status;
    document.getElementById("viewReportDate").innerText = report.date;
    document.getElementById("viewReportNote").innerText = report.note;

    var modal = new bootstrap.Modal(document.getElementById('viewReportModal'));
    modal.show();
}

// Mở modal chỉnh sửa báo cáo
function editReport(id) {
    let report = reportsData.find(r => r.id === id);
    if (!report) return;

    document.getElementById("reportModalTitle").innerHTML = `<i class="fa-solid fa-pen me-2"></i> Chỉnh sửa báo cáo tổng kết`;
    document.getElementById("reportEditId").value = report.id;
    document.getElementById("modalSeasonSelect").value = report.season;
    document.getElementById("modalYieldInput").value = report.yield;
    document.getElementById("modalStatusInput").value = report.status;
    document.getElementById("modalNoteInput").value = report.note;

    var modal = new bootstrap.Modal(document.getElementById('reportModal'));
    modal.show();
}

// Xóa báo cáo
function deleteReport(id) {
    if (confirm("Bạn có chắc chắn muốn xóa báo cáo tổng kết này không?")) {
        reportsData = reportsData.filter(r => r.id !== id);
        renderReportsTable();
    }
}