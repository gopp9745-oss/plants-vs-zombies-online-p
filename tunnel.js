/**
 * Туннель для PvZ Online через ngrok
 *
 * Для постоянного URL:
 * 1. Зайдите на https://dashboard.ngrok.com/domains
 * 2. Создайте бесплатный Static Domain
 * 3. Вставьте его в STATIC_DOMAIN ниже
 * 4. Получите authtoken: https://dashboard.ngrok.com/get-started/your-authtoken
 * 5. Выполните: ngrok config add-authtoken ВАШ_ТОКЕН
 */
const { spawn, execSync } = require('child_process');
const http = require('http');

// ===== НАСТРОЙКИ =====
// Вставьте ваш статический домен сюда (например: 'pvz-online.ngrok-free.app')
// Если пусто — будет случайный URL каждый раз
// ⚠️ ВНИМАНИЕ:petalless-superregal-sally.ngrok-free.dev ЗАБЛОКИРОВАН!
// Используйте случайный домен (пустая строка)
const STATIC_DOMAIN = '';  // СЛУЧАЙНЫЙ ДОМЕН
// =====================

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function getNgrokURL(port) {
  return new Promise((resolve, reject) => {
    const p = port || 4040;
    const req = http.get('http://127.0.0.1:' + p + '/api/tunnels', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const tunnel = json.tunnels.find(t => t.proto === 'https');
          if (tunnel) resolve(tunnel.public_url);
          else reject(new Error('no https tunnel'));
        } catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.setTimeout(3000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

async function findNgrokURL() {
  // Пробуем порты 4040, 4041, 4042
  for (const port of [4040, 4041, 4042]) {
    try {
      const url = await getNgrokURL(port);
      return { url, port };
    } catch(e) {}
  }
  return null;
}

function killNgrok() {
  try { execSync('taskkill /F /IM ngrok.exe', { stdio: 'ignore' }); } catch(e) {}
}

async function launchNgrok() {
  killNgrok();
  await sleep(1500);

  const ngrokPath = 'C:\\Users\\MyPc\\AppData\\Roaming\\npm\\ngrok.cmd';
  const ngrokArgs = STATIC_DOMAIN
    ? ['http', '3000', '--domain=' + STATIC_DOMAIN]
    : ['http', '3000'];

  const ngrokProc = spawn(ngrokPath, ngrokArgs, {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
    shell: true
  });
  ngrokProc.unref();

  // Ждём запуска
  for (let i = 0; i < 20; i++) {
    await sleep(1000);
    const result = await findNgrokURL();
    if (result) return result;
    process.stdout.write('.');
  }
  return null;
}

async function main() {
  console.log('🚀 PvZ Online — запуск туннеля...');
  if (STATIC_DOMAIN) console.log('  🔗 Статический домен: ' + STATIC_DOMAIN);

  // Проверяем — может уже запущен
  let result = await findNgrokURL();

  if (!result) {
    console.log('  Запускаем ngrok...');
    result = await launchNgrok();
  }

  if (!result) {
    console.error('\n❌ Не удалось запустить ngrok!');
    console.error('   Убедитесь что выполнили: ngrok config add-authtoken ВАШ_ТОКЕН');
    process.exit(1);
  }

  console.log('\n');
  console.log('='.repeat(55));
  console.log('  🌍 ПУБЛИЧНЫЙ ДОСТУП АКТИВЕН!');
  console.log('='.repeat(55));
  console.log('  📌 URL: ' + result.url);
  console.log('  Управление: http://127.0.0.1:' + result.port);
  console.log('='.repeat(55));

  let currentUrl = result.url;
  let failCount = 0;

  // Мониторинг — проверяем каждые 20 секунд
  setInterval(async () => {
    const r = await findNgrokURL();
    if (r) {
      failCount = 0;
      if (r.url !== currentUrl) {
        currentUrl = r.url;
        console.log('\n🔄 URL обновился: ' + currentUrl);
      }
    } else {
      failCount++;
      console.log('\n⚠️ Туннель недоступен (' + failCount + '/3)...');
      if (failCount >= 3) {
        console.log('🔄 Перезапускаем ngrok...');
        const newResult = await launchNgrok();
        if (newResult) {
          failCount = 0;
          currentUrl = newResult.url;
          console.log('✅ Туннель восстановлен: ' + currentUrl);
        } else {
          console.log('❌ Не удалось восстановить туннель');
          process.exit(1);
        }
      }
    }
  }, 20000);

  // Держим процесс живым
  process.on('SIGINT', () => { console.log('\n👋 Остановка...'); killNgrok(); process.exit(0); });
  process.on('SIGTERM', () => { killNgrok(); process.exit(0); });
}

main().catch(err => {
  console.error('❌ Ошибка:', err.message);
  process.exit(1);
});
