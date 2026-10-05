// Hiện/ẩn mật khẩu
var pw = document.getElementById('pw');
document.querySelector('.eye').addEventListener('click', function () {
  pw.type = pw.type === 'password' ? 'text' : 'password';
});

// Kiểm tra form đăng nhập
var form = document.getElementById('loginForm');
var err = document.getElementById('err');
var idInput = document.getElementById('id');

form.addEventListener('submit', function (e) {
  e.preventDefault();
  var id = idInput.value.trim();
  var isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id);
  var isPhone = /^(0|\+84)\d{9}$/.test(id.replace(/\s/g, ''));
  var msgs = [];

  var badId = !(isEmail || isPhone);
  var badPw = pw.value.length < 1;
  idInput.closest('.input').classList.toggle('bad', badId);
  pw.closest('.input').classList.toggle('bad', badPw);
  if (badId) msgs.push('Nhập email hoặc số điện thoại hợp lệ.');
  if (badPw) msgs.push('Vui lòng nhập mật khẩu.');

  if (msgs.length) {
    err.hidden = false;
    err.innerHTML = msgs.join('<br>');
    return;
  }
  err.hidden = true;

  var role = form.querySelector('input[name="role"]:checked').value;
  // TODO: gọi API đăng nhập. Tạm thời chuyển thẳng sang trang theo vai trò.
  var go = {
    farmer: 'farmer-season-dashboard.html',
    expert: 'expert-request-queue.html',
    coordinator: 'coordinator-farm-overview.html',
    admin: 'admin-dashboard.html'
  };
  window.location.href = go[role];
});