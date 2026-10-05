# TASK 01 — Phân tích role Chuyên gia nông nghiệp

# Mục tiêu: hiểu chuyên gia vào hệ thống để làm gì.

# Xác định:

Input chuyên gia nhận được
Yêu cầu hỗ trợ từ nông dân.
Thông tin nông hộ.
Thông tin ruộng/thửa đất.
Thông tin mùa vụ.
Nhật ký canh tác.
Ảnh hiện trường.
Kết quả AI.
Chuyên gia cần thực hiện

project-root/
├── expert-request-queue.html
├── css/
│   └── expert.css
└── js/
    ├── expert-mock.js
    └── expert-queue.js

Xem yêu cầu
    ↓
Xem bối cảnh
    ↓
Xem AI phân tích
    ↓
Kiểm tra lại thông tin
    ↓
Đưa ra tư vấn
    ↓
Gửi phản hồi
    ↓
Đóng yêu cầu

# vai trò (role) bắt buộc
Vai trò	Trách nhiệm chính
Nông dân	Quản lý mùa vụ và yêu cầu hỗ trợ
Chuyên gia nông nghiệp	Review vấn đề và cung cấp tài nguyên
Điều phối HTX	Theo dõi nông hộ và hoạt động
Quản trị viên	Quản lý danh mục và tài khoản
Chức năng/màn hình nền tảng tối thiểu theo từng vai trò

Nông dân

farmer-season-dashboard.html — Season Dashboard (R)
farmer-field-log.html — Field Log (C/R/U)
farmer-help-request.html — Help Request (C/R/U/D)

Chuyên gia nông nghiệp

expert-request-queue.html — Request Queue (R)
expert-request-detail.html — Request Detail (C/R/U)
expert-resource-library.html — Resource Library (C/R/U/D)

Điều phối HTX

coordinator-farm-overview.html — Farm Overview (R)
coordinator-calendar.html — Calendar (C/R/U)
coordinator-season-summary.html — Season Summary (C/R/U/D)

Quản trị viên

admin-dashboard.html — Dashboard (R)
admin-crop-management.html — Crop Management (C/R/U)
admin-user-management.html — User Management (C/R/U/D)

# Lưu ý quan trọng: đề bài nói rõ đây chỉ là ngưỡng tối thiểu (3 màn hình/vai trò), không phải mục tiêu số lượng. Nhóm phải phân tích đầy đủ nghiệp vụ và có thể cần thêm màn hình (5, 7, hoặc hơn) nếu luồng nghiệp vụ thực sự đòi hỏi — tiêu chí chấm là độ đầy đủ nghiệp vụ, không phải số lượng giao diện.

Chức năng chung bắt buộc (áp dụng toàn hệ thống)
Navigation nhất quán xuyên suốt các vai trò
Responsive (desktop + tablet/mobile)
CRUD hoặc trạng thái nghiệp vụ có ý nghĩa (không CRUD hình thức) trên 6 entity: farms, fields, seasons, fieldLogs, helpRequests, resources
Search/filter/form validation bằng JavaScript/DOM
Dữ liệu giả lập (JSON/LocalStorage/MockAPI) hoặc API công khai
Bao phủ trạng thái: bình thường, đang tải, rỗng, thành công, lỗi, vô hiệu hóa, đang chờ, bị từ chối, hoàn thành, đã hủy/lưu trữ (khi có nghiệp vụ tương ứng)
Có thể cần thêm màn hình dùng chung: index.html, login.html, register.html, forgot-password.html, profile.html, settings.html, notifications.html, 403.html, 404.html
# tính năng AI bắt buộc (tối thiểu)
AI	Chức năng
AI-1	Field Issue Classifier — phân loại mô tả/ảnh vào nhóm vấn đề (mock)
AI-2	Season Checklist Generator — tạo checklist công việc theo cây trồng/giai đoạn
AI-3	Farm Log Summarizer — tóm tắt diễn biến mùa vụ cho chuyên gia

Mỗi AI feature bắt buộc theo luồng: Nhập → Kiểm tra hợp lệ → Đang xử lý → Kết quả → Giải thích → Chấp nhận/Sửa/Từ chối/Tạo lại → Lưu, và phải có ít nhất một trạng thái thất bại/không chắc chắn kèm thao tác xử lý (thử lại, bỏ qua, dùng thủ công...).