document.addEventListener("DOMContentLoaded", function() {
    const searchInput = document.getElementById("searchInput");
    const statusFilter = document.getElementById("statusFilter");
    const tableRows = document.querySelectorAll("#farmTable tbody tr");

    // Hàm lọc dữ liệu thời gian thực (Kết hợp từ khóa tìm kiếm và Dropdown trạng thái)
    function filterData() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";
        const selectedStatus = statusFilter ? statusFilter.value.trim() : "all";

        tableRows.forEach(row => {
            const rowText = row.innerText.toLowerCase();
            const rowStatus = row.getAttribute("data-status") || "";

            const matchesSearch = rowText.includes(searchTerm);
            const matchesStatus = (selectedStatus === "all") || (rowStatus.toLowerCase() === selectedStatus.toLowerCase());

            if (matchesSearch && matchesStatus) {
                row.style.display = ""; // Hiển thị dòng khớp
            } else {
                row.style.display = "none"; // Ẩn dòng không khớp
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", filterData);
        searchInput.addEventListener("keyup", filterData);
    }
    
    if (statusFilter) {
        statusFilter.addEventListener("change", filterData);
    }
});

// Hàm hiển thị Modal Chi tiết nông hộ khi bấm nút "Chi tiết" (ĐẶT TOÀN CỤC)
function showFarmDetail(name, owner, address, area, season, status) {
    document.getElementById("modalFarmTitle").innerText = name;
    document.getElementById("modalOwner").innerText = owner;
    document.getElementById("modalAddress").innerText = address;
    document.getElementById("modalArea").innerText = area;
    document.getElementById("modalSeason").innerText = season;
    
    const modalStatusEl = document.getElementById("modalStatus");
    modalStatusEl.innerText = status;
    modalStatusEl.className = "badge " + (status === "Trễ hạn" ? "bg-warning text-dark" : status === "Cần ưu tiên" ? "bg-danger" : "bg-secondary");

    // Hiển thị Modal Bootstrap
    var detailModal = new bootstrap.Modal(document.getElementById('farmDetailModal'));
    detailModal.show();
}

// Hàm giả lập lưu lịch hoạt động mới
function saveSchedule() {
    alert("Đã lên lịch hoạt động thành công!");
    var scheduleModalEl = document.getElementById('scheduleModal');
    var scheduleModal = bootstrap.Modal.getInstance(scheduleModalEl);
    if (scheduleModal) {
        scheduleModal.hide();
    }
}