// Hiện/ẩn mật khẩu
document.querySelectorAll('.eye').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var input = document.getElementById(btn.dataset.t);
    input.type = input.type === 'password' ? 'text' : 'password';
  });
});

// Đo độ mạnh mật khẩu
var pw = document.getElementById('pw');
var bars = document.querySelector('.bars');
var label = document.getElementById('sLabel');
var names = ['Chưa nhập', 'Yếu', 'Trung bình', 'Khá', 'Mạnh'];
pw.addEventListener('input', function () {
  var v = pw.value, s = 0;
  if (v.length >= 8) s++;
  if (/[a-z]/.test(v) && /[A-Z]/.test(v)) s++;
  if (/\d/.test(v)) s++;
  if (/[^A-Za-z0-9]/.test(v)) s++;
  if (!v) s = 0; else if (s === 0) s = 1;
  bars.dataset.l = s;
  label.textContent = names[s];
});

// Kiểm tra form
var form = document.getElementById('regForm');
var err = document.getElementById('err');
function mark(id, bad) {
  document.getElementById(id).closest('.input').classList.toggle('bad', bad);
}
form.addEventListener('submit', function (e) {
  e.preventDefault();
  var msgs = [];
  var name = document.getElementById('name').value.trim();
  var phone = document.getElementById('phone').value.replace(/\s/g, '');
  var email = document.getElementById('email').value.trim();
  var area = document.getElementById('area').value.trim();
  var p1 = pw.value, p2 = document.getElementById('pw2').value;

  var checks = {
    name: name.length >= 2,
    phone: /^(0|\+84)\d{9}$/.test(phone),
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    area: area.length >= 2,
    pw: p1.length >= 8,
    pw2: p1 === p2 && p2 !== ''
  };
  var text = {
    name: 'Vui lòng nhập họ và tên.',
    phone: 'Số điện thoại chưa hợp lệ (VD: 0912345678).',
    email: 'Email chưa hợp lệ.',
    area: 'Vui lòng nhập khu vực canh tác.',
    pw: 'Mật khẩu cần tối thiểu 8 ký tự.',
    pw2: 'Mật khẩu xác nhận chưa khớp.'
  };
  Object.keys(checks).forEach(function (k) {
    mark(k, !checks[k]);
    if (!checks[k]) msgs.push(text[k]);
  });
  if (!document.getElementById('agree').checked) msgs.push('Bạn cần đồng ý với Điều khoản dịch vụ.');

  if (msgs.length) {
    err.hidden = false;
    err.innerHTML = msgs.join('<br>');
    return;
  }
  err.hidden = true;
  var role = form.querySelector('input[name="role"]:checked').value;
  // TODO: gửi dữ liệu lên server. Tạm thời chuyển sang trang theo vai trò.
  var go = {
    farmer: 'farmer-season-dashboard.html',
    expert: 'expert-request-queue.html',
    coordinator: 'coordinator-farm-overview.html',
    admin: 'admin-dashboard.html'
  };
  window.location.href = go[role];
});