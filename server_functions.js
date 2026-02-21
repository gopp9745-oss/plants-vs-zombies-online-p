// ==================== DAILY WINS FUNCTIONS ====================
// Функция возвращает время следующего сброса победы дня (15:00 Москва = 12:00 UTC)
function getDailyResetTime() {
  const now = new Date();
  const utcHour = now.getUTCHours();
  // Сброс в 12:00 UTC (15:00 Москва)
  let nextReset = new Date(now);
  if (utcHour >= 12) {
    // После 12:00 UTC - следующий день
    nextReset.setUTCDate(nextReset.getUTCDate() + 1);
  }
  nextReset.setUTCHours(12, 0, 0, 0);
  return nextReset.getTime();
}

// Функция проверяет, счастливый ли день (суббота или воскресенье)
function isLuckyDay() {
  const day = new Date().getDay();
  return day === 0 || day === 6; // 0 = воскресенье, 6 = суббота
}

// Награды за победы дня (обычный день)
const DAILY_WINS_REWARDS = [
  { wins: 1, label: 'Монетный мешочек', emoji: '👛', type: 'coins', min: 30, max: 50 },
  { wins: 2, label: 'Маленькая коробка', emoji: '📦', type: 'loot_box', boxType: 'coins_small' },
  { wins: 3, label: 'Карточная коллекция', emoji: '🃏', type: 'loot_box', boxType: 'card_common' },
  { wins: 4, label: 'Средняя коробка', emoji: '📫', type: 'loot_box', boxType: 'coins_medium' },
  { wins: 5, label: 'Редкая коробка', emoji: '🎁', type: 'loot_box', boxType: 'card_rare' },
  { wins: 6, label: 'Большая коробка', emoji: '📪', type: 'loot_box', boxType: 'coins_large' }
];

// Награды за победы дня (счастливый день - лучше)
const LUCKY_DAYS_REWARDS = [
  { wins: 1, label: 'Монетный кошелёк', emoji: '💰', type: 'coins', min: 60, max: 100 },
  { wins: 2, label: 'Ящик растений', emoji: '🌱', type: 'loot_box', boxType: 'plant_box' },
  { wins: 3, label: 'Редкая коллекция', emoji: '🎴', type: 'loot_box', boxType: 'card_rare' },
  { wins: 4, label: 'Ящик скинов', emoji: '✨', type: 'loot_box', boxType: 'skin_box' },
  { wins: 5, label: 'Эпическая коллекция', emoji: '💎', type: 'loot_box', boxType: 'card_epic' },
  { wins: 6, label: 'Супер-бокс', emoji: '🏆', type: 'loot_box', boxType: 'super_box' }
];

