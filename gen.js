const fs = require('fs');

// ===== APP.JS =====
const appJS = `
socket.on('login_result', function(d) {
  if (d.success) {
    currentUser = d.user;
    localStorage.setItem('pvz_user', JSON.stringify(d.user));
    updateUserPanel();
    showScreen('screen-menu');
    showToast('Добро пожаловать, ' + d.user.username + '!', 'success');
  } else {
    var err = document.getElementById('login-error');
    err.textContent = d.message;
    err.classList.remove('hidden');
  }
});

function showLeaderboard() {
  socket.emit('get_leaderboard');
  showScreen('screen-leaderboard');
}

socket.on('leaderboard_data', function(data) {
  leaderboardData = data;
  renderLeaderboard();
});

function renderLeaderboard() {
  var list = document.getElementById('leaderboard-list');
  if (!leaderboardData.length) {
    list.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🏆</div><p>Пока нет игроков</p></div>';
    return;
  }
  var sorted = leaderboardData.slice().sort(function(a, b) {
    return leaderSort === 'wins' ? b.wins - a.wins : b.coins - a.coins;
  });
  var html = '';
  sorted.forEach(function(p, i) {
    var rank = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1) + '.';
    var cls = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
    html += '<div class="leader-item">';
    html += '<div class="leader-rank ' + cls + '">' + rank + '</div>';
    html += '<div class="leader-name">' + p.username + (p.isAdmin ? ' 👑' : '') + '</div>';
    html += '<div class="leader-stats"><span>🏆 ' + p.wins + '</span><span>💀 ' + p.losses + '</span><span>🪙 ' + p.coins + '</span></div>';
    html += '</div>';
  });
  list.innerHTML = html;
}

function switchLeaderTab(sort, btn) {
  leaderSort = sort;
  document.querySelectorAll('.leaderboard-tabs .tab-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  renderLeaderboard();
}

function showShop() {
  if (!currentUser) { showToast('Войдите в аккаунт', 'error'); return; }
  socket.emit('get_shop');
  document.getElementById('shop-coins').textContent = currentUser.coins;
  showScreen('screen-shop');
}

socket.on('shop_data', function(items) {
  shopItems = items;
  renderShop('all');
});

function renderShop(filter) {
  var grid = document.getElementById('shop-items');
  var filtered = filter === 'all' ? shopItems : shopItems.filter(function(i) { return i.type === filter; });
  if (!filtered.length) {
    grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🛒</div><p>Нет товаров</p></div>';
    return;
  }
  var html = '';
  filtered.forEach(function(item) {
    var owned = currentUser && currentUser.inventory && currentUser.inventory.includes(item.id);
    html += '<div class="shop-item' + (owned ? ' owned' : '') + '">';
    html += '<div class="shop-item-emoji">' + item.emoji + '</div>';
    html += '<div class="shop-item-name">' + item.name + '</div>';
    html += '<div class="shop-item-desc">' + item.description + '</div>';
    html += '<div class="shop-item-price">' + (owned ? '✅ Куплено' : '🪙 ' + item.price) + '</div>';
    if (!owned) {
      html += '<button class="btn btn-primary btn-sm" onclick="buyItem(' + item.id + ')">Купить</button>';
    }
    html += '</div>';
  });
  grid.innerHTML = html;
}

function filterShop(filter, btn) {
  document.querySelectorAll('.shop-tabs .tab-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  renderShop(filter);
}

function buyItem(itemId) {
  if (!currentUser) return;
  socket.emit('buy_item', { userId: currentUser.id, itemId: itemId });
}

socket.on('buy_result', function(d) {
  if (d.success) {
    currentUser = d.user;
    localStorage.setItem('pvz_user', JSON.stringify(d.user));
    updateUserPanel();
    document.getElementById('shop-coins').textContent = currentUser.coins;
    renderShop('all');
    showToast(d.message, 'success');
  } else {
    showToast(d.message, 'error');
  }
});

function usePromo() {
  if (!currentUser) { showToast('Войдите в аккаунт', 'error'); return; }
  var code = document.getElementById('promo-input').value.trim();
  if (!code) { showToast('Введите промокод', 'error'); return; }
  socket.emit('use_promo', { userId: currentUser.id, code: code });
}

socket.on('promo_result', function(d) {
  var res = document.getElementById('promo-result');
  res.classList.remove('hidden');
  if (d.success) {
    currentUser = d.user;
    localStorage.setItem('pvz_user', JSON.stringify(d.user));
    updateUserPanel();
    document.getElementById('shop-coins').textContent = currentUser.coins;
    res.className = 'success-msg';
    res.textContent = d.message;
    document.getElementById('promo-input').value = '';
  } else {
    res.className = 'error-msg';
    res.textContent = d.message;
  }
  setTimeout(function() { res.classList.add('hidden'); }, 3000);
});

function findGame() {
  if (!currentUser) { showToast('Войдите в аккаунт', 'error'); return; }
  socket.emit('find_game', { userId: currentUser.id, username: currentUser.username });
  showScreen('screen-searching');
}

function cancelSearch() {
  if (!currentUser) return;
  socket.emit('cancel_search', { userId: currentUser.id });
}

socket.on('search_cancelled', function() {
  showScreen('screen-menu');
});

socket.on('waiting_for_opponent', function() {
  showScreen('screen-searching');
});

socket.on('game_start', function(data) {
  localStorage.setItem('pvz_game', JSON.stringify(data));
  window.location.href = '/game.html';
});

// Восстановление сессии
window.addEventListener('DOMContentLoaded', function() {
  var saved = localStorage.getItem('pvz_user');
  if (saved) {
    try {
      currentUser = JSON.parse(saved);
      updateUserPanel();
    } catch(e) {}
  }
});
`;

