
with open('public/index.html', 'r', encoding='utf-8', errors='replace') as f:
    content = f.read()

# Заменяем секцию главного меню (screen-menu) на новый красивый дизайн
import re

new_menu = '''  <!-- ГЛАВНОЕ МЕНЮ -->
  <div id="screen-menu" class="screen active">

    <!-- Анимированный фон -->
    <div class="menu-bg-animated">
      <div class="menu-bg-layer layer1"></div>
      <div class="menu-bg-layer layer2"></div>
      <div class="menu-bg-layer layer3"></div>
    </div>

    <!-- Плавающие элементы фона -->
    <div class="bg-floats">
      <span class="float-item" style="left:3%;top:70%;animation-delay:0s;font-size:40px;">&#x1F331;</span>
      <span class="float-item" style="left:8%;top:60%;animation-delay:0.4s;font-size:36px;">&#x1F33B;</span>
      <span class="float-item" style="left:14%;top:75%;animation-delay:0.8s;font-size:44px;">&#x1F335;</span>
      <span class="float-item" style="left:20%;top:65%;animation-delay:1.2s;font-size:38px;">&#x1F33A;</span>
      <span class="float-item" style="left:72%;top:72%;animation-delay:0.2s;font-size:38px;">&#x1F9DF;</span>
      <span class="float-item" style="left:80%;top:62%;animation-delay:0.6s;font-size:42px;">&#x1F9DF;&#x200D;&#x2642;&#xFE0F;</span>
      <span class="float-item" style="left:88%;top:70%;animation-delay:1.0s;font-size:36px;">&#x1FA78;</span>
      <span class="float-item" style="left:93%;top:60%;animation-delay:1.4s;font-size:40px;">&#x1F9DF;</span>
    </div>

    <div class="menu-main">

      <!-- ЛОГОТИП -->
      <div class="menu-logo">
        <div class="logo-icon-row">
          <span class="logo-plant">&#x1F331;</span>
          <span class="logo-vs">VS</span>
          <span class="logo-zombie">&#x1F9DF;</span>
        </div>
        <h1 class="logo-title">Plants vs Zombies</h1>
        <p class="logo-subtitle">&#x1F30D; Online Battle</p>
      </div>

      <!-- ГОСТЬ: кнопки входа -->
      <div id="guest-buttons" class="guest-panel">
        <div class="guest-btns">
          <button class="menu-btn menu-btn-primary" onclick="showScreen(\'screen-login\')">
            <span class="menu-btn-icon">&#x1F511;</span>
            <span class="menu-btn-text">Войти</span>
          </button>
          <button class="menu-btn menu-btn-success" onclick="showScreen(\'screen-register\')">
            <span class="menu-btn-icon">&#x1F4DD;</span>
            <span class="menu-btn-text">Регистрация</span>
          </button>
          <button class="menu-btn menu-btn-info" onclick="showLeaderboard()">
            <span class="menu-btn-icon">&#x1F3C6;</span>
            <span class="menu-btn-text">Лидеры</span>
          </button>
          <button class="menu-btn menu-btn-warning" onclick="startTutorial()">
            <span class="menu-btn-icon">&#x1F4D6;</span>
            <span class="menu-btn-text">Обучение</span>
          </button>
        </div>
      </div>

      <!-- ПОЛЬЗОВАТЕЛЬ: панель -->
      <div id="user-panel" class="user-panel hidden">

        <!-- Карточка игрока -->
        <div class="player-card">
          <div class="player-card-avatar" id="menu-avatar">&#x1F3AE;</div>
          <div class="player-card-info">
            <div class="player-card-name" id="menu-username">Игрок</div>
            <div class="player-card-stats">
              <div class="stat-chip coins-chip">
                <span>&#x1FA99;</span>
                <span id="menu-coins">0</span>
              </div>
              <div class="stat-chip wins-chip">
                <span>&#x1F3C6;</span>
                <span id="menu-wins">0</span>
              </div>
            </div>
          </div>
          <button class="player-card-logout" onclick="logout()" title="Выйти">&#x1F6AA;</button>
        </div>

        <!-- События -->
        <div id="events-display"></div>

        <!-- Основные кнопки -->
        <div class="main-action-btns">
          <button class="play-btn" onclick="findGame()">
            <span class="play-btn-icon">&#x2694;&#xFE0F;</span>
            <span class="play-btn-text">Найти игру</span>
            <span class="play-btn-sub">PvP онлайн</span>
          </button>
          <button class="play-btn play-btn-bot" onclick="showBotMenu()">
            <span class="play-btn-icon">&#x1F916;</span>
            <span class="play-btn-text">Против бота</span>
            <span class="play-btn-sub">Тренировка</span>
          </button>
        </div>

        <!-- Вторичные кнопки -->
        <div class="secondary-btns">
          <button class="sec-btn" onclick="showShop()">
            <span>&#x1F6D2;</span> Магазин
          </button>
          <button class="sec-btn" onclick="showLeaderboard()">
            <span>&#x1F3C6;</span> Лидеры
          </button>
          <button class="sec-btn" onclick="startTutorial()">
            <span>&#x1F4D6;</span> Обучение
          </button>
        </div>

        <!-- Кнопки администратора/модератора -->
        <div class="admin-btns-row">
          <button id="admin-btn" class="admin-panel-btn hidden" onclick="window.location.href=\'admin.html\'">
            &#x1F451; Admin Panel
          </button>
          <button id="mod-btn" class="mod-panel-btn hidden" onclick="window.location.href=\'mod.html\'">
            &#x1F6E1; Mod Panel
          </button>
          <button id="claim-admin-btn" class="claim-btn hidden" onclick="showClaimAdmin()">
            &#x1F511; Стать админом
          </button>
        </div>

      </div>
    </div>
  </div>'''

# Найдём и заменим секцию screen-menu
pattern = r'<!-- .*?ГЛАВН.*?-->\s*<div id="screen-menu".*?</div>\s*\n\s*<!-- .*?-->'
# Попробуем более простой подход - найдём начало и конец секции
start_marker = '<!-- '
# Найдём screen-menu div
start_idx = content.find('<div id="screen-menu"')
if start_idx == -1:
    # Попробуем найти по другому
    start_idx = content.find('screen-menu')
    print(f'Found screen-menu at index: {start_idx}')
    # Найдём открывающий div
    start_idx = content.rfind('<div', 0, start_idx)

# Найдём конец секции - следующий screen div
end_marker = '<div id="screen-login"'
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    # Найдём комментарий перед screen-menu
    comment_start = content.rfind('<!--', 0, start_idx)
    if comment_start != -1 and comment_start > start_idx - 100:
        start_idx = comment_start
    
    old_section = content[start_idx:end_idx]
    content = content[:start_idx] + new_menu + '\n\n  ' + content[end_idx:]
    print(f'Replaced menu section ({len(old_section)} chars)')
else:
    print(f'Could not find markers: start={start_idx}, end={end_idx}')

with open('public/index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done!')
