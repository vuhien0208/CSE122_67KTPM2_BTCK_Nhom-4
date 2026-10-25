/* Trang Coordinator - Tong quan nong ho.
   Trang nay hien thi noi dung tinh bang HTML, JS chi lo viec:
   1. Chan truy cap neu chua dang nhap / sai vai tro (guard).
   2. Ve lai sidebar + topbar theo dung nguoi dung dang dang nhap (mountShell). */
(function () {
    const me = CM.auth.guard('coordinator');
    if (!me) return;
    CM.ui.mountShell(me);
})();
