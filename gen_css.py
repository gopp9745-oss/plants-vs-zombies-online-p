
new_css = """

/* ===== НОВОЕ ГЛАВНОЕ МЕНЮ ===== */

/* Анимированный фон */
.menu-bg-animated {
  position: fixed; inset: 0; z-index: 0; overflow: hidden;
}
.menu-bg-layer {
  position: absolute; inset: 0;
}
.layer1 {
  background: linear-gradient(135deg, #0a1628 0%, #1a2f1a 40%, #0d1f0d 100%);
}
.layer2 {
  background: radial-gradient(ellipse at 20% 50%, rgba(76,175,80,0.15) 0%, transparent 60%),
              radial-gradient(ellipse at 80% 50%, rgba(244,67,54,0.1) 0%, transparent 60%);
  animation: bgPulse 6s ease-in-out infinite alternate;
}
.layer3 {
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234CAF50' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.5;
}
@keyframes bgPulse {
  0% { opacity: 0.5; }
  100% { opacity: 1; }
}

/* Плавающие элементы */
.bg-floats {
  position: fixed; inset: 0; z-index: 1; pointer-events: none; overflow: hidden;
}
.float-item {
  position: absolute;
  animation: floatUp 8s ease-in-out infinite;
  opacity: 0.25;
  filter: drop-shadow(0 0 8px rgba(76,175,80,0.4));
}
@keyframes floatUp {
  0%, 100% { transform: translateY(0) rotate(-5deg); opacity: 0.2; }
  50% { transform: translateY(-20px) rotate(5deg); opacity: 0.35; }
}

/* Основной контейнер меню */
.menu-main {
  position: relative; z-index: 10;
  min-height: 100vh;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 20px;
  gap: 20px;
}

/* ЛОГОТИП */
.menu-logo {
  text-align: center;
  animation: logoEntrance 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
@keyframes logoEntrance {
  from { opacity: 0; transform: translateY(-40px) scale(0.8); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.logo-icon-row {
  display: flex; align-items: center; justify-content: center;
  gap: 12px; margin-bottom: 8px;
}
.logo-plant {
  font-size: 56px;
  animation: plantBob 2s ease-in-out infinite;
  filter: drop-shadow(0 0 12px rgba(76,175,80,0.8));
}
.logo-zombie {
  font-size: 56px;
  animation: zombieSway 2.5s ease-in-out infinite;
  filter: drop-shadow(0 0 12px rgba(244,67,54,0.8));
}
.logo-vs {
  font-size: 28px; font-weight: 900;
  background: linear-gradient(135deg, #FFD700, #FF6B35);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: none;
  padding: 4px 10px;
  border: 2px solid rgba(255,215,0,0.4);
  border-radius: 8px;
  animation: vsPulse 1.5s ease-in-out infinite;
}
@keyframes plantBob {
  0%, 100% { transform: translateY(0) rotate(-5deg); }
  50% { transform: translateY(-8px) rotate(5deg); }
}
@keyframes zombieSway {
  0%, 100% { transform: translateY(0) rotate(5deg); }
  50% { transform: translateY(-6px) rotate(-5deg); }
}
@keyframes vsPulse {
  0%, 100% { box-shadow: 0 0 10px rgba(255,215,0,0.3); }
  50% { box-shadow: 0 0 20px rgba(255,215,0,0.6); }
}
.logo-title {
  font-size: clamp(24px, 5vw, 42px);
  font-weight: 900;
  background: linear-gradient(135deg, #4CAF50, #8BC34A, #CDDC39);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0; letter-spacing: 1px;
  text-shadow: none;
}
.logo-subtitle {
  font-size: 16px; color: rgba(255,255,255,0.6);
  margin: 4px 0 0; letter-spacing: 3px; text-transform: uppercase;
}

/* ГОСТЬ: кнопки */
.guest-panel {
  animation: fadeInUp 0.6s 0.3s both;
}
.guest-btns {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 12px; max-width: 400px;
}
.menu-btn {
  display: flex; flex-direction: column; align-items: center;
  gap: 6px; padding: 16px 20px;
  border: none; border-radius: 16px; cursor: pointer;
  font-size: 15px; font-weight: 700;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  position: relative; overflow: hidden;
}
.menu-btn::before {
  content: ''; position: absolute; inset: 0;
  background: rgba(255,255,255,0.1);
  opacity: 0; transition: opacity 0.2s;
}
.menu-btn:hover::before { opacity: 1; }
.menu-btn:hover { transform: translateY(-3px) scale(1.03); }
.menu-btn:active { transform: scale(0.97); }
.menu-btn-icon { font-size: 28px; }
.menu-btn-text { font-size: 14px; }
.menu-btn-primary { background: linear-gradient(135deg, #1565C0, #1976D2); color: #fff; }
.menu-btn-success { background: linear-gradient(135deg, #2E7D32, #388E3C); color: #fff; }
.menu-btn-info { background: linear-gradient(135deg, #00695C, #00897B); color: #fff; }
.menu-btn-warning { background: linear-gradient(135deg, #E65100, #F57C00); color: #fff; }

/* КАРТОЧКА ИГРОКА */
.player-card {
  display: flex; align-items: center; gap: 14px;
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 20px; padding: 16px 20px;
  width: 100%; max-width: 420px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  animation: fadeInUp 0.5s 0.1s both;
}
.player-card-avatar {
  font-size: 44px; width: 60px; height: 60px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(76,175,80,0.2);
  border-radius: 50%; border: 2px solid rgba(76,175,80,0.5);
  flex-shrink: 0;
}
.player-card-info { flex: 1; }
.player-card-name {
  font-size: 20px; font-weight: 800; color: #fff;
  margin-bottom: 6px;
}
.player-card-stats { display: flex; gap: 10px; }
.stat-chip {
  display: flex; align-items: center; gap: 5px;
  padding: 4px 12px; border-radius: 20px;
  font-size: 14px; font-weight: 700;
}
.coins-chip { background: rgba(255,215,0,0.2); color: #FFD700; border: 1px solid rgba(255,215,0,0.3); }
.wins-chip { background: rgba(76,175,80,0.2); color: #81C784; border: 1px solid rgba(76,175,80,0.3); }
.player-card-logout {
  background: rgba(244,67,54,0.15); border: 1px solid rgba(244,67,54,0.3);
  color: #EF9A9A; border-radius: 12px; padding: 8px 12px;
  cursor: pointer; font-size: 20px; transition: all 0.2s;
  flex-shrink: 0;
}
.player-card-logout:hover { background: rgba(244,67,54,0.3); color: #fff; }

/* КНОПКИ ИГРЫ */
.main-action-btns {
  display: flex; gap: 14px; width: 100%; max-width: 420px;
  animation: fadeInUp 0.5s 0.2s both;
}
.play-btn {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  gap: 4px; padding: 18px 16px;
  border: none; border-radius: 20px; cursor: pointer;
  background: linear-gradient(135deg, #1B5E20, #2E7D32, #388E3C);
  box-shadow: 0 6px 20px rgba(46,125,50,0.5), inset 0 1px 0 rgba(255,255,255,0.1);
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative; overflow: hidden;
}
.play-btn::after {
  content: ''; position: absolute; top: 0; left: -100%;
  width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
  transition: left 0.4s;
}
.play-btn:hover::after { left: 100%; }
.play-btn:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 10px 30px rgba(46,125,50,0.6); }
.play-btn:active { transform: scale(0.97); }
.play-btn-bot {
  background: linear-gradient(135deg, #1A237E, #283593, #3949AB);
  box-shadow: 0 6px 20px rgba(40,53,147,0.5), inset 0 1px 0 rgba(255,255,255,0.1);
}
.play-btn-bot:hover { box-shadow: 0 10px 30px rgba(40,53,147,0.6); }
.play-btn-icon { font-size: 32px; }
.play-btn-text { font-size: 16px; font-weight: 800; color: #fff; }
.play-btn-sub { font-size: 11px; color: rgba(255,255,255,0.6); }

/* ВТОРИЧНЫЕ КНОПКИ */
.secondary-btns {
  display: flex; gap: 10px; width: 100%; max-width: 420px;
  animation: fadeInUp 0.5s 0.3s both;
}
.sec-btn {
  flex: 1; display: flex; align-items: center; justify-content: center;
  gap: 6px; padding: 12px 8px;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 14px; cursor: pointer;
  background: rgba(255,255,255,0.07);
  backdrop-filter: blur(10px);
  color: rgba(255,255,255,0.85); font-size: 13px; font-weight: 600;
  transition: all 0.2s;
}
.sec-btn:hover {
  background: rgba(255,255,255,0.15);
  border-color: rgba(255,255,255,0.3);
  transform: translateY(-2px);
}
.sec-btn:active { transform: scale(0.97); }

/* КНОПКИ АДМИНА/МОДЕРАТОРА */
.admin-btns-row {
  display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;
  width: 100%; max-width: 420px;
  animation: fadeInUp 0.5s 0.4s both;
}
.admin-panel-btn {
  padding: 10px 20px; border: none; border-radius: 12px; cursor: pointer;
  background: linear-gradient(135deg, #4A148C, #6A1B9A);
  color: #fff; font-size: 14px; font-weight: 700;
  box-shadow: 0 4px 15px rgba(74,20,140,0.4);
  transition: all 0.2s;
}
.admin-panel-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(74,20,140,0.6); }
.mod-panel-btn {
  padding: 10px 20px; border: none; border-radius: 12px; cursor: pointer;
  background: linear-gradient(135deg, #E65100, #F57C00);
  color: #fff; font-size: 14px; font-weight: 700;
  box-shadow: 0 4px 15px rgba(230,81,0,0.4);
  transition: all 0.2s;
}
.mod-panel-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(230,81,0,0.6); }
.claim-btn {
  padding: 10px 20px; border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; cursor: pointer;
  background: rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.7); font-size: 13px; font-weight: 600;
  transition: all 0.2s;
}
.claim-btn:hover { background: rgba(255,255,255,0.15); color: #fff; }

/* Анимация появления */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Панель пользователя - убираем старые стили */
#user-panel.user-panel {
  display: flex; flex-direction: column; align-items: center;
  gap: 14px; width: 100%; max-width: 420px;
  background: none; border: none; padding: 0;
}
"""

with open('public/style.css', 'r', encoding='utf-8', errors='replace') as f:
    css = f.read()

css += new_css

with open('public/style.css', 'w', encoding='utf-8') as f:
    f.write(css)
print('CSS added! Done!')
