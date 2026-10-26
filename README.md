# CropMate AI — Nhật ký mùa vụ và trợ lý canh tác

Frontend prototype cho học phần **Phát triển ứng dụng Web cơ bản (CSE122)**.
Công nghệ: HTML5, CSS3, JavaScript thuần, JSON seed, LocalStorage/SessionStorage.

## Chạy thử
Mở `index.html` bằng trình duyệt (hoặc dùng Live Server / `python3 -m http.server`). Chọn tài khoản demo ở `login.html`.

| Vai trò | Email | Mật khẩu | Trang đích |
|---|---|---|---|
| Nông dân | farmer@cropmate.vn | Farmer@123 | farmer-season-dashboard.html |
| Nông dân 2 | farmer2@cropmate.vn | Farmer@123 | farmer-season-dashboard.html |
| Chuyên gia | expert@cropmate.vn | Expert@123 | expert-request-queue.html |
| Điều phối HTX | coordinator@cropmate.vn | Coord@123 | coordinator-farm-overview.html |
| Quản trị viên | admin@cropmate.vn | Admin@123 | admin-dashboard.html |
| Bị vô hiệu hóa | tam.le@cropmate.vn | Farmer@123 | (bị chặn đăng nhập) |

Admin có nút **Đặt lại dữ liệu demo** ở dashboard.

## Luồng nghiệp vụ role (nên demo)
1. Farmer: Nhật ký canh tác → thêm nhật ký.
2. Farmer: Yêu cầu hỗ trợ → tạo yêu cầu, dùng AI-1 phân loại, gửi.
3. Expert: yêu cầu xuất hiện trong hàng chờ (có thông báo) → Nhận xử lý → xem nhật ký liên quan → AI-3 tóm tắt → gửi phản hồi.
4. Farmer: thấy phản hồi và trạng thái mới (có thông báo).
5. Coordinator: thấy yêu cầu, việc trễ hạn, tiến độ trong Tổng quan nông hộ, Lịch và Tổng kết.
6. Admin: vô hiệu hóa tài khoản → tài khoản đó không đăng nhập được.

## Tính năng AI
- **AI-1** Field Issue Classifier trên `farmer-help-request.html` dùng AI mô phỏng khi để trống API key hoặc Gemini khi nhập key. Kết quả có nhóm vấn đề, dấu hiệu, giải thích và hướng xử lý tham khảo; nông dân chọn áp dụng rồi có thể chỉnh sửa trước khi gửi yêu cầu.
- **AI-3** Farm Log Summarizer là tính năng mô phỏng rule-based trong `js/ai.js`.
- **AI tạo checklist mùa vụ** trên `farmer-season-dashboard.html` đề xuất công việc theo cây trồng, giai đoạn và thông tin mùa vụ. Để trống API key để thử giao diện bằng AI mô phỏng; nhập key để gọi Gemini API thật. Key chỉ giữ trong bộ nhớ trang và được gửi trực tiếp đến Google, không lưu trong LocalStorage.
- Checklist được lưu qua `CM.store` và xuất hiện trong trang `farmer-checklist.html`, nơi nông dân có thể đánh dấu hoàn thành, chỉnh sửa hoặc xóa công việc.

Gemini được gọi trực tiếp từ trình duyệt để phù hợp với bản demo frontend; không dùng cách này trong môi trường production vì API key phía trình duyệt có thể bị lộ. Production nên gọi Gemini qua backend/proxy có quản lý bí mật. Nội dung do AI tạo chỉ là gợi ý, cần được kiểm tra theo điều kiện thực tế.

## Cấu trúc
```
index.html login.html register.html forgot-password.html
pages/{farmer,expert,coordinator,admin,shared}/
css/ style.css (token, layout) · components.css · responsive.css
js/  data/seed.js (dữ liệu khởi tạo tập trung) · storage.js (CRUD, LocalStorage)
     auth.js (phiên, guard role) · ui.js (shell, modal, form, AI panel) · ai.js (AI mô phỏng)
     modules/  một file cho mỗi trang
docs/ design/
```
Dữ liệu: `users, farms, fields, crops, seasons, fieldLogs, helpRequests, resources, checklists, calendarEvents, seasonSummaries, notifications`. Mọi thao tác tạo/sửa/xóa đi qua `CM.store` và được lưu trong LocalStorage (khóa `cropmate.v1.*`).

## Lưu ý
- Xác thực là **mô phỏng Frontend**, mật khẩu demo lưu trong LocalStorage, không có bảo mật như Backend thật.
- Ảnh được nén ≤ 720px và lưu dạng dataURL; LocalStorage có giới hạn dung lượng (~5 MB).
- Font Be Vietnam Pro tải từ Google Fonts, có font dự phòng khi offline.
- Chưa có Figma/Canva, Trello, GitHub PR, video OBS: nhóm cần tự bổ sung theo `docs/team-assignment.md`.

## Quy ước Git
Nhánh `main`, `dev`, `feature/*`, `fix/*`, `docs/*`. Commit dạng `feat:`, `fix:`, `style:`, `docs:`.