fs.appendFileSync('public/app.js', appJS, 'utf8');
console.log('app.js complete, size:', fs.statSync('public/app.js').size);

// ===== GAME.JS =====
const gameJS = `
var socket = io();
var gameId = null;
var myRole = null;
var myUserId = null;
var gameState = null;
var selectedPlant = null;
var selectedZombie = 'basic';
var selectedLane = 0;
var gameStartTime = null;
var timerInterval = null;
var plantNames = { peashooter: 'Горошина', sunflower: 'Подсолнух', wallnut: 'Орех', cherrybomb: 'Вишня', snowpea: 'Снежный горох' };
var plantEmoji = { peashooter: '🌱', sunflower: '🌻', wallnut: '🥜', cherrybomb: '🍒', snowpea: '❄️' };
var zombieEmoji = { basic: '🧟', cone: '🧟‍♂️', bucket: '🪣', football: '🏈' };

function showToast(msg, type) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast ' + (type || 'success');
  t.classList.remove('hidden');
  setTimeout(function() { t.classList.add('hidden'); }, 3000);
}

// Загрузка данных игры
window.addEventListener('DOMContentLoaded', function() {
  var saved = localStorage.getItem('pvz_user');
  if (saved) { try { var u = JSON.parse(saved); myUserId = u.id; } catch(e) {} }
  
  var gameData = localStorage.getItem('pvz_game');
  if (!gameData) { window.location.href = '/'; return; }
  
  try {
    var data = JSON.parse(gameData);
    gameId = data.gameId;
    myRole = data.role;
    gameState = data.gameState;
    
    document.getElementById('hud-plant-name').textContent = myRole === 'plant' ? (JSON.parse(localStorage.getItem('pvz_user') || '{}').username || '?') : data.opponent;
    document.getElementById('hud-zombie-name').textContent = myRole === 'zombie' ? (JSON.parse(localStorage.getItem('pvz_user') || '{}').username || '?') : data.opponent;
    
    document.getElementById('resources-bar').classList.remove('hidden');
    
    if (myRole === 'plant') {
      document.getElementById('plant-panel').classList.remove('hidden');
      document.getElementById('sun-display').classList.remove('hidden');
    } else {
      document.getElementById('zombie-panel').classList.remove('hidden');
      document.getElementById('brain-display').classList.remove('hidden');
    }
    
    buildGrid();
    updateDisplay(gameState);
    
    gameStartTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
    
    socket.emit('rejoin_game', { gameId: gameId, userId: myUserId });
  } catch(e) {
    console.error(e);
    window.location.href = '/';
  }
});

function buildGrid() {
  var grid = document.getElementById('game-grid');
  grid.innerHTML = '';
  for (var row = 0; row < 5; row++) {
    for (var col = 1; col <= 9; col++) {
      var cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.dataset.col = col;
      cell.dataset.row = row;
      if (myRole === 'plant') {
        cell.addEventListener('click', onCellClick);
      }
      grid.appendChild(cell);
    }
  }
}

function onCellClick(e) {
  if (!selectedPlant) { showToast('Выберите растение!', 'error'); return; }
  var col = parseInt(e.currentTarget.dataset.col);
  var row = parseInt(e.currentTarget.dataset.row);
  socket.emit('place_plant', { gameId: gameId, userId: myUserId, plantType: selectedPlant, col: col, row: row });
}

function selectPlant(type) {
  selectedPlant = type;
  document.querySelectorAll('.plant-card').forEach(function(c) { c.classList.remove('selected'); });
  var card = document.querySelector('.plant-card[data-type="' + type + '"]');
  if (card) card.classList.add('selected');
  document.getElementById('selected-plant-info').textContent = 'Выбрано: ' + (plantNames[type] || type) + '. Нажмите на клетку.';
}

function selectZombie(type) {
  selectedZombie = type;
  document.querySelectorAll('.zombie-card').forEach(function(c) { c.classList.remove('selected'); });
  var card = document.querySelector('.zombie-card[data-type="' + type + '"]');
  if (card) card.classList.add('selected');
}

function selectLane(lane, btn) {
  selectedLane = lane;
  document.querySelectorAll('.lane-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
}

function sendZombie() {
  if (!selectedZombie) { showToast('Выберите зомби!', 'error'); return; }
  socket.emit('send_zombie', { gameId: gameId, userId: myUserId, zombieType: selectedZombie, lane: selectedLane });
}

function updateDisplay(state) {
  if (!state) return;
  gameState = state;
  
  document.getElementById('sun-count').textContent = state.plantSun || 0;
  document.getElementById('brain-count').textContent = state.zombieBrains || 0;
  
  var hp = state.plantHP || 0;
  document.getElementById('hp-fill').style.width = hp + '%';
  document.getElementById('hp-text').textContent = hp;
  
  renderGrid(state.grid || {});
  renderZombies(state.zombies || []);
}

function renderGrid(grid) {
  document.querySelectorAll('.grid-cell').forEach(function(cell) {
    var col = cell.dataset.col;
    var row = cell.dataset.row;
    var key = col + '_' + row;
    if (grid[key]) {
      var plant = grid[key];
      cell.classList.add('has-plant');
      cell.innerHTML = (plantEmoji[plant.type] || '🌿') + '<div class="plant-hp">HP:' + plant.hp + '</div>';
    } else {
      cell.classList.remove('has-plant');
      cell.innerHTML = '';
    }
  });
}

function renderZombies(zombies) {
  var layer = document.getElementById('zombies-layer');
  layer.innerHTML = '';
  var areaW = 720;
  var areaH = 400;
  var cellW = areaW / 9;
  var cellH = areaH / 5;
  
  zombies.forEach(function(z) {
    var el = document.createElement('div');
    el.className = 'zombie-sprite';
    var x = (z.col / 9) * areaW;
    var y = z.lane * cellH + cellH * 0.1;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.width = cellW + 'px';
    el.style.height = cellH * 0.8 + 'px';
    el.style.display = 'flex';
    el.style.flexDirection = 'column';
    el.style.alignItems = 'center';
    
    var maxHp = { basic: 3, cone: 5, bucket: 8, football: 10 };
    var hpPct = Math.max(0, (z.hp / (maxHp[z.type] || 3)) * 100);
    
    el.innerHTML = (zombieEmoji[z.type] || '🧟') + '<div class="zombie-hp-bar"><div class="zombie-hp-fill" style="width:' + hpPct + '%"></div></div>';
    layer.appendChild(el);
  });
}

function updateTimer() {
  if (!gameStartTime) return;
  var elapsed = Math.floor((Date.now() - gameStartTime) / 1000);
  var m = Math.floor(elapsed / 60);
  var s = elapsed % 60;
  document.getElementById('game-timer').textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
}

function leaveGame() {
  if (confirm('Сдаться? Вы проиграете.')) {
    socket.emit('leave_game', { gameId: gameId, userId: myUserId });
  }
}

socket.on('game_update', function(state) {
  updateDisplay(state);
});

socket.on('action_error', function(d) {
  showToast(d.message, 'error');
});

socket.on('game_over', function(data) {
  clearInterval(timerInterval);
  localStorage.removeItem('pvz_game');
  
  var screen = document.getElementById('game-over-screen');
  screen.classList.remove('hidden');
  
  var myUsername = JSON.parse(localStorage.getItem('pvz_user') || '{}').username;
  var iWon = (myRole === data.winner);
  
  document.getElementById('game-over-emoji').textContent = iWon ? '🏆' : '💀';
  document.getElementById('game-over-title').textContent = iWon ? 'Победа!' : 'Поражение!';
  
  var reason = data.reason === 'disconnect' ? 'Соперник отключился' : data.reason === 'surrender' ? 'Соперник сдался' : 'Зомби прорвались!';
  document.getElementById('game-over-desc').textContent = reason;
  
  if (iWon) {
    var reward = document.getElementById('game-over-reward');
    reward.classList.remove('hidden');
    reward.innerHTML = '+' + data.reward + ' 🪙';
  }
});

socket.on('disconnect', function() {
  showToast('Соединение потеряно', 'error');
});
`;

