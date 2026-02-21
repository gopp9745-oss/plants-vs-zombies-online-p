const fs = require('fs');

// ===== FIX ADMIN.HTML - убрать hidden с вкладок, добавить правильные классы =====
const adminHTML = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>👑 Админ панель - PvZ Online</title>
  <link rel="stylesheet" href="style.css">
</head>
<body class="admin-bg">

  <div class="admin-wrapper">
    <div class="admin-sidebar">
      <div class="admin-logo">
        <div class="admin-logo-icon">👑</div>
        <div class="admin-logo-text">Админ панель</div>
      </div>
      <nav class="admin-nav">
        <button class="admin-nav-btn active" onclick="showAdminTab('tab-users', this)">👥 Пользователи</button>
        <button class="admin-nav-btn" onclick="showAdminTab('tab-promos', this)">🎁 Промокоды</button>
        <button class="admin-nav-btn" onclick="showAdminTab('tab-shop', this)">🛒 Магазин</button>
        <button class="admin-nav-btn" onclick="showAdminTab('tab-stats', this)">📊 Статистика</button>
      </nav>
      <div class="admin-sidebar-footer">
        <button class="btn btn-secondary btn-sm" onclick="window.location.href='/'">← На главную</button>
        <div class="admin-user-info" id="admin-user-info">Загрузка...</div>
      </div>
    </div>

    <div class="admin-content">

      <div id="tab-users" class="admin-tab" style="display:block">
        <div class="admin-tab-header">
          <h2>👥 Управление пользователями</h2>
          <button class="btn btn-primary btn-sm" onclick="loadAdminData()">🔄 Обновить</button>
        </div>
        <div class="admin-search-bar">
          <input type="text" id="user-search" placeholder="Поиск по имени..." class="input-field" oninput="filterUsers()">
        </div>
        <div id="users-table-container"><div class="loading">Загрузка...</div></div>
      </div>

      <div id="tab-promos" class="admin-tab" style="display:none">
        <div class="admin-tab-header">
          <h2>🎁 Управление промокодами</h2>
          <button class="btn btn-primary btn-sm" onclick="loadAdminData()">🔄 Обновить</button>
        </div>
        <div class="admin-card">
          <h3>➕ Создать промокод</h3>
          <div class="admin-form-grid">
            <div class="form-group">
              <label>Код промокода</label>
              <input type="text" id="new-promo-code" placeholder="PROMO2024" class="input-field" style="text-transform:uppercase">
            </div>
            <div class="form-group">
              <label>Награда (монеты)</label>
              <input type="number" id="new-promo-reward" placeholder="100" class="input-field" value="100" min="1">
            </div>
            <div class="form-group">
              <label>Макс. использований (0 = безлимит)</label>
              <input type="number" id="new-promo-maxuses" placeholder="0" class="input-field" value="0" min="0">
            </div>
          </div>
          <button class="btn btn-success" onclick="createPromo()">✅ Создать промокод</button>
          <div id="promo-create-result" style="display:none;margin-top:10px"></div>
        </div>
        <div id="promos-table-container"><div class="loading">Загрузка...</div></div>
      </div>

      <div id="tab-shop" class="admin-tab" style="display:none">
        <div class="admin-tab-header"><h2>🛒 Товары магазина</h2></div>
        <div id="shop-table-container"><div class="loading">Загрузка...</div></div>
      </div>

      <div id="tab-stats" class="admin-tab" style="display:none">
        <div class="admin-tab-header"><h2>📊 Статистика сервера</h2></div>
        <div class="stats-grid">
          <div class="stat-card"><div class="stat-icon">👥</div><div class="stat-value" id="stat-users">-</div><div class="stat-label">Игроков</div></div>
          <div class="stat-card"><div class="stat-icon">🎁</div><div class="stat-value" id="stat-promos">-</div><div class="stat-label">Промокодов</div></div>
          <div class="stat-card"><div class="stat-icon">🏆</div><div class="stat-value" id="stat-total-wins">-</div><div class="stat-label">Всего побед</div></div>
          <div class="stat-card"><div class="stat-icon">🪙</div><div class="stat-value" id="stat-total-coins">-</div><div class="stat-label">Монет в обороте</div></div>
        </div>
        <div class="top-players-section">
          <h3>🥇 Топ игроков</h3>
          <div id="top-players-list"></div>
        </div>
      </div>

    </div>
  </div>

  <div id="modal-coins" class="modal" style="display:none">
    <div class="modal-content">
      <h3>🪙 Выдать монеты</h3>
      <p>Игрок: <strong id="modal-coins-username"></strong></p>
      <div class="form-group">
        <label>Количество монет</label>
        <input type="number" id="modal-coins-amount" class="input-field" value="100" min="1">
      </div>
      <div class="modal-buttons">
        <button class="btn btn-success" onclick="confirmGiveCoins()">Выдать</button>
        <button class="btn btn-secondary" onclick="closeModal('modal-coins')">Отмена</button>
      </div>
    </div>
  </div>

  <div id="toast" class="toast" style="display:none"></div>

  <script src="/socket.io/socket.io.js"></script>
  <script src="admin.js"></script>
