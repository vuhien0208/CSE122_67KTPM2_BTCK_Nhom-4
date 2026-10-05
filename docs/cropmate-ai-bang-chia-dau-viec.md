# CropMate AI — Bảng kiểm kê màn hình & chia đầu việc

| Role | Chức năng | Tên tệp tin giao diện | CRUD | Người phụ trách | Vai trò giao diện |
|---|---|---|---|---|---|
| Dùng chung | Trang chủ | index.html | — | Cả nhóm | Khởi đầu, giới thiệu 4 vai trò |
| Dùng chung | Đăng nhập | login.html | — | Cả nhóm | Cổng vào hệ thống theo vai trò |
| Dùng chung | Đăng ký | register.html | C | Cả nhóm | Tạo tài khoản người dùng mới |
| Dùng chung | Quên mật khẩu | forgot-password.html | U | SV1 | Khôi phục quyền truy cập |
| Dùng chung | Hồ sơ cá nhân | profile.html | R/U | SV1 | Quản lý thông tin tài khoản |
| Dùng chung | Cài đặt | settings.html | R/U | SV1 | Tuỳ chỉnh thông báo, ngôn ngữ |
| Dùng chung | Thông báo | notifications.html | R | SV3 | Tổng hợp nhắc việc, cảnh báo AI |
| Dùng chung | Không có quyền | 403.html | — | SV3 | Chặn truy cập sai vai trò |
| Dùng chung | Không tìm thấy trang | 404.html | — | SV3 | Xử lý đường dẫn sai |
| Nông dân | Tổng quan mùa vụ | pages/farmer-season-dashboard.html | R | SV1 | Xem nhanh tình trạng mùa vụ đang canh tác |
| Nông dân | Quản lý ruộng/thửa | pages/farmer-field-management.html | C/R/U/D | SV1 | Khai báo danh sách ruộng để gắn nhật ký |
| Nông dân | Nhật ký đồng ruộng | pages/farmer-field-log.html | C/R/U | SV1 | Ghi diễn biến thực tế trên đồng ruộng |
| Nông dân | Lịch sử mùa vụ | pages/farmer-season-history.html | R | SV1 | Tra cứu lại các mùa vụ đã kết thúc |
| Nông dân | Yêu cầu hỗ trợ | pages/farmer-help-request.html | C/R/U/D | SV1 | Gửi vấn đề cần chuyên gia tư vấn |
| Nông dân | Chi tiết phản hồi | pages/farmer-request-detail.html | R | SV1 | Xem tư vấn chi tiết từ chuyên gia |
| Nông dân | Tài liệu tham khảo | pages/farmer-resource-view.html | R | SV1 | Xem tài liệu do chuyên gia chia sẻ |
| Nông dân | Hồ sơ nông trại | pages/farmer-profile-farm.html | C/R/U | SV1 | Khai báo diện tích, loại đất, cây trồng chính |
| Chuyên gia | Hàng đợi yêu cầu | pages/expert-request-queue.html | R | Hiền | Tiếp nhận ca cần xử lý |
| Chuyên gia | Chi tiết yêu cầu (AI-1, AI-3) | pages/expert-request-detail.html | C/R/U | Hiền | Chẩn đoán có AI hỗ trợ, đưa ra tư vấn |
| Chuyên gia | Lịch sử yêu cầu | pages/expert-request-history.html | R | Hiền | Tra cứu ca đã xử lý xong |
| Chuyên gia | Hồ sơ nông hộ | pages/expert-farmer-profile.html | R | Hiền | Xem toàn cảnh 1 nông hộ trước khi tư vấn |
| Chuyên gia | Thư viện tài liệu | pages/expert-resource-library.html | C/R/U/D | Hiền | Kho kiến thức dùng khi tư vấn |
| Chuyên gia | Chi tiết tài liệu | pages/expert-resource-detail.html | R/U | Hiền | Xem/sửa nội dung đầy đủ 1 tài liệu |
| Chuyên gia | Thống kê hiệu suất | pages/expert-dashboard.html | R | Hiền | Đo hiệu quả làm việc & mức tin cậy AI |
| Chuyên gia | Nhật ký hoạt động AI | pages/expert-ai-activity-log.html | R | Hiền | Minh bạch hoá mọi quyết định AI |
| Điều phối HTX | Tổng quan nông hộ | pages/coordinator-farm-overview.html | R | SV3 | Theo dõi toàn bộ nông hộ trong HTX |
| Điều phối HTX | Chi tiết nông hộ | pages/coordinator-farmer-detail.html | R | SV3 | Xem sâu 1 nông hộ cụ thể |
| Điều phối HTX | Lịch canh tác (AI-2) | pages/coordinator-calendar.html | C/R/U | SV3-Hiền | Lên kế hoạch mùa vụ, có checklist AI gợi ý |
| Điều phối HTX | Giao việc | pages/coordinator-task-assignment.html | C/R/U | SV3 | Phân công công việc theo checklist AI |
| Điều phối HTX | Phân bổ vật tư | pages/coordinator-resource-allocation.html | C/R/U | SV3 | Điều phối vật tư/nguồn lực cho nông hộ |
| Điều phối HTX | Tổng kết mùa vụ | pages/coordinator-season-summary.html | C/R/U/D | SV3 | Đánh giá kết quả sau mỗi mùa vụ |
| Điều phối HTX | Báo cáo tổng hợp | pages/coordinator-report.html | R | SV3 | Báo cáo toàn HTX theo kỳ |
| Điều phối HTX | Cảnh báo cần chú ý | pages/coordinator-alerts.html | R | SV3 | Tổng hợp cảnh báo từ nhiều nông hộ |
| Quản trị viên | Bảng điều khiển hệ thống | pages/admin-dashboard.html | R | SV1 | Tổng quan toàn hệ thống |
| Quản trị viên | Quản lý danh mục cây trồng | pages/admin-crop-management.html | C/R/U | SV1 | Thiết lập dữ liệu nền cho toàn hệ thống |
| Quản trị viên | Nhật ký hệ thống | pages/admin-system-log.html | R | SV1 | Theo dõi hoạt động/lỗi toàn hệ thống |
| Quản trị viên | Quản lý người dùng | pages/admin-user-management.html | C/R/U/D | SV3 | Kiểm soát tài khoản 4 vai trò |
| Quản trị viên | Báo cáo hệ thống | pages/admin-report.html | R | SV3 | Thống kê tổng thể toàn nền tảng |