fs.writeFileSync('public/game.js', gameJS, 'utf8');
console.log('game.js complete, size:', fs.statSync('public/game.js').size);

// ===== ADMIN.JS =====
const adminJS = `
var socket = io();
var currentAdmin = null;
var adminData = { users: [], promoCodes: [], shopItems: [] };
var coinTargetId = null;

function showToast(msg, type) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast ' + (type || 'success');
  t.classList.remove('hidden');
  setTimeout(function() { t.classList.add('hidden'); }, 3000);
}

window.addEventListener('DOMContentLoaded', function() {
  var saved = localStorage.getItem('pvz_user');
  if (!saved) { window.location.href = '/'; return; }
  try {
    currentAdmin = JSON.parse(saved);
    if (!currentAdmin.isAdmin) { alert('Нет доступа!'); window.location.href = '/'; return; }
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
  document.querySelectorAll('.admin-tab').forEach(function(t) { t.classList.remove('active'); t.classList.add('hidden'); });
  document.querySelectorAll('.admin-nav-btn').forEach(function(b) { b.classList.remove('active'); });
  document.getElementById(tabId).classList.add('active');
  document.getElementById(tabId).classList.remove('hidden');
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
    html += '<button class="btn btn-warning btn-sm" onclick="openGiveCoins(\'' + u.id + '\',\'' + u.username + '\')">🪙 Монеты</button>';
    if (!u.isAdmin) {
      html += '<button class="btn btn-purple btn-sm" onclick="setAdmin(\'' + u.id + '\',true)">👑 Сделать админом</button>';
    } else {
      html += '<button class="btn btn-secondary btn-sm" onclick="setAdmin(\'' + u.id + '\',false)">❌ Снять права</button>';
    }
    html += '<button class="btn btn-danger btn-sm" onclick="deleteUser(\'' + u.id + '\',\'' + u.username + '\')">🗑️ Удалить</button>';
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
    document.getElementById('promos-table-container').innerHTML = '<div class="empty-state"><div class="empty-state-icon">🎁</div><p>Нет промокодов</p></div>';
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
    html += '<button class="btn btn-warning btn-sm" onclick="togglePromo(\'' + p.id + '\')">' + (p.active ? '⏸️ Деактивировать' : '▶️ Активировать') + '</button>';
    html += '<button class="btn btn-danger btn-sm" onclick="deletePromo(\'' + p.id + '\')">🗑️ Удалить</button>';
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
  document.getElementById('stat-total-wins').textContent = users.reduce(function(s, u) { return s + u.wins; }, 0);
  document.getElementById('stat-total-coins').textContent = users.reduce(function(s, u) { return s + u.coins; }, 0);
  
  var top = users.slice().sort(function(a, b) { return b.wins - a.wins; }).slice(0, 5);
  var html = '';
  top.forEach(function(u, i) {
    var rank = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1) + '.';
    html += '<div class="top-player-item"><div class="top-player-rank">' + rank + '</div><div class="top-player-name">' + u.username + (u.isAdmin ? ' 👑' : '') + '</div><div class="top-player-stats">🏆 ' + u.wins + ' | 🪙 ' + u.coins + '</div></div>';
  });
  document.getElementById('top-players-list').innerHTML = html || '<p style="color:#aaa">Нет данных</p>';
}

function createPromo() {
  var code = document.getElementById('new-promo-code').value.trim().toUpperCase();
  var reward = parseInt(document.getElementById('new-promo-reward').value) || 100;
  var maxUses = parseInt(document.getElementById('new-promo-maxuses').value) || 0;
  var res = document.getElementById('promo-create-result');
  
  if (!code) { res.className = 'error-msg'; res.textContent = 'Введите код'; res.classList.remove('hidden'); return; }
  
  socket.emit('admin_create_promo', { userId: currentAdmin.id, code: code, reward: reward, maxUses: maxUses });
}

socket.on('admin_promo_result', function(d) {
  var res = document.getElementById('promo-create-result');
  res.classList.remove('hidden');
  res.className = d.success ? 'success-msg' : 'error-msg';
  res.textContent = d.message;
  if (d.success) {
    document.getElementById('new-promo-code').value = '';
    loadAdminData();
  }
  setTimeout(function() { res.classList.add('hidden'); }, 3000);
});

socket.on('admin_action_result', function(d) {
  showToast(d.message, d.success ? 'success' : 'error');
  if (d.success) loadAdminData();
  closeModal('modal-coins');
});

function setAdmin(targetId, value) {
  if (!confirm(value ? 'Сделать администратором?' : 'Снять права администратора?')) return;
  socket.emit('admin_set_admin', { userId: currentAdmin.id, targetId: targetId, value: value });
}

function deleteUser(targetId, username) {
  if (!confirm('Удалить пользователя ' + username + '?')) return;
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
  document.getElementById('modal-coins').classList.remove('hidden');
}

function confirmGiveCoins() {
  var amount = parseInt(document.getElementById('modal-coins-amount').value) || 0;
  if (amount <= 0) { showToast('Введите сумму', 'error'); return; }
  socket.emit('admin_give_coins', { userId: currentAdmin.id, targetId: coinTargetId, amount: amount });
}

function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}
`;

fs.writeFileSync('public/admin.js', adminJS, 'utf8');
console.log('admin.js complete, size:', fs.statSync('public/admin.js').size);
console.log('ALL FILES GENERATED!');