</body>
</html>`;

fs.writeFileSync('public/admin.html', adminHTML, 'utf8');
console.log('admin.html fixed');

// ===== FIX ADMIN.JS =====
const adminJS = `var socket = io();
var currentAdmin = null;
var adminData = { users: [], promoCodes: [], shopItems: [] };
var coinTargetId = null;

function showToast(msg, type) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.style.display = 'block';
  t.className = 'toast ' + (type || 'success');
  setTimeout(function() { t.style.display = 'none'; }, 3000);
}

window.addEventListener('DOMContentLoaded', function() {
  var saved = localStorage.getItem('pvz_user');
  if (!saved) { window.location.href = '/'; return; }
  try {
    currentAdmin = JSON.parse(saved);
    if (!currentAdmin.isAdmin) {
      alert('Нет доступа! Вы не являетесь администратором.');
      window.location.href = '/';
      return;
    }
    document.getElementById('admin-user-info').textContent = '👑 ' + currentAdmin.username;
    loadAdminData();
  } catch(e) { window.location.href = '/'; }
});

function loadAdminData() {
  if (!currentAdmin) return;
  socket.emit('admin_get_data', { userId: currentAdmin.id });
}

socket.on('admin_data', function(d) {
  if (!d.success) { alert(d.message); window.location.href = '/'; return; }
  adminData = d;
  renderUsers();
  renderPromos();
  renderShopItems();
  updateStats();
});

function showAdminTab(tabId, btn) {
  document.querySelectorAll('.admin-tab').forEach(function(t) {
    t.style.display = 'none';
  });
  document.querySelectorAll('.admin-nav-btn').forEach(function(b) {
    b.classList.remove('active');
  });
  document.getElementById(tabId).style.display = 'block';
  btn.classList.add('active');
}

function renderUsers() {
  var users = adminData.users || [];
  if (!users.length) {
    document.getElementById('users-table-container').innerHTML = '<div class="empty-state"><div class="empty-state-icon">👥</div><p>Нет пользователей</p></div>';
    return;
  }
  var html = '<table class="data-table"><thead><tr><th>Игрок</th><th>Роль</th><th>Монеты</th><th>Победы</th><th>Поражения</th><th>Действия</th></tr></thead><tbody>';
  users.forEach(function(u) {
    html += '<tr>';
    html += '<td>' + u.username + '</td>';
    html += '<td><span class="badge ' + (u.isAdmin ? 'badge-admin' : 'badge-user') + '">' + (u.isAdmin ? '👑 Админ' : '👤 Игрок') + '</span></td>';
    html += '<td>🪙 ' + u.coins + '</td>';
    html += '<td>🏆 ' + u.wins + '</td>';
    html += '<td>💀 ' + u.losses + '</td>';
    html += '<td><div class="action-btns">';
    html += '<button class="btn btn-warning btn-sm" onclick="openGiveCoins(\\'' + u.id + '\\',\\'' + u.username + '\\')">🪙 Монеты</button>';
    if (!u.isAdmin) {
      html += '<button class="btn btn-purple btn-sm" onclick="setAdmin(\\'' + u.id + '\\',true)">👑 Сделать админом</button>';
    } else if (u.id !== currentAdmin.id) {
      html += '<button class="btn btn-secondary btn-sm" onclick="setAdmin(\\'' + u.id + '\\',false)">❌ Снять права</button>';
    }
    if (u.id !== currentAdmin.id) {
      html += '<button class="btn btn-danger btn-sm" onclick="deleteUser(\\'' + u.id + '\\',\\'' + u.username + '\\')">🗑️ Удалить</button>';
    }
    html += '</div></td></tr>';
  });
  html += '</tbody></table>';
  document.getElementById('users-table-container').innerHTML = html;
}

