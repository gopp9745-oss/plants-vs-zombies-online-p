const fs = require('fs');

// ===== 1. FIX INDEX.HTML =====
// - Скрыть кнопку "Код администратора" (id="claim-admin-btn") - показывать только если НЕ админ
// - Добавить кнопку "Обучение"
// - Добавить модальное окно обучения

const newIndexHTML = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🌱 Plants vs Zombies Online</title>
  <link rel="stylesheet" href="style.css">
  <style>
    /* TUTORIAL STYLES */
    .tutorial-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.85);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000;
    }
    .tutorial-card {
      background: #fff; border-radius: 20px; padding: 40px;
      max-width: 560px; width: 90%; position: relative;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }
    .tutorial-step-indicator {
      display: flex; gap: 8px; justify-content: center; margin-bottom: 20px;
    }
    .tutorial-dot {
      width: 10px; height: 10px; border-radius: 50%;
      background: #ddd; transition: background 0.3s;
    }
    .tutorial-dot.active { background: #4CAF50; }
    .tutorial-dot.done { background: #A5D6A7; }
    .tutorial-step-icon { font-size: 64px; text-align: center; margin-bottom: 15px; }
    .tutorial-step-title { font-size: 22px; font-weight: 700; color: #2E7D32; margin-bottom: 10px; text-align: center; }
    .tutorial-step-text { color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 20px; }
    .tutorial-step-text ul { padding-left: 20px; margin-top: 8px; }
    .tutorial-step-text li { margin-bottom: 6px; }
    .tutorial-nav { display: flex; gap: 10px; justify-content: space-between; align-items: center; }
    .tutorial-counter { color: #999; font-size: 14px; }
    .tutorial-highlight { background: #E8F5E9; border-left: 4px solid #4CAF50; padding: 10px 15px; border-radius: 0 8px 8px 0; margin: 10px 0; font-size: 14px; }
    .tutorial-tip { background: #FFF9C4; border-left: 4px solid #FFD700; padding: 10px 15px; border-radius: 0 8px 8px 0; margin: 10px 0; font-size: 14px; }
  </style>
</head>
<body class="main-bg">

  <!-- ГЛАВНОЕ МЕНЮ -->
  <div id="screen-menu" class="screen active">
    <div class="menu-container">
      <div class="game-title">
        <div class="title-emoji">🌱🧟</div>
        <h1>Plants vs Zombies</h1>
        <p class="subtitle">Онлайн Битва</p>
      </div>

      <div id="guest-buttons" class="menu-buttons">
        <button class="btn btn-primary" onclick="showScreen('screen-login')">🔑 Войти</button>
        <button class="btn btn-success" onclick="showScreen('screen-register')">📝 Регистрация</button>
        <button class="btn btn-info" onclick="showLeaderboard()">🏆 Таблица лидеров</button>
        <button class="btn btn-warning" onclick="startTutorial()">📖 Обучение</button>
      </div>

      <div id="user-panel" class="user-panel hidden">
        <div class="user-info-card">
          <div class="user-avatar" id="menu-avatar">🌱</div>
          <div class="user-details">
            <div class="user-name" id="menu-username">Игрок</div>
            <div class="user-stats">
              <span>🪙 <span id="menu-coins">0</span></span>
              <span>🏆 <span id="menu-wins">0</span> побед</span>
            </div>
          </div>
        </div>
        <div class="menu-buttons">
          <button class="btn btn-primary btn-large" onclick="findGame()">⚔️ Найти игру</button>
          <button class="btn btn-warning" onclick="showShop()">🛒 Магазин</button>
          <button class="btn btn-info" onclick="showLeaderboard()">🏆 Лидеры</button>
          <button class="btn btn-warning" onclick="startTutorial()">📖 Обучение</button>
          <button id="admin-btn" class="btn btn-purple hidden" onclick="window.location.href='admin.html'">👑 Админ панель</button>
          <button id="claim-admin-btn" class="btn btn-secondary hidden" onclick="showClaimAdmin()">🔑 Код администратора</button>
          <button class="btn btn-danger" onclick="logout()">🚪 Выйти</button>
        </div>
      </div>
    </div>

    <!-- Анимированный фон -->
    <div class="bg-plants">
      <span class="bg-plant" style="left:5%;animation-delay:0s">🌻</span>
      <span class="bg-plant" style="left:15%;animation-delay:0.5s">🌱</span>
      <span class="bg-plant" style="left:25%;animation-delay:1s">🍒</span>
      <span class="bg-plant" style="left:75%;animation-delay:0.3s">🌻</span>
      <span class="bg-plant" style="left:85%;animation-delay:0.8s">🌱</span>
      <span class="bg-plant" style="left:95%;animation-delay:1.3s">🍒</span>
      <span class="bg-zombie" style="right:10%;animation-delay:0.2s">🧟</span>
      <span class="bg-zombie" style="right:20%;animation-delay:0.7s">🧟‍♂️</span>
      <span class="bg-zombie" style="right:30%;animation-delay:1.2s">🧟</span>
    </div>
  </div>

  <!-- ВХОД -->
  <div id="screen-login" class="screen">
    <div class="auth-container">
      <div class="auth-card">
        <h2>🔑 Вход в игру</h2>
        <div class="form-group">
          <label>Имя пользователя</label>
          <input type="text" id="login-username" placeholder="Введите имя..." class="input-field">
        </div>
        <div class="form-group">
          <label>Пароль</label>
          <input type="password" id="login-password" placeholder="Введите пароль..." class="input-field">
        </div>
        <div id="login-error" class="error-msg hidden"></div>
        <div class="form-buttons">
          <button class="btn btn-primary" onclick="doLogin()">Войти</button>
          <button class="btn btn-secondary" onclick="showScreen('screen-menu')">Назад</button>
        </div>
        <p class="auth-link">Нет аккаунта? <a href="#" onclick="showScreen('screen-register')">Зарегистрироваться</a></p>
      </div>
    </div>
  </div>

  <!-- РЕГИСТРАЦИЯ -->
  <div id="screen-register" class="screen">
    <div class="auth-container">
      <div class="auth-card">
        <h2>📝 Регистрация</h2>
        <div class="form-group">
          <label>Имя пользователя (мин. 3 символа)</label>
          <input type="text" id="reg-username" placeholder="Придумайте имя..." class="input-field">
        </div>
        <div class="form-group">
          <label>Пароль (мин. 4 символа)</label>
          <input type="password" id="reg-password" placeholder="Придумайте пароль..." class="input-field">
        </div>
        <div class="form-group">
          <label>Повторите пароль</label>
          <input type="password" id="reg-password2" placeholder="Повторите пароль..." class="input-field">
        </div>
        <div id="reg-error" class="error-msg hidden"></div>
        <div id="reg-success" class="success-msg hidden"></div>
        <div class="form-buttons">
          <button class="btn btn-success" onclick="doRegister()">Зарегистрироваться</button>
          <button class="btn btn-secondary" onclick="showScreen('screen-menu')">Назад</button>
        </div>
        <p class="auth-link">Уже есть аккаунт? <a href="#" onclick="showScreen('screen-login')">Войти</a></p>
      </div>
    </div>
  </div>

  <!-- ТАБЛИЦА ЛИДЕРОВ -->
  <div id="screen-leaderboard" class="screen">
    <div class="leaderboard-container">
      <div class="page-header">
        <button class="btn btn-secondary btn-back" onclick="showScreen('screen-menu')">← Назад</button>
        <h2>🏆 Таблица лидеров</h2>
      </div>
      <div class="leaderboard-tabs">
        <button class="tab-btn active" onclick="switchLeaderTab('wins', this)">По победам</button>
        <button class="tab-btn" onclick="switchLeaderTab('coins', this)">По монетам</button>
      </div>
      <div id="leaderboard-list" class="leaderboard-list">
        <div class="loading">Загрузка...</div>
      </div>
    </div>
  </div>

  <!-- МАГАЗИН -->
  <div id="screen-shop" class="screen">
    <div class="shop-container">
      <div class="page-header">
        <button class="btn btn-secondary btn-back" onclick="showScreen('screen-menu')">← Назад</button>
        <h2>🛒 Магазин</h2>
        <div class="coins-display">🪙 <span id="shop-coins">0</span></div>
      </div>

      <div class="promo-section">
        <h3>🎁 Промокод</h3>
        <div class="promo-input-row">
          <input type="text" id="promo-input" placeholder="Введите промокод..." class="input-field">
          <button class="btn btn-success" onclick="usePromo()">Применить</button>
        </div>
        <div id="promo-result" class="hidden"></div>
      </div>

      <div class="shop-tabs">
        <button class="tab-btn active" onclick="filterShop('all', this)">Все</button>
        <button class="tab-btn" onclick="filterShop('plant', this)">🌱 Растения</button>
        <button class="tab-btn" onclick="filterShop('zombie', this)">🧟 Зомби</button>
        <button class="tab-btn" onclick="filterShop('skin', this)">✨ Скины</button>
      </div>

      <div id="shop-items" class="shop-grid">
        <div class="loading">Загрузка...</div>
      </div>
    </div>
  </div>

  <!-- ПОИСК ИГРЫ -->
  <div id="screen-searching" class="screen">
    <div class="searching-container">
      <div class="searching-card">
        <div class="searching-animation">
          <span>🌱</span>
          <div class="dots"><span>.</span><span>.</span><span>.</span></div>
          <span>🧟</span>
        </div>
        <h2>Поиск соперника...</h2>
        <p>Ожидаем второго игрока</p>
        <button class="btn btn-danger" onclick="cancelSearch()">Отмена</button>
      </div>
    </div>
  </div>

  <!-- УВЕДОМЛЕНИЕ -->
  <div id="toast" class="toast hidden"></div>

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

  <!-- ОБУЧЕНИЕ -->
  <div id="tutorial-overlay" class="tutorial-overlay" style="display:none">
    <div class="tutorial-card">
      <div class="tutorial-step-indicator" id="tutorial-dots"></div>
      <div id="tutorial-step-content"></div>
      <div class="tutorial-nav">
        <button class="btn btn-secondary btn-sm" id="tutorial-prev-btn" onclick="tutorialPrev()">← Назад</button>
        <span class="tutorial-counter" id="tutorial-counter"></span>
        <button class="btn btn-primary btn-sm" id="tutorial-next-btn" onclick="tutorialNext()">Далее →</button>
      </div>
    </div>
  </div>

  <script src="/socket.io/socket.io.js"></script>
  <script src="app.js"></script>
</body>
</html>`;

fs.writeFileSync('public/index.html', newIndexHTML, 'utf8');
console.log('index.html updated');

// ===== 2. FIX APP.JS - updateUserPanel скрывает claim-admin-btn для админов =====
let appJS = fs.readFileSync('public/app.js', 'utf8');

// Заменяем функцию updateUserPanel
const oldUpdateUserPanel = `function updateUserPanel(){if(!currentUser)return;document.getElementById("menu-username").textContent=currentUser.username;document.getElementById("menu-coins").textContent=currentUser.coins;document.getElementById("menu-wins").textContent=currentUser.wins;document.getElementById("menu-avatar").textContent=currentUser.isAdmin?"👑":"🌱";document.getElementById("guest-buttons").classList.add("hidden");document.getElementById("user-panel").classList.remove("hidden");if(currentUser.isAdmin)document.getElementById("admin-btn").classList.remove("hidden");}`;

const newUpdateUserPanel = `function updateUserPanel(){
  if(!currentUser)return;
  document.getElementById("menu-username").textContent=currentUser.username;
  document.getElementById("menu-coins").textContent=currentUser.coins;
  document.getElementById("menu-wins").textContent=currentUser.wins;
  document.getElementById("menu-avatar").textContent=currentUser.isAdmin?"👑":"🌱";
  document.getElementById("guest-buttons").classList.add("hidden");
  document.getElementById("user-panel").classList.remove("hidden");
  var adminBtn=document.getElementById("admin-btn");
  var claimBtn=document.getElementById("claim-admin-btn");
  if(currentUser.isAdmin){
    if(adminBtn)adminBtn.classList.remove("hidden");
    if(claimBtn)claimBtn.classList.add("hidden");
  } else {
    if(adminBtn)adminBtn.classList.add("hidden");
    if(claimBtn)claimBtn.classList.remove("hidden");
  }
}`;

if (appJS.includes(oldUpdateUserPanel)) {
  appJS = appJS.replace(oldUpdateUserPanel, newUpdateUserPanel);
  console.log('updateUserPanel replaced');
} else {
  // Попробуем найти и заменить по-другому
  appJS = appJS.replace(
    /function updateUserPanel\(\)\{[^}]+\}/,
    newUpdateUserPanel
  );
  console.log('updateUserPanel replaced (regex)');
}

// Добавляем tutorial функции в конец app.js
const tutorialCode = `

// ===== TUTORIAL =====
var tutorialStep = 0;
var tutorialSteps = [
  {
    icon: '🌱🧟',
    title: 'Добро пожаловать в PvZ Online!',
    text: '<p>Это пошаговая онлайн-игра, где два игрока сражаются друг против друга.</p><div class="tutorial-highlight">🌱 Один игрок управляет <strong>Растениями</strong><br>🧟 Другой игрок управляет <strong>Зомби</strong></div><p>Цель: Растения должны защитить свой дом, а Зомби — прорваться к нему!</p>'
  },
  {
    icon: '📝',
    title: 'Шаг 1: Регистрация',
    text: '<p>Для игры нужен аккаунт:</p><ul><li>Нажмите <strong>📝 Регистрация</strong> на главном экране</li><li>Придумайте имя (мин. 3 символа) и пароль (мин. 4 символа)</li><li>После регистрации войдите в аккаунт</li></ul><div class="tutorial-tip">💡 Имя будет видно другим игрокам в таблице лидеров</div>'
  },
  {
    icon: '⚔️',
    title: 'Шаг 2: Поиск игры',
    text: '<p>После входа нажмите <strong>⚔️ Найти игру</strong>.</p><p>Система автоматически найдёт соперника. Когда найдётся второй игрок — игра начнётся!</p><div class="tutorial-highlight">🎲 Роли (Растения / Зомби) назначаются случайно</div><p>Пока ждёте — можно отменить поиск кнопкой <strong>Отмена</strong>.</p>'
  },
  {
    icon: '🌻',
    title: 'Шаг 3: Игра за Растения',
    text: '<p>Если вы играете за <strong>Растения</strong>:</p><ul><li>☀️ Вы получаете <strong>Солнце</strong> каждые несколько секунд</li><li>Выберите растение из панели внизу</li><li>Нажмите на клетку поля чтобы посадить его</li><li>Растения автоматически атакуют зомби в своей линии</li></ul><div class="tutorial-highlight">🏠 Защищайте левый край поля — это ваш дом!</div>'
  },
  {
    icon: '🌱',
    title: 'Растения и их способности',
    text: '<ul><li>🌱 <strong>Горошина</strong> (50☀️) — стреляет горохом, базовый атакующий</li><li>🌻 <strong>Подсолнух</strong> (25☀️) — производит дополнительное солнце</li><li>🥜 <strong>Орех</strong> (50☀️) — прочная стена, замедляет зомби</li><li>🍒 <strong>Вишня</strong> (150☀️) — взрывается, уничтожает всех зомби в линии</li><li>❄️ <strong>Снежный горох</strong> (75☀️) — замораживает зомби</li></ul><div class="tutorial-tip">💡 Ставьте Подсолнухи в начале — они дают больше солнца!</div>'
  },
  {
    icon: '🧟',
    title: 'Шаг 4: Игра за Зомби',
    text: '<p>Если вы играете за <strong>Зомби</strong>:</p><ul><li>🧠 Вы получаете <strong>Мозги</strong> каждые несколько секунд</li><li>Выберите тип зомби из панели внизу</li><li>Выберите линию (1-5) куда отправить зомби</li><li>Нажмите <strong>Отправить зомби</strong></li></ul><div class="tutorial-highlight">🎯 Зомби идут справа налево — прорвитесь к дому!</div>'
  },
  {
    icon: '🧟‍♂️',
    title: 'Виды зомби',
    text: '<ul><li>🧟 <strong>Обычный</strong> (50🧠) — базовый зомби, мало HP</li><li>🧟‍♂️ <strong>Конус</strong> (75🧠) — средняя защита</li><li>🪣 <strong>Ведро</strong> (100🧠) — высокая защита, медленный</li><li>🏈 <strong>Футболист</strong> (150🧠) — очень быстрый, средняя защита</li></ul><div class="tutorial-tip">💡 Отправляйте зомби в линии где меньше растений!</div>'
  },
  {
    icon: '🏆',
    title: 'Шаг 5: Победа и награды',
    text: '<p><strong>Растения побеждают</strong> если продержатся до конца времени (5 минут).</p><p><strong>Зомби побеждают</strong> если хотя бы один зомби доберётся до левого края поля.</p><div class="tutorial-highlight">🪙 Победитель получает <strong>+50 монет</strong>!<br>💀 Проигравший получает <strong>+10 монет</strong> за участие</div>'
  },
  {
    icon: '🛒',
    title: 'Шаг 6: Магазин',
    text: '<p>В магазине можно купить улучшения за монеты:</p><ul><li>🌱 <strong>Растения</strong> — новые виды растений</li><li>🧟 <strong>Зомби</strong> — новые виды зомби</li><li>✨ <strong>Скины</strong> — косметические улучшения</li></ul><div class="tutorial-tip">💡 Используйте промокоды для получения бесплатных монет!</div>'
  },
  {
    icon: '🏅',
    title: 'Шаг 7: Таблица лидеров',
    text: '<p>В таблице лидеров можно увидеть лучших игроков сервера.</p><ul><li>🏆 Сортировка по <strong>победам</strong></li><li>🪙 Сортировка по <strong>монетам</strong></li></ul><div class="tutorial-highlight">👑 Администраторы отмечены короной</div><p>Играйте больше — поднимайтесь в рейтинге!</p>'
  },
  {
    icon: '🎉',
    title: 'Готово! Вы готовы к игре!',
    text: '<p>Теперь вы знаете всё необходимое для игры в <strong>Plants vs Zombies Online</strong>!</p><div class="tutorial-highlight">🌱 Защищайте дом растениями<br>🧟 Или атакуйте зомби<br>🏆 Побеждайте и поднимайтесь в рейтинге!</div><p style="text-align:center;margin-top:15px;font-size:18px">Удачи в битве! 🍀</p>'
  }
];

function startTutorial() {
  tutorialStep = 0;
  document.getElementById('tutorial-overlay').style.display = 'flex';
  renderTutorialStep();
}

function renderTutorialStep() {
  var step = tutorialSteps[tutorialStep];
  var total = tutorialSteps.length;

  // Dots
  var dotsHTML = '';
  for (var i = 0; i < total; i++) {
    var cls = i === tutorialStep ? 'active' : (i < tutorialStep ? 'done' : '');
    dotsHTML += '<div class="tutorial-dot ' + cls + '"></div>';
  }
  document.getElementById('tutorial-dots').innerHTML = dotsHTML;

  // Content
  document.getElementById('tutorial-step-content').innerHTML =
    '<div class="tutorial-step-icon">' + step.icon + '</div>' +
    '<div class="tutorial-step-title">' + step.title + '</div>' +
    '<div class="tutorial-step-text">' + step.text + '</div>';

  // Counter
  document.getElementById('tutorial-counter').textContent = (tutorialStep + 1) + ' / ' + total;

  // Buttons
  document.getElementById('tutorial-prev-btn').style.display = tutorialStep === 0 ? 'none' : 'inline-block';
  var nextBtn = document.getElementById('tutorial-next-btn');
  if (tutorialStep === total - 1) {
    nextBtn.textContent = '✅ Закрыть';
    nextBtn.className = 'btn btn-success btn-sm';
  } else {
    nextBtn.textContent = 'Далее →';
    nextBtn.className = 'btn btn-primary btn-sm';
  }
}

function tutorialNext() {
  if (tutorialStep < tutorialSteps.length - 1) {
    tutorialStep++;
    renderTutorialStep();
  } else {
    document.getElementById('tutorial-overlay').style.display = 'none';
  }
}

function tutorialPrev() {
  if (tutorialStep > 0) {
    tutorialStep--;
    renderTutorialStep();
  }
}

// Закрытие по клику на фон
document.getElementById && document.addEventListener('DOMContentLoaded', function() {
  var overlay = document.getElementById('tutorial-overlay');
  if (overlay) {
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        overlay.style.display = 'none';
      }
    });
  }
});
`;

appJS += tutorialCode;
fs.writeFileSync('public/app.js', appJS, 'utf8');
console.log('app.js updated with tutorial + fixed updateUserPanel');
console.log('app.js size:', fs.statSync('public/app.js').size);

console.log('\n=== ALL DONE ===');
console.log('1. Кнопка "Код администратора" скрыта для обычных игроков');
console.log('2. Добавлено пошаговое обучение (11 шагов)');