// ==================== UPGRADE CARDS ====================
const UPGRADE_CARDS = [
  // Карты для растений (обычные)
  { id: 'card_ps_atk_1', name: 'Горошина: +10% урон', emoji: '🌱', rarity: 'common', target: 'peashooter', effect: 'damage', value: 0.1, dropRate: 30 },
  { id: 'card_ps_hp_1', name: 'Горошина: +10% HP', emoji: '🌱', rarity: 'common', target: 'peashooter', effect: 'hp', value: 0.1, dropRate: 30 },
  { id: 'card_sf_sun_1', name: 'Подсолнух: +10% солнца', emoji: '🌻', rarity: 'common', target: 'sunflower', effect: 'sun', value: 0.1, dropRate: 30 },
  { id: 'card_wn_hp_1', name: 'Орех: +10% HP', emoji: '🥜', rarity: 'common', target: 'wallnut', effect: 'hp', value: 0.1, dropRate: 30 },
  
  // Карты для растений (редкие)
  { id: 'card_ps_atk_2', name: 'Горошина: +25% урон', emoji: '🌱', rarity: 'rare', target: 'peashooter', effect: 'damage', value: 0.25, dropRate: 15 },
  { id: 'card_ps_hp_2', name: 'Горошина: +25% HP', emoji: '🌱', rarity: 'rare', target: 'peashooter', effect: 'hp', value: 0.25, dropRate: 15 },
  { id: 'card_sf_sun_2', name: 'Подсолнух: +25% солнца', emoji: '🌻', rarity: 'rare', target: 'sunflower', effect: 'sun', value: 0.25, dropRate: 15 },
  { id: 'card_wn_hp_2', name: 'Орех: +25% HP', emoji: '🥜', rarity: 'rare', target: 'wallnut', effect: 'hp', value: 0.25, dropRate: 15 },
  { id: 'card_cb_atk_1', name: 'Вишня: +20% урон', emoji: '🍒', rarity: 'rare', target: 'cherrybomb', effect: 'damage', value: 0.2, dropRate: 15 },
  { id: 'card_sp_atk_1', name: 'Снежный: +20% урон', emoji: '❄️', rarity: 'rare', target: 'snowpea', effect: 'damage', value: 0.2, dropRate: 15 },
  
  // Карты для растений (эпические)
  { id: 'card_ps_atk_3', name: 'Горошина: +50% урон', emoji: '🌱', rarity: 'epic', target: 'peashooter', effect: 'damage', value: 0.5, dropRate: 7 },
  { id: 'card_ps_hp_3', name: 'Горошина: +50% HP', emoji: '🌱', rarity: 'epic', target: 'peashooter', effect: 'hp', value: 0.5, dropRate: 7 },
  { id: 'card_sf_sun_3', name: 'Подсолнух: +50% солнца', emoji: '🌻', rarity: 'epic', target: 'sunflower', effect: 'sun', value: 0.5, dropRate: 7 },
  { id: 'card_wn_hp_3', name: 'Орех: +50% HP', emoji: '🥜', rarity: 'epic', target: 'wallnut', effect: 'hp', value: 0.5, dropRate: 7 },
  { id: 'card_ff_atk_1', name: 'Огонь: +30% урон', emoji: '🌺', rarity: 'epic', target: 'fireflower', effect: 'damage', value: 0.3, dropRate: 7 },
  { id: 'card_ct_atk_1', name: 'Кактус: +30% урон', emoji: '🌵', rarity: 'epic', target: 'cactus', effect: 'damage', value: 0.3, dropRate: 7 },
  
  // Карты для растений (легендарные)
  { id: 'card_ps_max', name: 'Горошина: Максимум!', emoji: '⭐', rarity: 'legendary', target: 'peashooter', effect: 'max', value: 1.0, dropRate: 2 },
  { id: 'card_sf_max', name: 'Подсолнух: Максимум!', emoji: '⭐', rarity: 'legendary', target: 'sunflower', effect: 'max', value: 1.0, dropRate: 2 },
  { id: 'card_wn_max', name: 'Орех: Максимум!', emoji: '⭐', rarity: 'legendary', target: 'wallnut', effect: 'max', value: 1.0, dropRate: 2 },
  
  // Карты для зомби (обычные)
  { id: 'card_zb_atk_1', name: 'Зомби: +10% урон', emoji: '🧟', rarity: 'common', target: 'basic', effect: 'damage', value: 0.1, dropRate: 30 },
  { id: 'card_zb_hp_1', name: 'Зомби: +10% HP', emoji: '🧟', rarity: 'common', target: 'basic', effect: 'hp', value: 0.1, dropRate: 30 },
  { id: 'card_cone_atk_1', name: 'Конус: +10% урон', emoji: '🧟‍♂️', rarity: 'common', target: 'cone', effect: 'damage', value: 0.1, dropRate: 30 },
  { id: 'card_bucket_atk_1', name: 'Ведро: +10% урон', emoji: '🪣', rarity: 'common', target: 'bucket', effect: 'damage', value: 0.1, dropRate: 30 },
  
  // Карты для зомби (редкие)
  { id: 'card_zb_atk_2', name: 'Зомби: +25% урон', emoji: '🧟', rarity: 'rare', target: 'basic', effect: 'damage', value: 0.25, dropRate: 15 },
  { id: 'card_zb_hp_2', name: 'Зомби: +25% HP', emoji: '🧟', rarity: 'rare', target: 'basic', effect: 'hp', value: 0.25, dropRate: 15 },
  { id: 'card_cone_atk_2', name: 'Конус: +25% урон', emoji: '🧟‍♂️', rarity: 'rare', target: 'cone', effect: 'damage', value: 0.25, dropRate: 15 },
  { id: 'card_bucket_atk_2', name: 'Ведро: +25% урон', emoji: '🪣', rarity: 'rare', target: 'bucket', effect: 'damage', value: 0.25, dropRate: 15 },
  { id: 'card_football_atk_1', name: 'Футболист: +20% скорость', emoji: '🏈', rarity: 'rare', target: 'football', effect: 'speed', value: 0.2, dropRate: 15 },
  
  // Карты для зомби (эпические)
  { id: 'card_zb_atk_3', name: 'Зомби: +50% урон', emoji: '🧟', rarity: 'epic', target: 'basic', effect: 'damage', value: 0.5, dropRate: 7 },
  { id: 'card_zb_hp_3', name: 'Зомби: +50% HP', emoji: '🧟', rarity: 'epic', target: 'basic', effect: 'hp', value: 0.5, dropRate: 7 },
  { id: 'card_cone_atk_3', name: 'Конус: +50% урон', emoji: '🧟‍♂️', rarity: 'epic', target: 'cone', effect: 'damage', value: 0.5, dropRate: 7 },
  { id: 'card_bucket_atk_3', name: 'Ведро: +50% урон', emoji: '🪣', rarity: 'epic', target: 'bucket', effect: 'damage', value: 0.5, dropRate: 7 },
  { id: 'card_knight_atk_1', name: 'Рыцарь: +30% урон', emoji: '⚔️', rarity: 'epic', target: 'knight', effect: 'damage', value: 0.3, dropRate: 7 },
  { id: 'card_giant_atk_1', name: 'Гигант: +30% урон', emoji: '👹', rarity: 'epic', target: 'giant', effect: 'damage', value: 0.3, dropRate: 7 },
  
  // Карты для зомби (легендарные)
  { id: 'card_zb_max', name: 'Зомби: Максимум!', emoji: '👑', rarity: 'legendary', target: 'basic', effect: 'max', value: 1.0, dropRate: 2 },
  { id: 'card_giant_max', name: 'Гигант: Максимум!', emoji: '👑', rarity: 'legendary', target: 'giant', effect: 'max', value: 1.0, dropRate: 2 }
];