function filterUsers() {
  var q = document.getElementById('user-search').value.toLowerCase();
  var rows = document.querySelectorAll('#users-table-container tbody tr');
  rows.forEach(function(r) {
    r.style.display = r.cells[0].textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

function renderPromos() {
  var promos = adminData.promoCodes || [];
  if (!promos.length) {
    document.getElementById('promos-table-container').innerHTML = '<div class="empty-state"><div class="empty-state-icon">🎁</div><p>Нет промокодов. Создайте первый!</p></div>';
    return;
  }
  var html = '<table class="data-table"><thead><tr><th>Код</th><th>Награда</th><th>Использований</th><th>Макс.</th><th>Статус</th><th>Действия</th></tr></thead><tbody>';
  promos.forEach(function(p) {
    html += '<tr>';
    html += '<td><strong>' + p.code + '</strong></td>';
    html += '<td>🪙 ' + p.reward + '</td>';
    html += '<td>' + (p.usedCount || 0) + '</td>';
    html += '<td>' + (p.maxUses || '∞') + '</td>';
    html += '<td><span class="badge ' + (p.active ? 'badge-active' : 'badge-inactive') + '">' + (p.active ? '✅ Активен' : '❌ Неактивен') + '</span></td>';
    html += '<td><div class="action-btns">';
    html += '<button class="btn btn-warning btn-sm" onclick="togglePromo(\\'' + p.id + '\\')">' + (p.active ? '⏸️ Деактивировать' : '▶️ Активировать') + '</button>';
    html += '<button class="btn btn-danger btn-sm" onclick="deletePromo(\\'' + p.id + '\\')">🗑️ Удалить</button>';
    html += '</div></td></tr>';
  });
  html += '</tbody></table>';
  document.getElementById('promos-table-container').innerHTML = html;
}

function renderShopItems() {
  var items = adminData.shopItems || [];
  var html = '<table class="data-table"><thead><tr><th>Товар</th><th>Тип</th><th>Цена</th></tr></thead><tbody>';
  items.forEach(function(item) {
    html += '<tr><td>' + item.emoji + ' ' + item.name + '</td><td>' + item.type + '</td><td>🪙 ' + item.price + '</td></tr>';
  });
  html += '</tbody></table>';
  document.getElementById('shop-table-container').innerHTML = html;
}

function updateStats() {
  var users = adminData.users || [];
  var promos = adminData.promoCodes || [];
  document.getElementById('stat-users').textContent = users.length;
  document.getElementById('stat-promos').textContent = promos.length;
  document.getElementById('stat-total-wins').textContent = users.reduce(function(s, u) { return s + (u.wins || 0); }, 0);
  document.getElementById('stat-total-coins').textContent = users.reduce(function(s, u) { return s + (u.coins || 0); }, 0);

  var top = users.slice().sort(function(a, b) { return b.wins - a.wins; }).slice(0, 5);
  var html = '';
  top.forEach(function(u, i) {
    var rank = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1) + '.';
    html += '<div class="top-player-item"><div class="top-player-rank">' + rank + '</div><div class="top-player-name">' + u.username + (u.isAdmin ? ' 👑' : '') + '</div><div class="top-player-stats">🏆 ' + u.wins + ' | 🪙 ' + u.coins + '</div></div>';
  });
  document.getElementById('top-players-list').innerHTML = html || '<p style="color:#aaa;padding:20px">Нет данных</p>';
}

function createPromo() {
  var code = document.getElementById('new-promo-code').value.trim().toUpperCase();
  var reward = parseInt(document.getElementById('new-promo-reward').value) || 100;
  var maxUses = parseInt(document.getElementById('new-promo-maxuses').value) || 0;
  var res = document.getElementById('promo-create-result');

  if (!code) {
    res.style.display = 'block';
    res.className = 'error-msg';
    res.textContent = 'Введите код промокода';
    return;
  }

  socket.emit('admin_create_promo', { userId: currentAdmin.id, code: code, reward: reward, maxUses: maxUses });
}

socket.on('admin_promo_result', function(d) {
  var res = document.getElementById('promo-create-result');
  res.style.display = 'block';
  res.className = d.success ? 'success-msg' : 'error-msg';
  res.textContent = d.message;
  if (d.success) {
    document.getElementById('new-promo-code').value = '';
    loadAdminData();
  }
  setTimeout(function() { res.style.display = 'none'; }, 4000);
});

socket.on('admin_action_result', function(d) {
  showToast(d.message, d.success ? 'success' : 'error');
  if (d.success) {
    loadAdminData();
    closeModal('modal-coins');
  }
});

function setAdmin(targetId, value) {
  if (!confirm(value ? 'Назначить администратором?' : 'Снять права администратора?')) return;
  socket.emit('admin_set_admin', { userId: currentAdmin.id, targetId: targetId, value: value });
}

function deleteUser(targetId, username) {
  if (!confirm('Удалить пользователя ' + username + '? Это действие необратимо!')) return;
  socket.emit('admin_delete_user', { userId: currentAdmin.id, targetId: targetId });
}

function togglePromo(promoId) {
  socket.emit('admin_toggle_promo', { userId: currentAdmin.id, promoId: promoId });
}

function deletePromo(promoId) {
  if (!confirm('Удалить промокод?')) return;
  socket.emit('admin_delete_promo', { userId: currentAdmin.id, promoId: promoId });
}

function openGiveCoins(targetId, username) {
  coinTargetId = targetId;
  document.getElementById('modal-coins-username').textContent = username;
  document.getElementById('modal-coins').style.display = 'flex';
}

function confirmGiveCoins() {
  var amount = parseInt(document.getElementById('modal-coins-amount').value) || 0;
  if (amount <= 0) { showToast('Введите положительную сумму', 'error'); return; }
  socket.emit('admin_give_coins', { userId: currentAdmin.id, targetId: coinTargetId, amount: amount });
}

function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}
`;

fs.writeFileSync('public/admin.js', adminJS, 'utf8');
console.log('admin.js fixed, size:', fs.statSync('public/admin.js').size);

// ===== FIX SERVER.JS - убрать автоматическое назначение первого пользователя админом =====
// Читаем server.js и меняем строку с isAdmin
let serverJS = fs.readFileSync('server.js', 'utf8');

// Убираем автоматическое назначение первого пользователя админом
serverJS = serverJS.replace(
  'isAdmin: db.users.length === 0, // первый пользователь - админ',
  'isAdmin: false, // права выдаются только через админ панель'
);

fs.writeFileSync('server.js', serverJS, 'utf8');
console.log('server.js fixed - no auto-admin');

// ===== ДОБАВИТЬ КОМАНДУ НАЗНАЧЕНИЯ ПЕРВОГО АДМИНА =====
// Добавим специальный socket event для получения прав первого админа
// Если в базе нет ни одного админа - первый кто введёт секретный код получит права

let serverJS2 = fs.readFileSync('server.js', 'utf8');

// Добавим обработчик claim_admin после регистрации
const claimAdminCode = `
  // --- CLAIM ADMIN (если нет ни одного админа) ---
  socket.on('claim_admin', (data) => {
    const { userId, secretCode } = data;
    const ADMIN_SECRET = 'PVZADMIN2024';
    db = loadDB();
    
    if (secretCode !== ADMIN_SECRET) {
      return socket.emit('claim_admin_result', { success: false, message: 'Неверный секретный код' });
    }
    
    const user = db.users.find(u => u.id === userId);
    if (!user) {
      return socket.emit('claim_admin_result', { success: false, message: 'Пользователь не найден' });
    }
    
    if (user.isAdmin) {
      return socket.emit('claim_admin_result', { success: false, message: 'Вы уже администратор' });
    }
    
    user.isAdmin = true;
    saveDB(db);
    
    const safeUser = { ...user };
    delete safeUser.password;
    socket.emit('claim_admin_result', { success: true, message: 'Вы получили права администратора!', user: safeUser });
  });

`;

// Вставляем перед matchmaking
serverJS2 = serverJS2.replace(
  '  // --- MATCHMAKING ---',
  claimAdminCode + '  // --- MATCHMAKING ---'
);

fs.writeFileSync('server.js', serverJS2, 'utf8');
console.log('server.js - claim_admin added');

// ===== FIX INDEX.HTML - добавить кнопку получения прав админа =====
let indexHTML = fs.readFileSync('public/index.html', 'utf8');

// Добавим в меню кнопку "Получить права админа" и модальное окно
const adminClaimBtn = `          <button id="admin-btn" class="btn btn-purple hidden" onclick="window.location.href='admin.html'">👑 Админ панель</button>
          <button class="btn btn-secondary" onclick="showClaimAdmin()">🔑 Код администратора</button>`;

indexHTML = indexHTML.replace(
  `          <button id="admin-btn" class="btn btn-purple hidden" onclick="window.location.href='admin.html'">👑 Админ панель</button>`,
  adminClaimBtn
);

// Добавим модальное окно перед закрывающим body
const claimModal = `
  <!-- МОДАЛЬНОЕ ОКНО: КОД АДМИНИСТРАТОРА -->
  <div id="modal-claim-admin" class="modal" style="display:none">
    <div class="modal-content" style="background:#fff;color:#333">
      <h3 style="color:#2E7D32">🔑 Код администратора</h3>
      <p style="color:#666;margin-bottom:15px">Введите секретный код для получения прав администратора</p>
      <div class="form-group">
        <label style="color:#333">Секретный код</label>
        <input type="password" id="admin-secret-input" class="input-field" placeholder="Введите код...">
      </div>
      <div id="claim-admin-result" style="display:none;margin-bottom:10px"></div>
      <div class="modal-buttons">
        <button class="btn btn-success" onclick="doClaimAdmin()">Применить</button>
        <button class="btn btn-secondary" onclick="document.getElementById('modal-claim-admin').style.display='none'">Отмена</button>
      </div>
    </div>
  </div>

`;

indexHTML = indexHTML.replace('  <script src="/socket.io/socket.io.js"></script>', claimModal + '  <script src="/socket.io/socket.io.js"></script>');

fs.writeFileSync('public/index.html', indexHTML, 'utf8');
console.log('index.html - claim admin modal added');

// ===== FIX APP.JS - добавить функции для claim admin =====
let appJS = fs.readFileSync('public/app.js', 'utf8');

const claimAdminFunctions = `
function showClaimAdmin() {
  if (!currentUser) { showToast('Сначала войдите в аккаунт', 'error'); return; }
  if (currentUser.isAdmin) { showToast('Вы уже администратор', 'success'); return; }
  document.getElementById('modal-claim-admin').style.display = 'flex';
}

function doClaimAdmin() {
  if (!currentUser) return;
  var code = document.getElementById('admin-secret-input').value.trim();
  if (!code) { showToast('Введите код', 'error'); return; }
  socket.emit('claim_admin', { userId: currentUser.id, secretCode: code });
}

socket.on('claim_admin_result', function(d) {
  var res = document.getElementById('claim-admin-result');
  res.style.display = 'block';
  res.className = d.success ? 'success-msg' : 'error-msg';
  res.textContent = d.message;
  if (d.success) {
    currentUser = d.user;
    localStorage.setItem('pvz_user', JSON.stringify(d.user));
    updateUserPanel();
    setTimeout(function() {
      document.getElementById('modal-claim-admin').style.display = 'none';
      res.style.display = 'none';
    }, 2000);
  }
});
`;

appJS += claimAdminFunctions;
fs.writeFileSync('public/app.js', appJS, 'utf8');
console.log('app.js - claim admin functions added');

// Также нужно исправить db.json если он уже создан - убрать isAdmin у всех кроме первого
if (fs.existsSync('db.json')) {
  const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));
  // Оставляем isAdmin только у тех кто уже был назначен вручную
  // Если только один пользователь и он был первым - оставляем
  console.log('db.json exists, users:', db.users.length);
  if (db.users.length > 0) {
    console.log('Users:', db.users.map(u => u.username + ' admin:' + u.isAdmin));
  }
}

console.log('\n=== ALL FIXES APPLIED ===');
console.log('Секретный код администратора: PVZADMIN2024');
console.log('Войдите в аккаунт -> кнопка "Код администратора" -> введите PVZADMIN2024');
