// ==================== DAILY WINS FUNCTIONS ====================
function getDailyResetTime() {
  const now = new Date();
  const utcHour = now.getUTCHours();
  let nextReset = new Date(now);
  if (utcHour >= 12) {
    nextReset.setUTCDate(nextReset.getUTCDate() + 1);
  }
  nextReset.setUTCHours(12, 0, 0, 0);
  return nextReset.getTime();
}

function isLuckyDay() {
  const day = new Date().getDay();
  return day === 0 || day === 6;
}

const DAILY_WINS_REWARDS = [
  { wins: 1, label: 'Монетный мешочек', emoji: '👛', type: 'coins', min: 30, max: 50 },
  { wins: 2, label: 'Маленькая коробка', emoji: '📦', type: 'loot_box', boxType: 'coins_small' },
  { wins: 3, label: 'Карточная коллекция', emoji: '🃏', type: 'loot_box', boxType: 'card_common' },
  { wins: 4, label: 'Средняя коробка', emoji: '📫', type: 'loot_box', boxType: 'coins_medium' },
  { wins: 5, label: 'Редкая коробка', emoji: '🎁', type: 'loot_box', boxType: 'card_rare' },
  { wins: 6, label: 'Большая коробка', emoji: '📪', type: 'loot_box', boxType: 'coins_large' }
];

const LUCKY_DAYS_REWARDS = [
  { wins: 1, label: 'Монетный кошелёк', emoji: '💰', type: 'coins', min: 60, max: 100 },
  { wins: 2, label: 'Ящик растений', emoji: '🌱', type: 'loot_box', boxType: 'plant_box' },
  { wins: 3, label: 'Редкая коллекция', emoji: '🎴', type: 'loot_box', boxType: 'card_rare' },
  { wins: 4, label: 'Ящик скинов', emoji: '✨', type: 'loot_box', boxType: 'skin_box' },
  { wins: 5, label: 'Эпическая коллекция', emoji: '💎', type: 'loot_box', boxType: 'card_epic' },
  { wins: 6, label: 'Супер-бокс', emoji: '🏆', type: 'loot_box', boxType: 'super_box' }
];

const UPGRADE_CARDS = [
  { id: 'card_ps_atk_1', name: 'Горошина: +10% урон', emoji: '🌱', rarity: 'common', target: 'peashooter', effect: 'damage', value: 0.1, dropRate: 30 },
  { id: 'card_ps_hp_1', name: 'Горошина: +10% HP', emoji: '🌱', rarity: 'common', target: 'peashooter', effect: 'hp', value: 0.1, dropRate: 30 },
  { id: 'card_sf_sun_1', name: 'Подсолнух: +10% солнца', emoji: '🌻', rarity: 'common', target: 'sunflower', effect: 'sun', value: 0.1, dropRate: 30 },
  { id: 'card_wn_hp_1', name: 'Орех: +10% HP', emoji: '🥜', rarity: 'common', target: 'wallnut', effect: 'hp', value: 0.1, dropRate: 30 },
  { id: 'card_ps_atk_2', name: 'Горошина: +25% урон', emoji: '🌱', rarity: 'rare', target: 'peashooter', effect: 'damage', value: 0.25, dropRate: 15 },
  { id: 'card_ps_hp_2', name: 'Горошина: +25% HP', emoji: '🌱', rarity: 'rare', target: 'peashooter', effect: 'hp', value: 0.25, dropRate: 15 },
  { id: 'card_sf_sun_2', name: 'Подсолнух: +25% солнца', emoji: '🌻', rarity: 'rare', target: 'sunflower', effect: 'sun', value: 0.25, dropRate: 15 },
  { id: 'card_wn_hp_2', name: 'Орех: +25% HP', emoji: '🥜', rarity: 'rare', target: 'wallnut', effect: 'hp', value: 0.25, dropRate: 15 },
  { id: 'card_zb_atk_1', name: 'Зомби: +10% урон', emoji: '🧟', rarity: 'common', target: 'basic', effect: 'damage', value: 0.1, dropRate: 30 },
  { id: 'card_zb_hp_1', name: 'Зомби: +10% HP', emoji: '🧟', rarity: 'common', target: 'basic', effect: 'hp', value: 0.1, dropRate: 30 },
  { id: 'card_zb_atk_2', name: 'Зомби: +25% урон', emoji: '🧟', rarity: 'rare', target: 'basic', effect: 'damage', value: 0.25, dropRate: 15 },
  { id: 'card_zb_hp_2', name: 'Зомби: +25% HP', emoji: '🧟', rarity: 'rare', target: 'basic', effect: 'hp', value: 0.25, dropRate: 15 },
  { id: 'card_ps_max', name: 'Горошина: Максимум!', emoji: '⭐', rarity: 'legendary', target: 'peashooter', effect: 'max', value: 1.0, dropRate: 2 },
  { id: 'card_zb_max', name: 'Зомби: Максимум!', emoji: '👑', rarity: 'legendary', target: 'basic', effect: 'max', value: 1.0, dropRate: 2 }
];

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'db.json');

// ==================== RARITY SYSTEM ====================
const RARITIES = {
  common:    { label: 'Обычная',    color: '#9E9E9E', emoji: '⚪', multiplier: 1.0 },
  rare:      { label: 'Редкая',     color: '#2196F3', emoji: '🔵', multiplier: 1.5 },
  epic:      { label: 'Эпическая',  color: '#9C27B0', emoji: '🟣', multiplier: 2.0 },
  legendary: { label: 'Легендарная',color: '#FF9800', emoji: '🟠', multiplier: 3.0 }
};

// Все возможные товары с редкостью
const ALL_SHOP_ITEMS = [
  // ===== РАСТЕНИЯ (базовые) =====
  { id: 1,  name: 'Горошина-стрелок',  description: 'Базовое атакующее растение',    price: 100, type: 'plant',  emoji: '🌱', rarity: 'common',    gameKey: 'peashooter', ability: 'shoot' },
  { id: 2,  name: 'Подсолнух',          description: 'Генерирует солнце быстрее',      price: 150, type: 'plant',  emoji: '🌻', rarity: 'common',    gameKey: 'sunflower', ability: 'sun' },
  { id: 3,  name: 'Орех-стена',         description: 'Прочная защитная стена',         price: 120, type: 'plant',  emoji: '🥜', rarity: 'common',    gameKey: 'wallnut', ability: 'shield' },
  { id: 4,  name: 'Вишнёвая бомба',     description: 'Мощный взрыв по области',        price: 300, type: 'plant',  emoji: '🍒', rarity: 'rare',      gameKey: 'cherrybomb', ability: 'explode' },
  { id: 5,  name: 'Снежный горох',      description: 'Замораживает зомби',             price: 250, type: 'plant',  emoji: '❄️', rarity: 'rare',      gameKey: 'snowpea', ability: 'freeze' },
  { id: 6,  name: 'Огненный цветок',    description: 'Сжигает всю линию',              price: 500, type: 'plant',  emoji: '🌺', rarity: 'epic',      gameKey: 'fireflower', ability: 'burn' },
  { id: 7,  name: 'Молния-кактус',      description: 'Бьёт молнией по всем зомби',     price: 800, type: 'plant',  emoji: '🌵', rarity: 'legendary', gameKey: 'cactus', ability: 'lightning' },
  
  // ===== НОВЫЕ РАСТЕНИЯ =====
  { id: 41, name: 'Двойной горох',      description: 'Стреляет двумя горошинами',       price: 350, type: 'plant', emoji: '🌿', rarity: 'rare', gameKey: 'repeater', ability: 'double_shoot' },
  { id: 42, name: 'Тройной горох',      description: 'Стреляет в 3 линии одновременно', price: 600, type: 'plant', emoji: '🍀', rarity: 'epic', gameKey: 'threepeater', ability: 'triple_shoot' },
  { id: 43, name: 'Грибо-шлеп',         description: 'Поедает зомби целиком',          price: 450, type: 'plant', emoji: '🍄', rarity: 'epic', gameKey: 'chomper', ability: 'devour' },
  { id: 44, name: 'Пыль-гриб',          description: 'Маленький, дешевый гриб',        price: 25,  type: 'plant', emoji: '🦟', rarity: 'common', gameKey: 'puffshroom', ability: 'shoot' },
  { id: 45, name: 'Солнечный гриб',     description: 'Маленький подсолнух',             price: 50,  type: 'plant', emoji: '🐛', rarity: 'common', gameKey: 'sunshroom', ability: 'sun' },
  { id: 46, name: 'Дым-гриб',           description: 'Атакует через дым',                price: 350, type: 'plant', emoji: '💨', rarity: 'rare', gameKey: 'fumeshroom', ability: '穿透' },
  { id: 47, name: 'Ледяной гриб',       description: 'Замораживает всех зомби',         price: 400, type: 'plant', emoji: '🥶', rarity: 'epic', gameKey: 'iceshroom', ability: 'aoe_freeze' },
  { id: 48, name: 'Шиповник',           description: 'Наносит урон проходящим зомби',    price: 100, type: 'plant', emoji: '🌵', rarity: 'common', gameKey: 'spikeweed', ability: 'passive_dmg' },
  { id: 49, name: 'Тыква-дом',          description: 'Увеличивает HP растения',          price: 350, type: 'plant', emoji: '🎃', rarity: 'rare', gameKey: 'pumpkin', ability: 'shield_boost' },
  { id: 50, name: 'Мега-кактус',        description: 'Очень мощная молния',              price: 1200, type: 'plant', emoji: '🌋', rarity: 'legendary', gameKey: 'megacactus', ability: 'mega_lightning' },
  { id: 51, name: 'Звездоцвет',          description: 'Стреляет звездами',               price: 550, type: 'plant', emoji: '⭐', rarity: 'epic', gameKey: 'starfruit', ability: 'star_shot' },
  { id: 52, name: 'Коготь-трава',       description: 'Отбрасывает зомби',               price: 400, type: 'plant', emoji: '🪓', rarity: 'rare', gameKey: 'snapsdragon', ability: 'knockback' },
  { id: 53, name: 'Магнит-трава',       description: 'Отнимает предметы у зомби',      price: 300, type: 'plant', emoji: '🧲', rarity: 'rare', gameKey: 'magnet', ability: 'steal' },
  { id: 54, name: 'Бомба-замедлитель',  description: 'Замедляет всех зомби',           price: 250, type: 'plant', emoji: '⏳', rarity: 'rare', gameKey: 'slowbomb', ability: 'slow' },
  { id: 55, name: 'Королева цветов',    description: 'Призывает помощников',             price: 1500, type: 'plant', emoji: '👑', rarity: 'legendary', gameKey: 'flowerqueen', ability: 'summon' },

  // ===== ЗОМБИ (базовые) =====
  { id: 8,  name: 'Обычный зомби',      description: 'Базовый зомби',                  price: 80,  type: 'zombie', emoji: '🧟', rarity: 'common',    gameKey: 'basic', ability: 'none' },
  { id: 9,  name: 'Зомби-конус',        description: 'Зомби с защитой',                price: 120, type: 'zombie', emoji: '🧟‍♂️', rarity: 'common',  gameKey: 'cone', ability: 'armor' },
  { id: 10, name: 'Зомби-ведро',        description: 'Очень прочный зомби',            price: 200, type: 'zombie', emoji: '🪣', rarity: 'rare',      gameKey: 'bucket', ability: 'armor' },
  { id: 11, name: 'Зомби-футболист',    description: 'Очень быстрый зомби',            price: 280, type: 'zombie', emoji: '🏈', rarity: 'rare',      gameKey: 'football', ability: 'fast' },
  { id: 12, name: 'Зомби-рыцарь',       description: 'Бронированный зомби',            price: 450, type: 'zombie', emoji: '⚔️', rarity: 'epic',      gameKey: 'knight', ability: 'armor' },
  { id: 13, name: 'Зомби-гигант',       description: 'Огромный и мощный зомби',        price: 700, type: 'zombie', emoji: '👹', rarity: 'legendary', gameKey: 'giant', ability: 'boss' },
  
  // ===== НОВЫЕ ЗОМБИ =====
  { id: 56, name: 'Зомби с шестом',     description: 'Перепрыгивает через растения',    price: 180, type: 'zombie', emoji: '🎋', rarity: 'rare', gameKey: 'polevault', ability: 'jump' },
  { id: 57, name: 'Зомби с газетой',   description: 'Быстрый после прочтения',         price: 150, type: 'zombie', emoji: '📰', rarity: 'rare', gameKey: 'newspaper', ability: 'rush' },
  { id: 58, name: 'Танцующий зомби',    description: 'Призывает зомби из земли',         price: 600, type: 'zombie', emoji: '💃', rarity: 'epic', gameKey: 'dancer', ability: 'summon' },
  { id: 59, name: 'Зомби на воздушном шаре', description: 'Летит над растениями',      price: 350, type: 'zombie', emoji: '🎈', rarity: 'rare', gameKey: 'balloon', ability: 'flying' },
  { id: 60, name: 'Зомби-крот',         description: 'Проходит под землёй',            price: 400, type: 'zombie', emoji: '🐹', rarity: 'rare', gameKey: 'digger', ability: 'underground' },
  { id: 61, name: 'Зомби-пловец',       description: 'Появляется в воде',               price: 250, type: 'zombie', emoji: '🏊', rarity: 'rare', gameKey: 'swimmer', ability: 'water' },
  { id: 62, name: 'Зомби-охранник',    description: 'Защищает других зомби',          price: 350, type: 'zombie', emoji: '👮', rarity: 'rare', gameKey: 'guard', ability: 'protect' },
  { id: 63, name: 'Зомби-камикадзе',    description: 'Взрывается при смерти',          price: 300, type: 'zombie', emoji: '💣', rarity: 'rare', gameKey: 'kamikaze', ability: 'explode' },
  { id: 64, name: 'Зомби-телец',       description: 'Телепортируется через растения',  price: 500, type: 'zombie', emoji: '♉', rarity: 'epic', gameKey: 'teleporter', ability: 'teleport' },
  { id: 65, name: 'Зомби-босс',        description: 'Огромный босс с молотом',         price: 2000, type: 'zombie', emoji: '👺', rarity: 'legendary', gameKey: 'zomboss', ability: 'boss' },
  { id: 66, name: 'Зомби-йогурт',       description: 'Зомби в йогурте, очень скользкий',price: 150, type: 'zombie', emoji: '🥛', rarity: 'common', gameKey: 'yogurt', ability: 'slip' },
  { id: 67, name: 'Зомби-гаргулья',     description: 'Летит и атакует сверху',          price: 650, type: 'zombie', emoji: '🦇', rarity: 'epic', gameKey: 'gargoyle', ability: 'fly_attack' },
  { id: 68, name: 'Зомби-император',    description: 'Приказывает зомби атаковать',    price: 2500, type: 'zombie', emoji: '👴', rarity: 'legendary', gameKey: 'emperor', ability: 'command' },
  // Скины для растений
  { id: 14, name: 'Скин "Золотая горошина"',    description: 'Золотой скин горошины',         price: 300,  type: 'skin', emoji: '⭐', rarity: 'rare',      gameKey: 'skin_peashooter_gold',      skinTarget: 'peashooter', skinEmoji: '🌟' },
  { id: 15, name: 'Скин "Радужный подсолнух"',  description: 'Радужный скин подсолнуха',      price: 500,  type: 'skin', emoji: '🌈', rarity: 'epic',      gameKey: 'skin_sunflower_rainbow',    skinTarget: 'sunflower',  skinEmoji: '🌸' },
  { id: 16, name: 'Скин "Алмазный орех"',       description: 'Легендарный алмазный скин',     price: 1000, type: 'skin', emoji: '💎', rarity: 'legendary', gameKey: 'skin_wallnut_diamond',      skinTarget: 'wallnut',    skinEmoji: '💠' },
  { id: 17, name: 'Скин "Огненная вишня"',      description: 'Огненный скин вишни-бомбы',    price: 400,  type: 'skin', emoji: '🔥', rarity: 'rare',      gameKey: 'skin_cherrybomb_fire',      skinTarget: 'cherrybomb', skinEmoji: '💥' },
  { id: 18, name: 'Скин "Ледяной горох"',       description: 'Ледяной скин снежного гороха',  price: 350,  type: 'skin', emoji: '❄️', rarity: 'rare',      gameKey: 'skin_snowpea_ice',          skinTarget: 'snowpea',    skinEmoji: '🫧' },
  { id: 19, name: 'Скин "Дракон-кактус"',       description: 'Легендарный скин кактуса',      price: 900,  type: 'skin', emoji: '🐉', rarity: 'legendary', gameKey: 'skin_cactus_dragon',        skinTarget: 'cactus',     skinEmoji: '🐲' },
  { id: 20, name: 'Скин "Тёмный огонь"',        description: 'Тёмный скин огненного цветка',  price: 600,  type: 'skin', emoji: '🖤', rarity: 'epic',      gameKey: 'skin_fireflower_dark',      skinTarget: 'fireflower', skinEmoji: '🌑' },
  { id: 29, name: 'Скин "Кристальная горошина"',description: 'Кристальный скин горошины',     price: 750,  type: 'skin', emoji: '🔮', rarity: 'epic',      gameKey: 'skin_peashooter_crystal',   skinTarget: 'peashooter', skinEmoji: '💜' },
  { id: 30, name: 'Скин "Солнечный подсолнух"', description: 'Яркий солнечный скин',          price: 400,  type: 'skin', emoji: '☀️', rarity: 'rare',      gameKey: 'skin_sunflower_sun',        skinTarget: 'sunflower',  skinEmoji: '🌞' },
  { id: 31, name: 'Скин "Стальной орех"',       description: 'Металлический скин ореха',      price: 450,  type: 'skin', emoji: '🔩', rarity: 'rare',      gameKey: 'skin_wallnut_steel',        skinTarget: 'wallnut',    skinEmoji: '⚙️' },
  { id: 32, name: 'Скин "Ядерная вишня"',       description: 'Радиоактивный взрыв',           price: 1100, type: 'skin', emoji: '☢️', rarity: 'legendary', gameKey: 'skin_cherrybomb_nuclear',   skinTarget: 'cherrybomb', skinEmoji: '💚' },
  { id: 33, name: 'Скин "Плазменный кактус"',   description: 'Плазменный скин кактуса',       price: 850,  type: 'skin', emoji: '⚡', rarity: 'legendary', gameKey: 'skin_cactus_plasma',        skinTarget: 'cactus',     skinEmoji: '🟡' },
  { id: 34, name: 'Скин "Розовый горох"',       description: 'Милый розовый скин',            price: 200,  type: 'skin', emoji: '🌸', rarity: 'common',    gameKey: 'skin_peashooter_pink',      skinTarget: 'peashooter', skinEmoji: '💗' },
  // Скины для зомби
  { id: 21, name: 'Скин "Зомби-пират"',         description: 'Пиратский скин зомби',          price: 250,  type: 'skin', emoji: '🏴‍☠️', rarity: 'rare',  gameKey: 'skin_basic_pirate',         skinTarget: 'basic',      skinEmoji: '☠️' },
  { id: 22, name: 'Скин "Зомби-ниндзя"',        description: 'Скрытный ниндзя-зомби',         price: 450,  type: 'skin', emoji: '🥷', rarity: 'epic',      gameKey: 'skin_basic_ninja',          skinTarget: 'basic',      skinEmoji: '🗡️' },
  { id: 23, name: 'Скин "Зомби-робот"',          description: 'Механический зомби',            price: 800,  type: 'skin', emoji: '🤖', rarity: 'legendary', gameKey: 'skin_bucket_robot',         skinTarget: 'bucket',     skinEmoji: '⚙️' },
  { id: 24, name: 'Скин "Зомби-клоун"',          description: 'Страшный клоун-зомби',          price: 350,  type: 'skin', emoji: '🤡', rarity: 'rare',      gameKey: 'skin_cone_clown',           skinTarget: 'cone',       skinEmoji: '🎪' },
  { id: 25, name: 'Скин "Зомби-призрак"',        description: 'Призрачный скин зомби',         price: 700,  type: 'skin', emoji: '👻', rarity: 'epic',      gameKey: 'skin_football_ghost',       skinTarget: 'football',   skinEmoji: '💨' },
  { id: 26, name: 'Скин "Зомби-дракон"',         description: 'Легендарный дракон-зомби',      price: 1200, type: 'skin', emoji: '🐲', rarity: 'legendary', gameKey: 'skin_giant_dragon',         skinTarget: 'giant',      skinEmoji: '🔥' },
  { id: 27, name: 'Скин "Зомби-скелет"',         description: 'Классический скелет',           price: 200,  type: 'skin', emoji: '💀', rarity: 'common',    gameKey: 'skin_basic_skeleton',       skinTarget: 'basic',      skinEmoji: '🦴' },
  { id: 28, name: 'Скин "Зомби-вампир"',         description: 'Вампирский скин рыцаря',        price: 550,  type: 'skin', emoji: '🧛', rarity: 'epic',      gameKey: 'skin_knight_vampire',       skinTarget: 'knight',     skinEmoji: '🦇' },
  { id: 35, name: 'Скин "Зомби-астронавт"',      description: 'Космический зомби',             price: 650,  type: 'skin', emoji: '👨‍🚀', rarity: 'epic',   gameKey: 'skin_bucket_astronaut',     skinTarget: 'bucket',     skinEmoji: '🚀' },
  { id: 36, name: 'Скин "Зомби-самурай"',        description: 'Самурайский скин рыцаря',       price: 900,  type: 'skin', emoji: '⛩️', rarity: 'legendary', gameKey: 'skin_knight_samurai',       skinTarget: 'knight',     skinEmoji: '🗾' },
  { id: 37, name: 'Скин "Зомби-мумия"',          description: 'Древняя мумия',                 price: 300,  type: 'skin', emoji: '🏺', rarity: 'rare',      gameKey: 'skin_cone_mummy',           skinTarget: 'cone',       skinEmoji: '📜' },
  { id: 38, name: 'Скин "Зомби-снеговик"',       description: 'Ледяной зомби-снеговик',        price: 280,  type: 'skin', emoji: '⛄', rarity: 'rare',      gameKey: 'skin_basic_snowman',        skinTarget: 'basic',      skinEmoji: '❄️' },
  { id: 39, name: 'Скин "Зомби-демон"',          description: 'Демонический гигант',           price: 1500, type: 'skin', emoji: '😈', rarity: 'legendary', gameKey: 'skin_giant_demon',          skinTarget: 'giant',      skinEmoji: '🔴' },
  { id: 40, name: 'Скин "Зомби-зомби"',          description: 'Двойной зомби-скин',            price: 150,  type: 'skin', emoji: '🧟‍♀️', rarity: 'common', gameKey: 'skin_basic_zombie2',        skinTarget: 'basic',      skinEmoji: '🩸' },
  
  // ===== НОВЫЕ СКИНЫ ДЛЯ РАСТЕНИЙ =====
  { id: 101, name: 'Скин "Неоновый горох"',       description: 'Неоновый светящийся скин',         price: 500,  type: 'skin', emoji: '💚', rarity: 'epic', gameKey: 'skin_peashooter_neon',     skinTarget: 'peashooter', skinEmoji: '💚' },
  { id: 102, name: 'Скин "Хэллоуин"',             description: 'Страшный праздничный скин',          price: 350,  type: 'skin', emoji: '🎃', rarity: 'rare', gameKey: 'skin_peashooter_halloween', skinTarget: 'peashooter', skinEmoji: '🎃' },
  { id: 103, name: 'Скин "Рождественский"',       description: 'Праздничный скин снега',           price: 400,  type: 'skin', emoji: '🎄', rarity: 'rare', gameKey: 'skin_peashooter_xmas',      skinTarget: 'peashooter', skinEmoji: '🎄' },
  { id: 104, name: 'Скин "Лава-подсолнух"',       description: 'Лава вместо лепестков',            price: 800,  type: 'skin', emoji: '🌻', rarity: 'epic', gameKey: 'skin_sunflower_lava',      skinTarget: 'sunflower',  skinEmoji: '🌋' },
  { id: 105, name: 'Скин "Призрачный"',          description: 'Полупрозрачный призрачный скин',    price: 600,  type: 'skin', emoji: '👻', rarity: 'epic', gameKey: 'skin_sunflower_ghost',     skinTarget: 'sunflower',  skinEmoji: '👻' },
  { id: 106, name: 'Скин "Зомби-орех"',          description: 'Зомби внутри ореха',               price: 750,  type: 'skin', emoji: '🥜', rarity: 'epic', gameKey: 'skin_wallnut_zombie',      skinTarget: 'wallnut',    skinEmoji: '🧟' },
  { id: 107, name: 'Скин "Золотой юбилей"',       description: 'Золотое празднование',             price: 1500, type: 'skin', emoji: '🏅', rarity: 'legendary', gameKey: 'skin_wallnut_gold',       skinTarget: 'wallnut',    skinEmoji: '🏆' },
  { id: 108, name: 'Скин "Сердцеедка"',          description: 'Вишня с сердцами',                 price: 550,  type: 'skin', emoji: '💘', rarity: 'epic', gameKey: 'skin_cherrybomb_heart',    skinTarget: 'cherrybomb', skinEmoji: '💘' },
  { id: 109, name: 'Скин "Мега-уси"',            description: 'Усиленная вишня-бомба',            price: 1200, type: 'skin', emoji: '💪', rarity: 'legendary', gameKey: 'skin_cherrybomb_mega',    skinTarget: 'cherrybomb', skinEmoji: '💪' },
  { id: 110, name: 'Скин "Ванильный"',            description: 'Нежный ванильный скин',            price: 300,  type: 'skin', emoji: '🧁', rarity: 'rare', gameKey: 'skin_snowpea_vanilla',     skinTarget: 'snowpea',    skinEmoji: '🧁' },
  { id: 111, name: 'Скин "Тень"',                 description: 'Тёмный тенистый скин',             price: 700,  type: 'skin', emoji: '🌑', rarity: 'epic', gameKey: 'skin_snowpea_shadow',      skinTarget: 'snowpea',    skinEmoji: '🌑' },
  { id: 112, name: 'Скин "Пламя-цветок"',        description: 'Пламенный огонь',                 price: 850,  type: 'skin', emoji: '🔥', rarity: 'epic', gameKey: 'skin_fireflower_flame',    skinTarget: 'fireflower', skinEmoji: '🔥' },
  { id: 113, name: 'Скин "Вулкан"',              description: 'Извержение вулкана',                price: 1400, type: 'skin', emoji: '🌋', rarity: 'legendary', gameKey: 'skin_fireflower_volcano',  skinTarget: 'fireflower', skinEmoji: '🌋' },
  { id: 114, name: 'Скин "Кактус-лучник"',       description: 'Кактус с луком',                  price: 950,  type: 'skin', emoji: '🏹', rarity: 'epic', gameKey: 'skin_cactus_bow',          skinTarget: 'cactus',     skinEmoji: '🏹' },
  { id: 115, name: 'Скин "Пустыня"',             description: 'Песчаная буря',                    price: 450,  type: 'skin', emoji: '🏜️', rarity: 'rare', gameKey: 'skin_cactus_desert',       skinTarget: 'cactus',     skinEmoji: '🏜️' },
  { id: 116, name: 'Скин "Дружба-пистолет"',     description: 'Радужный цветной скин',          price: 650,  type: 'skin', emoji: '🌈', rarity: 'epic', gameKey: 'skin_repeater_rainbow',    skinTarget: 'repeater',  skinEmoji: '🌈' },
  { id: 117, name: 'Скин "Космос"',             description: 'Космическое пространство',          price: 1100, type: 'skin', emoji: '🌌', rarity: 'legendary', gameKey: 'skin_repeater_space',      skinTarget: 'repeater',  skinEmoji: '🌌' },
  { id: 118, name: 'Скин "Череп-трава"',         description: 'Страшный череп',                   price: 500,  type: 'skin', emoji: '💀', rarity: 'rare', gameKey: 'skin_chomper_skull',       skinTarget: 'chomper',   skinEmoji: '💀' },
  { id: 119, name: 'Скин "Инопланетный"',        description: 'Пришелец из космоса',              price: 1300, type: 'skin', emoji: '👽', rarity: 'legendary', gameKey: 'skin_chomper_alien',       skinTarget: 'chomper',   skinEmoji: '👽' },
  { id: 120, name: 'Скин "Пчела"',               description: 'Пчелиный скин',                    price: 250,  type: 'skin', emoji: '🐝', rarity: 'common', gameKey: 'skin_puffshroom_bee',       skinTarget: 'puffshroom',skinEmoji: '🐝' },
  { id: 121, name: 'Скин "Гриб-зомби"',         description: 'Заражённый гриб',                 price: 400,  type: 'skin', emoji: '☠️', rarity: 'rare', gameKey: 'skin_puffshroom_zombie',   skinTarget: 'puffshroom',skinEmoji: '🧟' },
  { id: 122, name: 'Скин "Лунный свет"',         description: 'Свечение луны',                    price: 750,  type: 'skin', emoji: '🌙', rarity: 'epic', gameKey: 'skin_sunshroom_moon',      skinTarget: 'sunshroom', skinEmoji: '🌙' },
  { id: 123, name: 'Скин "Звёздная пыль"',      description: 'Млечный путь',                    price: 1000, type: 'skin', emoji: '✨', rarity: 'legendary', gameKey: 'skin_sunshroom_stars',     skinTarget: 'sunshroom', skinEmoji: '⭐' },
  { id: 124, name: 'Скин "Стальной шип"',        description: 'Металлический шип',               price: 550,  type: 'skin', emoji: '🔩', rarity: 'rare', gameKey: 'skin_spikeweed_steel',     skinTarget: 'spikeweed', skinEmoji: '⚙️' },
  { id: 125, name: 'Скин "Кристальный"',         description: 'Кристаллическое свечение',         price: 900,  type: 'skin', emoji: '💠', rarity: 'epic', gameKey: 'skin_spikeweed_crystal',    skinTarget: 'spikeweed', skinEmoji: '💎' },
  { id: 126, name: 'Скин "Фонарь"',              description: 'Тыква-светильник',                 price: 600,  type: 'skin', emoji: '🏮', rarity: 'rare', gameKey: 'skin_pumpkin_lantern',     skinTarget: 'pumpkin',   skinEmoji: '🏮' },
  { id: 127, name: 'Скин "Призрак тыквы"',       description: 'Тыква-призрак',                   price: 850,  type: 'skin', emoji: '👻', rarity: 'epic', gameKey: 'skin_pumpkin_ghost',       skinTarget: 'pumpkin',   skinEmoji: '👻' },
  { id: 128, name: 'Скин "Сверхновая"',          description: 'Взрыв сверхновой звезды',        price: 1800, type: 'skin', emoji: '💥', rarity: 'legendary', gameKey: 'skin_megacactus_supernova', skinTarget: 'megacactus',skinEmoji: '💥' },
  { id: 129, name: 'Скин "Межзвёздный"',         description: 'Межгалактический космос',          price: 1600, type: 'skin', emoji: '🌠', rarity: 'legendary', gameKey: 'skin_starfruit_galaxy',     skinTarget: 'starfruit', skinEmoji: '🌠' },
  { id: 130, name: 'Скин "Коготь 龙"',           description: 'Драконий коготь',                 price: 1150, type: 'skin', emoji: '🐉', rarity: 'legendary', gameKey: 'skin_snapsdragon_dragon',   skinTarget: 'snapsdragon',skinEmoji: '🐲' },
  { id: 131, name: 'Скин "Электрический"',       description: 'Молнии вокруг',                    price: 750,  type: 'skin', emoji: '⚡', rarity: 'epic', gameKey: 'skin_magnet_electric',     skinTarget: 'magnet',    skinEmoji: '⚡' },
  { id: 132, name: 'Скин "Вампир-трава"',       description: 'Кровавый вампир',                 price: 950,  type: 'skin', emoji: '🧛', rarity: 'epic', gameKey: 'skin_magnet_vampire',       skinTarget: 'magnet',    skinEmoji: '🧛' },
  { id: 133, name: 'Скин "Песочные часы"',      description: 'Управление временем',             price: 650,  type: 'skin', emoji: '⏳', rarity: 'rare', gameKey: 'skin_slowbomb_hourglass',    skinTarget: 'slowbomb',  skinEmoji: '⏰' },
  { id: 134, name: 'Скин "Хаос"',                 description: 'Полный хаос',                      price: 1400, type: 'skin', emoji: '💫', rarity: 'legendary', gameKey: 'skin_slowbomb_chaos',        skinTarget: 'slowbomb',  skinEmoji: '💫' },
  { id: 135, name: 'Скин "Королевская мантия"',  description: 'Королевское величие',              price: 2000, type: 'skin', emoji: '👸', rarity: 'legendary', gameKey: 'skin_flowerqueen_royal',   skinTarget: 'flowerqueen',skinEmoji: '👑' },

  // ===== НОВЫЕ СКИНЫ ДЛЯ ЗОМБИ =====
  { id: 201, name: 'Скин "Шахтёр"',              description: 'Зомби-шахтёр с фонарём',          price: 400,  type: 'skin', emoji: '⛏️', rarity: 'rare', gameKey: 'skin_basic_miner',         skinTarget: 'basic',      skinEmoji: '⛏️' },
  { id: 202, name: 'Скин "Полицейский"',         description: 'Полицейский зомби',               price: 500,  type: 'skin', emoji: '👮', rarity: 'rare', gameKey: 'skin_basic_police',        skinTarget: 'basic',      skinEmoji: '👮' },
  { id: 203, name: 'Скин "Пожарный"',           description: 'Пожарный зомби',                  price: 450,  type: 'skin', emoji: '🚒', rarity: 'rare', gameKey: 'skin_basic_firefighter',   skinTarget: 'basic',      skinEmoji: '🚒' },
  { id: 204, name: 'Скин "Доктор"',              description: 'Доктор зомби',                    price: 550,  type: 'skin', emoji: '👨‍⚕️', rarity: 'rare', gameKey: 'skin_basic_doctor',         skinTarget: 'basic',      skinEmoji: '👨‍⚕️' },
  { id: 205, name: 'Скин "Повар"',               description: 'Зомби-повар с ножом',             price: 480,  type: 'skin', emoji: '👨‍🍳', rarity: 'rare', gameKey: 'skin_basic_chef',          skinTarget: 'basic',      skinEmoji: '👨‍🍳' },
  { id: 206, name: 'Скин "Киборг"',              description: 'Half-robot zombie',               price: 1600, type: 'skin', emoji: '🦾', rarity: 'legendary', gameKey: 'skin_basic_cyborg',        skinTarget: 'basic',      skinEmoji: '🦾' },
  { id: 207, name: 'Скин "Клоун-убийца"',        description: 'Страшный клоун',                  price: 700,  type: 'skin', emoji: '🎈', rarity: 'epic', gameKey: 'skin_cone_killerclown',     skinTarget: 'cone',       skinEmoji: '🎈' },
  { id: 208, name: 'Скин "Питцца"',              description: 'Зомби с питццей',                 price: 350,  type: 'skin', emoji: '🍕', rarity: 'rare', gameKey: 'skin_cone_pizza',           skinTarget: 'cone',       skinEmoji: '🍕' },
  { id: 209, name: 'Скин "Супермен"',            description: 'Зомби-супергерой',                price: 1800, type: 'skin', emoji: '🦸', rarity: 'legendary', gameKey: 'skin_bucket_superman',       skinTarget: 'bucket',     skinEmoji: '🦸' },
  { id: 210, name: 'Скин "Бочка"',               description: 'Зомби внутри бочки',               price: 450,  type: 'skin', emoji: '🛢️', rarity: 'rare', gameKey: 'skin_bucket_barrel',         skinTarget: 'bucket',     skinEmoji: '🛢️' },
  { id: 211, name: 'Скин "Рыцарь смерти"',       description: 'Чёрный рыцарь',                   price: 1200, type: 'skin', emoji: '🖤', rarity: 'legendary', gameKey: 'skin_knight_death',         skinTarget: 'knight',     skinEmoji: '💀' },
  { id: 212, name: 'Скин "Рыцарь-лучник"',     description: 'Рыцарь с луком',                  price: 850,  type: 'skin', emoji: '🎯', rarity: 'epic', gameKey: 'skin_knight_archer',        skinTarget: 'knight',     skinEmoji: '🎯' },
  { id: 213, name: 'Скин "Король гоблинов"',    description: 'Злой король',                     price: 2200, type: 'skin', emoji: '👺', rarity: 'legendary', gameKey: 'skin_giant_king',           skinTarget: 'giant',      skinEmoji: '👑' },
  { id: 214, name: 'Скин "Титан"',              description: 'Огромный титан',                    price: 2000, type: 'skin', emoji: '🗿', rarity: 'legendary', gameKey: 'skin_giant_titan',          skinTarget: 'giant',      skinEmoji: '🗿' },
  { id: 215, name: 'Скин "Спринтер"',           description: 'Быстрый спринтер',                 price: 380,  type: 'skin', emoji: '🏃', rarity: 'rare', gameKey: 'skin_football_sprinter',    skinTarget: 'football',   skinEmoji: '💨' },
  { id: 216, name: 'Скин "Олимпиец"',           description: 'Олимпийский чемпион',              price: 900,  type: 'skin', emoji: '🏅', rarity: 'epic', gameKey: 'skin_football_olympian',   skinTarget: 'football',   skinEmoji: '🏆' },
  { id: 217, name: 'Скин "Танцор-мастер"',      description: 'Профессиональный танцор',           price: 750,  type: 'skin', emoji: '💃', rarity: 'epic', gameKey: 'skin_dancer_pro',           skinTarget: 'dancer',     skinEmoji: '🕺' },
  { id: 218, name: 'Скин "Балеруна"',           description: 'Балерина зомби',                   price: 950,  type: 'skin', emoji: '🩰', rarity: 'epic', gameKey: 'skin_dancer_ballerina',     skinTarget: 'dancer',     skinEmoji: '🩰' },
  { id: 219, name: 'Скин "Пилот"',              description: 'Лётчик зомби',                     price: 650,  type: 'skin', emoji: '✈️', rarity: 'rare', gameKey: 'skin_balloon_pilot',         skinTarget: 'balloon',    skinEmoji: '🛩️' },
  { id: 220, name: 'Скин "Аквалангист"',        description: 'Подводный зомби',                  price: 550,  type: 'skin', emoji: '🤿', rarity: 'rare', gameKey: 'skin_swimmer_diver',         skinTarget: 'swimmer',    skinEmoji: '🤿' },
  { id: 221, name: 'Скин "Ниндзя-убийца"',     description: 'Скрытный ниндзя',                  price: 850,  type: 'skin', emoji: '🗡️', rarity: 'epic', gameKey: 'skin_kamikaze_ninja',        skinTarget: 'kamikaze',   skinEmoji: '🥷' },
  { id: 222, name: 'Скин "Терминатор"',         description: 'Машина для убийств',               price: 2500, type: 'skin', emoji: '🤖', rarity: 'legendary', gameKey: 'skin_zomboss_terminator',    skinTarget: 'zomboss',    skinEmoji: '💀' },
  { id: 223, name: 'Скин "Король зомби"',        description: 'Зомби-король',                     price: 3000, type: 'skin', emoji: '🤴', rarity: 'legendary', gameKey: 'skin_emperor_king',         skinTarget: 'emperor',    skinEmoji: '👑' },
  { id: 224, name: 'Скин "Фараон"',             description: 'Древний фараон',                   price: 1400, type: 'skin', emoji: '🏺', rarity: 'legendary', gameKey: 'skin_emperor_pharaoh',       skinTarget: 'emperor',    skinEmoji: '🐫' },
  { id: 225, name: 'Скин "Летучая мышь"',       description: 'Огромная летучая мышь',            price: 800,  type: 'skin', emoji: '🦇', rarity: 'epic', gameKey: 'skin_gargoyle_bat',          skinTarget: 'gargoyle',   skinEmoji: '🦇' },
  { id: 226, name: 'Скин "Дракон-охранник"',    description: 'Дракон-страж',                     price: 1700, type: 'skin', emoji: '🐲', rarity: 'legendary', gameKey: 'skin_guard_dragon',         skinTarget: 'guard',      skinEmoji: '🐉' },
  { id: 227, name: 'Скин "Повелитель"',          description: 'Повелитель зомби',                  price: 2800, type: 'skin', emoji: '🎭', rarity: 'legendary', gameKey: 'skin_teleporter_master',     skinTarget: 'teleporter',skinEmoji: '🎭' },
  { id: 228, name: 'Скин "Счастливчик"',        description: 'Удачливый зомби',                   price: 350,  type: 'skin', emoji: '🍀', rarity: 'rare', gameKey: 'skin_yogurt_lucky',          skinTarget: 'yogurt',     skinEmoji: '🍀' },
  { id: 229, name: 'Скин "Бизон"',              description: 'Зомби на бизоне',                  price: 600,  type: 'skin', emoji: '🐂', rarity: 'rare', gameKey: 'skin_polevault_bison',        skinTarget: 'polevault',  skinEmoji: '🐂' },
  { id: 230, name: 'Скин "Гонщик"',              description: 'Зомби на мотоцикле',               price: 950,  type: 'skin', emoji: '🏍️', rarity: 'epic', gameKey: 'skin_newspaper_racer',       skinTarget: 'newspaper',  skinEmoji: '🏍️' },
  { id: 231, name: 'Скин "Серфингист"',         description: 'Зомби на доске',                    price: 550,  type: 'skin', emoji: '🏄', rarity: 'rare', gameKey: 'skin_swimmer_surfer',        skinTarget: 'swimmer',    skinEmoji: '🏄' },
  { id: 232, name: 'Скин "Снежный король"',     description: 'Ледяной король',                  price: 1500, type: 'skin', emoji: '❄️', rarity: 'legendary', gameKey: 'skin_digger_iceking',        skinTarget: 'digger',    skinEmoji: '❄️' },
  { id: 233, name: 'Скин "Шпион"',              description: 'Секретный агент',                   price: 1100, type: 'skin', emoji: '🕵️', rarity: 'epic', gameKey: 'skin_polevault_spy',          skinTarget: 'polevault',  skinEmoji: '🕵️' },
  { id: 234, name: 'Скин "Кайфуй"',             description: 'Расслабленный зомби',               price: 250,  type: 'skin', emoji: '😎', rarity: 'common', gameKey: 'skin_yogurt_chill',          skinTarget: 'yogurt',     skinEmoji: '😎' },
  { id: 235, name: 'Скин "Дракула"',            description: 'Кровавый граф',                    price: 1600, type: 'skin', emoji: '🧛🏻', rarity: 'legendary', gameKey: 'skin_gargoyle_dracula',       skinTarget: 'gargoyle',   skinEmoji: '🦇' },
  { id: 236, name: 'Скин "Инферно"',            description: 'Адское пламя',                     price: 1900, type: 'skin', emoji: '🔥', rarity: 'legendary', gameKey: 'skin_zomboss_inferno',       skinTarget: 'zomboss',    skinEmoji: '😈' },
];

// Ротация магазина - текущие товары
let currentShopRotation = [];
let lastShopRotation = 0;

function getShopRotation() {
  const now = Date.now();
  if (now - lastShopRotation > 5 * 60 * 1000 || currentShopRotation.length === 0) {
    rotateShop();
  }
  return currentShopRotation;
}

function rotateShop() {
  // Выбираем товары: 4 common, 3 rare, 2 epic (ЛЕГЕНДАРНЫЙ - НЕ ГАРАНТИРОВАН!)
  const byRarity = { common: [], rare: [], epic: [], legendary: [] };
  for (const item of ALL_SHOP_ITEMS) {
    byRarity[item.rarity].push(item);
  }
  const shuffle = arr => arr.sort(() => Math.random() - 0.5);
  
  // Шанс 30% на легендарный предмет
  let legendary = [];
  if (Math.random() < 0.3) {
    legendary = shuffle(byRarity.legendary).slice(0, 1);
  }
  
  currentShopRotation = [
    ...shuffle(byRarity.common).slice(0, 4),
    ...shuffle(byRarity.rare).slice(0, 3),
    ...shuffle(byRarity.epic).slice(0, 2),
    ...legendary  // 30% шанс!
  ];
  lastShopRotation = Date.now();
  console.log('🔄 Магазин обновлён:', currentShopRotation.map(i => i.name).join(', '));
}

// Инициализация ротации
rotateShop();
setInterval(rotateShop, 5 * 60 * 1000);


// ==================== LOOT BOXES (ЛУТ-БОКСЫ) ====================
// Основные лут-боксы для магазина
const LOOT_BOXES = {
  // Монетные боксы
  coins_small:    { id: 'coins_small',    name: '🪙 Маленький кошелёк',    emoji: '🪙', description: '20-40 монет',    price: 50,   type: 'loot_box', rarity: 'common' },
  coins_medium:   { id: 'coins_medium',   name: '💰 Средний кошелёк',      emoji: '💰', description: '50-100 монет',   price: 100,  type: 'loot_box', rarity: 'rare' },
  coins_large:    { id: 'coins_large',    name: '💎 Большой кошелёк',     emoji: '💎', description: '100-200 монет',  price: 200,  type: 'loot_box', rarity: 'epic' },
  
  // Карточные боксы
  card_common:    { id: 'card_common',    name: '🃏 Бокс обычных карт',    emoji: '🃏', description: '1-2 обычные карты', price: 75,   type: 'loot_box', rarity: 'common' },
  card_rare:     { id: 'card_rare',     name: '💎 Бокс редких карт',     emoji: '💎', description: '1-2 редкие карты',  price: 150,  type: 'loot_box', rarity: 'rare' },
  card_epic:     { id: 'card_epic',     name: '🟣 Бокс эпических карт',   emoji: '🟣', description: '1 эпическая карта',   price: 300,  type: 'loot_box', rarity: 'epic' },
  
  // Специальные боксы
  plant_box:      { id: 'plant_box',      name: '🌱 Бокс растений',        emoji: '🌱', description: 'Случайное растение', price: 250,  type: 'loot_box', rarity: 'rare' },
  skin_box:       { id: 'skin_box',       name: '✨ Бокс скинов',          emoji: '✨', description: 'Случайный скин',    price: 400,  type: 'loot_box', rarity: 'epic' },
  super_box:      { id: 'super_box',      name: '⭐ Супер бокс',           emoji: '⭐', description: 'Редкая карта + монеты', price: 500, type: 'loot_box', rarity: 'epic' },
  
  // Легендарный бокс
  legendary_box: { id: 'legendary_box',  name: '🟠 Легендарный бокс',    emoji: '🟠', description: 'Легендарная карта', price: 1000, type: 'loot_box', rarity: 'legendary' },
  
  // Счастливый супер бокс
  lucky_super_box:{ id: 'lucky_super_box',name: '🌟 Счастливый супербокс', emoji: '🌟', description: 'Легендарный скин/растение', price: 1500, type: 'loot_box', rarity: 'legendary' },
};

// Все боксы которые можно купить в магазине
const SHOP_LOOT_BOXES = [
  { ...LOOT_BOXES.coins_small, price: 50 },
  { ...LOOT_BOXES.coins_medium, price: 100 },
  { ...LOOT_BOXES.coins_large, price: 200 },
  { ...LOOT_BOXES.card_common, price: 75 },
  { ...LOOT_BOXES.card_rare, price: 150 },
  { ...LOOT_BOXES.card_epic, price: 300 },
  { ...LOOT_BOXES.plant_box, price: 250 },
  { ...LOOT_BOXES.skin_box, price: 400 },
  { ...LOOT_BOXES.super_box, price: 500 },
  { ...LOOT_BOXES.legendary_box, price: 1000 },
];

// ==================== DATABASE ====================
function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initial = {
      users: [],
      promoCodes: [],
      customShopItems: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  if (!data.customShopItems) data.customShopItems = [];
  if (!data.shopGifts) data.shopGifts = [];
  // Миграция: добавляем crystals и карты пользователям
  if (data.users) {
    data.users.forEach(u => { 
      if (u.crystals === undefined) u.crystals = 0;
      if (u.winsToday === undefined) u.winsToday = 0;
      if (!u.lastWinDate) u.lastWinDate = new Date().toISOString().split('T')[0];
      if (!u.cards) u.cards = []; // Карты прокачки
      if (!u.dailyRewardsClaimed) u.dailyRewardsClaimed = {}; // { '2024-01-15': [1, 2, 3] }
    });
  }
  return data;
}

function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

let db = loadDB();

// ==================== GAME STATE ====================
const waitingPlayers = [];
const activeGames = {};

// ==================== MIDDLEWARE ====================
// Bypass tunnel confirmation pages (localtunnel + ngrok) - ДО STATIC!
app.use((req, res, next) => {
  res.setHeader('bypass-tunnel-reminder', 'true');
  res.setHeader('ngrok-skip-browser-warning', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// ==================== SOCKET.IO ====================
io.on('connection', (socket) => {
  console.log('Подключился:', socket.id);

  // --- AUTH ---
  socket.on('register', (data) => {
    const { username, password } = data;
    db = loadDB();

    if (!username || !password) {
      return socket.emit('register_result', { success: false, message: 'Заполните все поля' });
    }
    if (username.length < 3) {
      return socket.emit('register_result', { success: false, message: 'Имя минимум 3 символа' });
    }
    if (password.length < 4) {
      return socket.emit('register_result', { success: false, message: 'Пароль минимум 4 символа' });
    }

    const exists = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (exists) {
      return socket.emit('register_result', { success: false, message: 'Пользователь уже существует' });
    }

    const hash = bcrypt.hashSync(password, 10);
    // Получаем текущую дату для побед дня (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    
    const newUser = {
      id: uuidv4(),
      username,
      password: hash,
      coins: 100,
      wins: 0,
      losses: 0,
      winsToday: 0,
      lastWinDate: today,
      isAdmin: false, // права выдаются только через админ панель
      inventory: [],
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    saveDB(db);

    const safeNewUser = { ...newUser };
    delete safeNewUser.password;
    socket.emit('register_result', { success: true, message: 'Регистрация успешна!', user: safeNewUser, isNew: true });
  });

  socket.on('login', (data) => {
    const { username, password } = data;
    db = loadDB();

    const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) {
      return socket.emit('login_result', { success: false, message: 'Пользователь не найден' });
    }

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) {
      return socket.emit('login_result', { success: false, message: 'Неверный пароль' });
    }

    const safeUser = { ...user };
    delete safeUser.password;
    socket.emit('login_result', { success: true, user: safeUser });
  });

  // --- LEADERBOARD ---
  socket.on('get_leaderboard', () => {
    db = loadDB();
    const sorted = db.users
      .map(u => ({ username: u.username, wins: u.wins, losses: u.losses, coins: u.coins }))
      .sort((a, b) => b.wins - a.wins || b.coins - a.coins)
      .slice(0, 20);
    socket.emit('leaderboard_data', sorted);
  });

  // --- SHOP ---
  socket.on('get_shop', () => {
    db = loadDB();
    const rotation = getShopRotation();
    // Добавляем кастомные товары от админа
    const customItems = (db.customShopItems || []).map(i => ({ ...i, isCustom: true }));
    socket.emit('shop_data', [...rotation, ...customItems]);
    // Отправляем время до следующей ротации
    const nextRotation = lastShopRotation + 5 * 60 * 1000;
    socket.emit('shop_timer', { nextRotation, timeLeft: Math.max(0, nextRotation - Date.now()) });
  });

  socket.on('buy_item', (data) => {
    const { userId, itemId } = data;
    db = loadDB();

    const user = db.users.find(u => u.id === userId);
    if (!user) return socket.emit('buy_result', { success: false, message: 'Пользователь не найден' });

    // Ищем во ВСЕХ товарах (не только в ротации) + кастомных
    const customItems = db.customShopItems || [];
    const allItems = [...ALL_SHOP_ITEMS, ...customItems];
    const item = allItems.find(i => i.id === itemId);
    if (!item) return socket.emit('buy_result', { success: false, message: 'Товар не найден' });

    if ((user.inventory || []).includes(itemId)) {
      return socket.emit('buy_result', { success: false, message: 'Уже куплено' });
    }

    if (user.coins < item.price) {
      return socket.emit('buy_result', { success: false, message: 'Недостаточно монет' });
    }

    user.coins -= item.price;
    if (!user.inventory) user.inventory = [];
    user.inventory.push(itemId);
    saveDB(db);

    const safeUser = { ...user };
    delete safeUser.password;
    socket.emit('buy_result', { success: true, message: `Куплено: ${item.name}`, user: safeUser });
  });

  // --- UPGRADE PLANT ---
  socket.on('upgrade_plant', (data) => {
    const { userId, gameKey, cost } = data;
    db = loadDB();
    const user = db.users.find(u => u.id === userId);
    if (!user) return socket.emit('upgrade_result', { success: false, message: 'Пользователь не найден' });

    const PLANT_MAX_LEVELS = { peashooter: 5, sunflower: 5, wallnut: 5 };
    const maxLevel = PLANT_MAX_LEVELS[gameKey] || 5;

    if (!user.plantLevels) user.plantLevels = {};
    const currentLevel = user.plantLevels[gameKey] || 1;

    if (currentLevel >= maxLevel) {
      return socket.emit('upgrade_result', { success: false, message: 'Максимальный уровень!' });
    }
    if (user.coins < cost) {
      return socket.emit('upgrade_result', { success: false, message: 'Недостаточно монет' });
    }

    user.coins -= cost;
    user.plantLevels[gameKey] = currentLevel + 1;
    saveDB(db);

    const safeUser = { ...user };
    delete safeUser.password;
    socket.emit('upgrade_result', {
      success: true,
      message: `${gameKey} прокачан до уровня ${currentLevel + 1}! 🌟`,
      user: safeUser
    });
  });

  // --- GET ALL SHOP ITEMS (для инвентаря) ---
  socket.on('get_all_items', () => {
    db = loadDB();
    const customItems = (db.customShopItems || []).map(i => ({ ...i, isCustom: true }));
    socket.emit('all_items_data', [...ALL_SHOP_ITEMS, ...customItems]);
  });

  // --- КАТАЛОГ СКИНОВ ---
  socket.on('get_skins_catalog', () => {
    const skins = ALL_SHOP_ITEMS.filter(i => i.type === 'skin');
    socket.emit('skins_catalog_data', skins);
  });

  // --- СПРАВОЧНИК РАСТЕНИЙ ---
  socket.on('get_plants_encyclopedia', () => {
    const plants = ALL_SHOP_ITEMS.filter(i => i.type === 'plant');
    socket.emit('plants_encyclopedia_data', plants);
  });

  // --- СПРАВОЧНИК ЗОМБИ ---
  socket.on('get_zombies_encyclopedia', () => {
    const zombies = ALL_SHOP_ITEMS.filter(i => i.type === 'zombie');
    socket.emit('zombies_encyclopedia_data', zombies);
  });

  // --- PROMO CODES ---
  socket.on('use_promo', (data) => {
    const { userId, code } = data;
    db = loadDB();

    const user = db.users.find(u => u.id === userId);
    if (!user) return socket.emit('promo_result', { success: false, message: 'Пользователь не найден' });

    const promo = db.promoCodes.find(p => p.code.toLowerCase() === code.toLowerCase());
    if (!promo) return socket.emit('promo_result', { success: false, message: 'Промокод не найден' });

    if (!promo.active) return socket.emit('promo_result', { success: false, message: 'Промокод уже использован или деактивирован' });

    if (promo.usedBy && promo.usedBy.includes(userId)) {
      return socket.emit('promo_result', { success: false, message: 'Вы уже использовали этот промокод' });
    }

    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      return socket.emit('promo_result', { success: false, message: 'Промокод исчерпан' });
    }

    user.coins += promo.reward;
    if (!promo.usedBy) promo.usedBy = [];
    promo.usedBy.push(userId);
    promo.usedCount = (promo.usedCount || 0) + 1;

    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      promo.active = false;
    }

    saveDB(db);

    const safeUser = { ...user };
    delete safeUser.password;
    socket.emit('promo_result', { success: true, message: `Получено ${promo.reward} монет!`, user: safeUser });
  });

  // --- ADMIN ---
  socket.on('admin_get_data', (data) => {
    const { userId } = data;
    db = loadDB();
    const user = db.users.find(u => u.id === userId);
    if (!user || !user.isAdmin) {
      return socket.emit('admin_data', { success: false, message: 'Нет доступа' });
    }

    const safeUsers = db.users.map(u => {
      const s = { ...u };
      delete s.password;
      return s;
    });

    socket.emit('admin_data', {
      success: true,
      users: safeUsers,
      promoCodes: db.promoCodes,
      shopItems: [...ALL_SHOP_ITEMS, ...(db.customShopItems || [])],
      customShopItems: db.customShopItems || []
    });
  });

  socket.on('admin_create_promo', (data) => {
    const { userId, code, reward, maxUses } = data;
    db = loadDB();
    const user = db.users.find(u => u.id === userId);
    if (!user || !user.isAdmin) {
      return socket.emit('admin_promo_result', { success: false, message: 'Нет доступа' });
    }

    const exists = db.promoCodes.find(p => p.code.toLowerCase() === code.toLowerCase());
    if (exists) {
      return socket.emit('admin_promo_result', { success: false, message: 'Промокод уже существует' });
    }

    const newPromo = {
      id: uuidv4(),
      code: code.toUpperCase(),
      reward: parseInt(reward) || 100,
      maxUses: parseInt(maxUses) || null,
      usedCount: 0,
      usedBy: [],
      active: true,
      createdAt: new Date().toISOString()
    };

    db.promoCodes.push(newPromo);
    saveDB(db);

    socket.emit('admin_promo_result', { success: true, message: `Промокод ${newPromo.code} создан!`, promo: newPromo });
  });

  socket.on('admin_delete_promo', (data) => {
    const { userId, promoId } = data;
    db = loadDB();
    const user = db.users.find(u => u.id === userId);
    if (!user || !user.isAdmin) {
      return socket.emit('admin_action_result', { success: false, message: 'Нет доступа' });
    }

    db.promoCodes = db.promoCodes.filter(p => p.id !== promoId);
    saveDB(db);
    socket.emit('admin_action_result', { success: true, message: 'Промокод удалён' });
  });

  socket.on('admin_toggle_promo', (data) => {
    const { userId, promoId } = data;
    db = loadDB();
    const user = db.users.find(u => u.id === userId);
    if (!user || !user.isAdmin) {
      return socket.emit('admin_action_result', { success: false, message: 'Нет доступа' });
    }

    const promo = db.promoCodes.find(p => p.id === promoId);
    if (promo) {
      promo.active = !promo.active;
      saveDB(db);
    }
    socket.emit('admin_action_result', { success: true, message: 'Статус промокода изменён' });
  });

  socket.on('admin_set_admin', (data) => {
    const { userId, targetId, value } = data;
    db = loadDB();
    const user = db.users.find(u => u.id === userId);
    if (!user || !user.isAdmin) {
      return socket.emit('admin_action_result', { success: false, message: 'Нет доступа' });
    }

    const target = db.users.find(u => u.id === targetId);
    if (target) {
      target.isAdmin = value;
      if (!value) {
        // Снимаем и модераторские права
        delete target.isModerator;
        delete target.moderatorExpires;
        delete target.moderatorPerms;
      }
      saveDB(db);
    }
    socket.emit('admin_action_result', { success: true, message: `Права изменены для ${target ? target.username : '?'}` });
  });

  // --- ВРЕМЕННЫЙ МОДЕРАТОР ---
  socket.on('admin_create_moderator', (data) => {
    const { userId, targetId, hours, perms } = data;
    db = loadDB();
    const user = db.users.find(u => u.id === userId);
    if (!user || !user.isAdmin) {
      return socket.emit('admin_action_result', { success: false, message: 'Нет доступа' });
    }
    const target = db.users.find(u => u.id === targetId);
    if (!target) {
      return socket.emit('admin_action_result', { success: false, message: 'Пользователь не найден' });
    }
    if (target.isAdmin) {
      return socket.emit('admin_action_result', { success: false, message: 'Пользователь уже является администратором' });
    }
    const durationHours = Math.min(parseInt(hours) || 24, 720); // макс 30 дней
    target.isModerator = true;
    target.moderatorExpires = Date.now() + durationHours * 60 * 60 * 1000;
    target.moderatorPerms = perms || ['view_users', 'give_coins'];
    saveDB(db);
    socket.emit('admin_action_result', { 
      success: true, 
      message: `${target.username} назначен модератором на ${durationHours}ч. Права: ${target.moderatorPerms.join(', ')}` 
    });
  });

  socket.on('admin_revoke_moderator', (data) => {
    const { userId, targetId } = data;
    db = loadDB();
    const user = db.users.find(u => u.id === userId);
    if (!user || !user.isAdmin) {
      return socket.emit('admin_action_result', { success: false, message: 'Нет доступа' });
    }
    const target = db.users.find(u => u.id === targetId);
    if (target) {
      delete target.isModerator;
      delete target.moderatorExpires;
      delete target.moderatorPerms;
      saveDB(db);
    }
    socket.emit('admin_action_result', { success: true, message: `Права модератора сняты с ${target ? target.username : '?'}` });
  });

  // --- МОДЕРАТОР: получить данные (урезанные) ---
  socket.on('mod_get_data', (data) => {
    const { userId } = data;
    db = loadDB();
    const user = db.users.find(u => u.id === userId);
    
    // Проверяем права модератора
    if (!user) return socket.emit('mod_data', { success: false, message: 'Нет доступа' });
    
    // Проверяем не истёк ли срок
    if (user.isModerator && user.moderatorExpires && Date.now() > user.moderatorExpires) {
      user.isModerator = false;
      delete user.moderatorExpires;
      delete user.moderatorPerms;
      saveDB(db);
      return socket.emit('mod_data', { success: false, message: 'Срок модератора истёк' });
    }
    
    if (!user.isAdmin && !user.isModerator) {
      return socket.emit('mod_data', { success: false, message: 'Нет доступа' });
    }

    const perms = user.isAdmin ? ['all'] : (user.moderatorPerms || []);
    const safeUsers = db.users.map(u => {
      const s = { id: u.id, username: u.username, coins: u.coins, wins: u.wins, losses: u.losses, isAdmin: u.isAdmin, isModerator: u.isModerator, moderatorExpires: u.moderatorExpires };
      return s;
    });

    socket.emit('mod_data', {
      success: true,
      perms,
      users: safeUsers,
      promoCodes: perms.includes('all') || perms.includes('view_promos') ? db.promoCodes : [],
      expiresAt: user.moderatorExpires || null
    });
  });

  // --- МОДЕРАТОР: выдать монеты (если есть право) ---
  socket.on('mod_give_coins', (data) => {
    const { userId, targetId, amount } = data;
    db = loadDB();
    const user = db.users.find(u => u.id === userId);
    if (!user) return socket.emit('mod_action_result', { success: false, message: 'Нет доступа' });
    
    // Проверяем срок
    if (user.isModerator && user.moderatorExpires && Date.now() > user.moderatorExpires) {
      return socket.emit('mod_action_result', { success: false, message: 'Срок модератора истёк' });
    }
    
    const hasRight = user.isAdmin || (user.isModerator && (user.moderatorPerms || []).includes('give_coins'));
    if (!hasRight) return socket.emit('mod_action_result', { success: false, message: 'Нет права выдавать монеты' });
    
    const maxCoins = user.isAdmin ? 99999 : 500; // модератор может выдать макс 500 монет
    const coins = Math.min(parseInt(amount) || 0, maxCoins);
    
    const target = db.users.find(u => u.id === targetId);
    if (target) {
      target.coins += coins;
      saveDB(db);
    }
    socket.emit('mod_action_result', { success: true, message: `Выдано ${coins} монет игроку ${target ? target.username : '?'}` });
  });

  // --- МОДЕРАТОР: создать промокод (если есть право) ---
  socket.on('mod_create_promo', (data) => {
    const { userId, code, reward, maxUses } = data;
    db = loadDB();
    const user = db.users.find(u => u.id === userId);
    if (!user) return socket.emit('mod_action_result', { success: false, message: 'Нет доступа' });
    
    if (user.isModerator && user.moderatorExpires && Date.now() > user.moderatorExpires) {
      return socket.emit('mod_action_result', { success: false, message: 'Срок модератора истёк' });
    }
    
    const hasRight = user.isAdmin || (user.isModerator && (user.moderatorPerms || []).includes('create_promo'));
    if (!hasRight) return socket.emit('mod_action_result', { success: false, message: 'Нет права создавать промокоды' });
    
    const maxReward = user.isAdmin ? 99999 : 200; // модератор макс 200 монет в промокоде
    const exists = db.promoCodes.find(p => p.code.toLowerCase() === code.toLowerCase());
    if (exists) return socket.emit('mod_action_result', { success: false, message: 'Промокод уже существует' });
    
    const newPromo = {
      id: uuidv4(),
      code: code.toUpperCase(),
      reward: Math.min(parseInt(reward) || 100, maxReward),
      maxUses: parseInt(maxUses) || null,
      usedCount: 0,
      usedBy: [],
      active: true,
      createdBy: user.username,
      createdAt: new Date().toISOString()
    };
    db.promoCodes.push(newPromo);
    saveDB(db);
    socket.emit('mod_action_result', { success: true, message: `Промокод ${newPromo.code} создан (макс. ${maxReward} монет)!` });
  });

  socket.on('admin_give_coins', (data) => {
    const { userId, targetId, amount } = data;
    db = loadDB();
    const user = db.users.find(u => u.id === userId);
    if (!user || !user.isAdmin) {
      return socket.emit('admin_action_result', { success: false, message: 'Нет доступа' });
    }

    const target = db.users.find(u => u.id === targetId);
    if (target) {
      target.coins += parseInt(amount) || 0;
      saveDB(db);
    }
    socket.emit('admin_action_result', { success: true, message: `Выдано ${amount} монет игроку ${target ? target.username : '?'}` });
  });

  socket.on('admin_delete_user', (data) => {
    const { userId, targetId } = data;
    db = loadDB();
    const user = db.users.find(u => u.id === userId);
    if (!user || !user.isAdmin) {
      return socket.emit('admin_action_result', { success: false, message: 'Нет доступа' });
    }
    if (userId === targetId) {
      return socket.emit('admin_action_result', { success: false, message: 'Нельзя удалить себя' });
    }
    db.users = db.users.filter(u => u.id !== targetId);
    saveDB(db);
    socket.emit('admin_action_result', { success: true, message: 'Пользователь удалён' });
  });

  // --- ADMIN: ADD SHOP ITEM ---
  socket.on('admin_add_shop_item', (data) => {
    const { userId, name, description, price, type, emoji, rarity, gameKey } = data;
    db = loadDB();
    const user = db.users.find(u => u.id === userId);
    if (!user || !user.isAdmin) {
      return socket.emit('admin_shop_result', { success: false, message: 'Нет доступа' });
    }
    if (!name || !price || !type || !emoji) {
      return socket.emit('admin_shop_result', { success: false, message: 'Заполните все поля' });
    }
    const validRarities = ['common', 'rare', 'epic', 'legendary'];
    const itemRarity = validRarities.includes(rarity) ? rarity : 'common';
    const newItem = {
      id: 'custom_' + uuidv4(),
      name: name.trim(),
      description: description || '',
      price: parseInt(price) || 100,
      type,
      emoji,
      rarity: itemRarity,
      gameKey: gameKey || null,
      isCustom: true,
      createdAt: new Date().toISOString()
    };
    if (!db.customShopItems) db.customShopItems = [];
    db.customShopItems.push(newItem);
    saveDB(db);
    socket.emit('admin_shop_result', { success: true, message: `Товар "${newItem.name}" добавлен в магазин!` });
  });

  socket.on('admin_delete_shop_item', (data) => {
    const { userId, itemId } = data;
    db = loadDB();
    const user = db.users.find(u => u.id === userId);
    if (!user || !user.isAdmin) {
      return socket.emit('admin_shop_result', { success: false, message: 'Нет доступа' });
    }
    db.customShopItems = (db.customShopItems || []).filter(i => i.id !== itemId);
    saveDB(db);
    socket.emit('admin_shop_result', { success: true, message: 'Товар удалён из магазина' });
  });

  // ==================== CRYSTALS ====================
  socket.on('admin_give_crystals', (data) => {
    const { userId, targetId, amount } = data;
    db = loadDB();
    const user = db.users.find(u => u.id === userId);
    if (!user || !user.isAdmin) return socket.emit('admin_action_result', { success: false, message: 'Нет доступа' });
    const target = db.users.find(u => u.id === targetId);
    if (!target) return socket.emit('admin_action_result', { success: false, message: 'Игрок не найден' });
    if (!target.crystals) target.crystals = 0;
    target.crystals += parseInt(amount) || 0;
    saveDB(db);
    socket.emit('admin_action_result', { success: true, message: `Выдано ${amount} кристаллов игроку ${target.username}` });
    // Уведомляем игрока если онлайн
    for (const [sid, s] of io.sockets.sockets) {
      if (s.userId === targetId) {
        const safeTarget = { ...target }; delete safeTarget.password;
        s.emit('fresh_user_data', { success: true, user: safeTarget });
        s.emit('gift_received', { type: 'crystals', amount: parseInt(amount), message: `Вы получили ${amount} 💎 кристаллов от администратора!` });
      }
    }
  });

  // ==================== LOOT BOXES ====================
  // Ящик 1: скины (skin_box), Ящик 2: растения (plant_box), Ящик 3: кристаллы (crystal_box)
  const LOOT_BOXES = {
    skin_box:    { id: 'skin_box',    name: '🎁 Ящик скинов',     emoji: '🎁', description: 'Случайный скин любой редкости', price: 300, type: 'box', rarity: 'rare' },
    plant_box:   { id: 'plant_box',   name: '🌱 Ящик растений',   emoji: '📦', description: 'Случайное растение любой редкости', price: 250, type: 'box', rarity: 'rare' },
    crystal_box: { id: 'crystal_box', name: '💎 Ящик кристаллов', emoji: '💎', description: 'От 10 до 100 кристаллов случайно', price: 200, type: 'box', rarity: 'epic' }
  };

  socket.on('open_loot_box', (data) => {
    const { userId, boxType } = data;
    db = loadDB();
    const user = db.users.find(u => u.id === userId);
    if (!user) return socket.emit('box_result', { success: false, message: 'Пользователь не найден' });

    // Проверяем что ящик есть в инвентаре
    if (!user.inventory) user.inventory = [];
    const boxIdx = user.inventory.indexOf(boxType);
    if (boxIdx === -1) return socket.emit('box_result', { success: false, message: 'Ящик не найден в инвентаре' });

    // Убираем ящик из инвентаря
    user.inventory.splice(boxIdx, 1);

    let reward = null;
    if (boxType === 'skin_box') {
      const skins = ALL_SHOP_ITEMS.filter(i => i.type === 'skin');
      const notOwned = skins.filter(i => !user.inventory.includes(i.id));
      if (notOwned.length > 0) {
        // Взвешенный рандом по редкости
        const weights = { common: 50, rare: 30, epic: 15, legendary: 5 };
        const pool = [];
        notOwned.forEach(i => { for (let w = 0; w < (weights[i.rarity] || 10); w++) pool.push(i); });
        const item = pool[Math.floor(Math.random() * pool.length)];
        user.inventory.push(item.id);
        reward = { type: 'skin', item, message: `🎉 Выпал скин: ${item.emoji} ${item.name} (${item.rarity})!` };
      } else {
        user.coins += 200;
        reward = { type: 'coins', amount: 200, message: '🪙 Все скины уже есть! Получено 200 монет.' };
      }
    } else if (boxType === 'plant_box') {
      const plants = ALL_SHOP_ITEMS.filter(i => i.type === 'plant');
      const notOwned = plants.filter(i => !user.inventory.includes(i.id));
      if (notOwned.length > 0) {
        const weights = { common: 50, rare: 30, epic: 15, legendary: 5 };
        const pool = [];
        notOwned.forEach(i => { for (let w = 0; w < (weights[i.rarity] || 10); w++) pool.push(i); });
        const item = pool[Math.floor(Math.random() * pool.length)];
        user.inventory.push(item.id);
        reward = { type: 'plant', item, message: `🎉 Выпало растение: ${item.emoji} ${item.name} (${item.rarity})!` };
      } else {
        user.coins += 150;
        reward = { type: 'coins', amount: 150, message: '🪙 Все растения уже есть! Получено 150 монет.' };
      }
    } else if (boxType === 'crystal_box') {
      const amount = Math.floor(Math.random() * 91) + 10; // 10-100
      if (!user.crystals) user.crystals = 0;
      user.crystals += amount;
      reward = { type: 'crystals', amount, message: `💎 Выпало ${amount} кристаллов!` };
    } else {
      return socket.emit('box_result', { success: false, message: 'Неизвестный тип ящика' });
    }

    saveDB(db);
    const safeUser = { ...user }; delete safeUser.password;
    socket.emit('box_result', { success: true, reward, user: safeUser });
  });

  // ==================== SHOP GIFTS (акции от админа) ====================
  socket.on('get_shop_gifts', () => {
    db = loadDB();
    const now = Date.now();
    // Фильтруем просроченные
    const active = (db.shopGifts || []).filter(g => g.active && (!g.expiresAt || g.expiresAt > now));
    socket.emit('shop_gifts_data', active);
  });

  socket.on('claim_shop_gift', (data) => {
    const { userId, giftId } = data;
    db = loadDB();
    const user = db.users.find(u => u.id === userId);
    if (!user) return socket.emit('gift_claim_result', { success: false, message: 'Пользователь не найден' });

    const now = Date.now();
    const gift = (db.shopGifts || []).find(g => g.id === giftId);
    if (!gift) return socket.emit('gift_claim_result', { success: false, message: 'Подарок не найден' });
    if (!gift.active) return socket.emit('gift_claim_result', { success: false, message: 'Акция завершена' });
    if (gift.expiresAt && gift.expiresAt < now) {
      gift.active = false;
      saveDB(db);
      return socket.emit('gift_claim_result', { success: false, message: 'Акция истекла' });
    }
    if (!gift.claimedBy) gift.claimedBy = [];
    if (gift.claimedBy.includes(userId)) return socket.emit('gift_claim_result', { success: false, message: 'Вы уже получили этот подарок' });

    // Выдаём награды
    const rewards = gift.rewards || [];
    const messages = [];
    for (const r of rewards) {
      if (r.type === 'coins') {
        user.coins += r.amount;
        messages.push(`🪙 ${r.amount} монет`);
      } else if (r.type === 'crystals') {
        if (!user.crystals) user.crystals = 0;
        user.crystals += r.amount;
        messages.push(`💎 ${r.amount} кристаллов`);
      } else if (r.type === 'box') {
        if (!user.inventory) user.inventory = [];
        user.inventory.push(r.boxType);
        messages.push(`📦 ${LOOT_BOXES[r.boxType] ? LOOT_BOXES[r.boxType].name : r.boxType}`);
      } else if (r.type === 'item') {
        if (!user.inventory) user.inventory = [];
        if (!user.inventory.includes(r.itemId)) {
          user.inventory.push(r.itemId);
          const item = ALL_SHOP_ITEMS.find(i => i.id === r.itemId);
          messages.push(item ? `${item.emoji} ${item.name}` : `Предмет #${r.itemId}`);
        } else {
          user.coins += 100;
          messages.push('🪙 100 монет (предмет уже есть)');
        }
      }
    }

    gift.claimedBy.push(userId);
    gift.claimedCount = (gift.claimedCount || 0) + 1;
    saveDB(db);

    const safeUser = { ...user }; delete safeUser.password;
    socket.emit('gift_claim_result', { success: true, message: `🎁 Получено: ${messages.join(', ')}!`, user: safeUser });
  });

  // ADMIN: создать подарок/акцию в магазине
  socket.on('admin_create_shop_gift', (data) => {
    const { userId, title, description, rewards, durationMinutes } = data;
    db = loadDB();
    const user = db.users.find(u => u.id === userId);
    if (!user || !user.isAdmin) return socket.emit('admin_gift_result', { success: false, message: 'Нет доступа' });
    if (!title || !rewards || !rewards.length) return socket.emit('admin_gift_result', { success: false, message: 'Заполните название и награды' });

    const expiresAt = durationMinutes ? Date.now() + parseInt(durationMinutes) * 60 * 1000 : null;
    const newGift = {
      id: uuidv4(),
      title: title.trim(),
      description: description || '',
      rewards,
      active: true,
      expiresAt,
      claimedBy: [],
      claimedCount: 0,
      createdAt: new Date().toISOString(),
      createdBy: user.username
    };
    if (!db.shopGifts) db.shopGifts = [];
    db.shopGifts.push(newGift);
    saveDB(db);

    socket.emit('admin_gift_result', { success: true, message: `Акция "${newGift.title}" создана!`, gift: newGift });
    // Уведомляем всех онлайн-игроков
    io.emit('new_shop_gift', newGift);
  });

  socket.on('admin_delete_shop_gift', (data) => {
    const { userId, giftId } = data;
    db = loadDB();
    const user = db.users.find(u => u.id === userId);
    if (!user || !user.isAdmin) return socket.emit('admin_gift_result', { success: false, message: 'Нет доступа' });
    db.shopGifts = (db.shopGifts || []).filter(g => g.id !== giftId);
    saveDB(db);
    socket.emit('admin_gift_result', { success: true, message: 'Акция удалена' });
    io.emit('shop_gifts_updated');
  });

  socket.on('admin_toggle_shop_gift', (data) => {
    const { userId, giftId } = data;
    db = loadDB();
    const user = db.users.find(u => u.id === userId);
    if (!user || !user.isAdmin) return socket.emit('admin_gift_result', { success: false, message: 'Нет доступа' });
    const gift = (db.shopGifts || []).find(g => g.id === giftId);
    if (gift) { gift.active = !gift.active; saveDB(db); }
    socket.emit('admin_gift_result', { success: true, message: 'Статус акции изменён' });
    io.emit('shop_gifts_updated');
  });

  // ADMIN: раздать подарок всем игрокам сразу
  socket.on('admin_gift_all', (data) => {
    const { userId, rewards } = data;
    db = loadDB();
    const user = db.users.find(u => u.id === userId);
    if (!user || !user.isAdmin) return socket.emit('admin_gift_result', { success: false, message: 'Нет доступа' });
    if (!rewards || !rewards.length) return socket.emit('admin_gift_result', { success: false, message: 'Укажите награды' });

    let count = 0;
    for (const u of db.users) {
      for (const r of rewards) {
        if (r.type === 'coins') { u.coins += r.amount; }
        else if (r.type === 'crystals') { if (!u.crystals) u.crystals = 0; u.crystals += r.amount; }
        else if (r.type === 'box') { if (!u.inventory) u.inventory = []; u.inventory.push(r.boxType); }
      }
      count++;
    }
    saveDB(db);

    const rewardDesc = rewards.map(r => r.type === 'coins' ? `🪙${r.amount}` : r.type === 'crystals' ? `💎${r.amount}` : `📦${r.boxType}`).join(', ');
    socket.emit('admin_gift_result', { success: true, message: `Подарок выдан ${count} игрокам: ${rewardDesc}` });
    // Уведомляем всех онлайн
    io.emit('gift_received', { type: 'all', message: `🎁 Администратор раздал подарки всем игрокам: ${rewardDesc}!` });
  });

  // ==================== UPDATED PROMO (multi-reward) ====================
  socket.on('admin_create_promo_v2', (data) => {
    const { userId, code, rewards, maxUses } = data;
    db = loadDB();
    const user = db.users.find(u => u.id === userId);
    if (!user || !user.isAdmin) return socket.emit('admin_promo_result', { success: false, message: 'Нет доступа' });

    const exists = db.promoCodes.find(p => p.code.toLowerCase() === code.toLowerCase());
    if (exists) return socket.emit('admin_promo_result', { success: false, message: 'Промокод уже существует' });

    // rewards = массив: [{type:'coins',amount:100},{type:'box',boxType:'skin_box'},{type:'crystals',amount:50}]
    const newPromo = {
      id: uuidv4(),
      code: code.toUpperCase(),
      reward: 0, // legacy
      rewards: rewards || [],
      maxUses: parseInt(maxUses) || null,
      usedCount: 0,
      usedBy: [],
      active: true,
      createdAt: new Date().toISOString()
    };
    // Для обратной совместимости — если есть монеты, пишем в reward
    const coinsReward = (rewards || []).find(r => r.type === 'coins');
    if (coinsReward) newPromo.reward = coinsReward.amount;

    db.promoCodes.push(newPromo);
    saveDB(db);
    socket.emit('admin_promo_result', { success: true, message: `Промокод ${newPromo.code} создан!`, promo: newPromo });
  });

  // Обновлённый use_promo с поддержкой multi-reward
  socket.on('use_promo_v2', (data) => {
    const { userId, code } = data;
    db = loadDB();
    const user = db.users.find(u => u.id === userId);
    if (!user) return socket.emit('promo_result', { success: false, message: 'Пользователь не найден' });

    const promo = db.promoCodes.find(p => p.code.toLowerCase() === code.toLowerCase());
    if (!promo) return socket.emit('promo_result', { success: false, message: 'Промокод не найден' });
    if (!promo.active) return socket.emit('promo_result', { success: false, message: 'Промокод деактивирован' });
    if (promo.usedBy && promo.usedBy.includes(userId)) return socket.emit('promo_result', { success: false, message: 'Вы уже использовали этот промокод' });
    if (promo.maxUses && promo.usedCount >= promo.maxUses) return socket.emit('promo_result', { success: false, message: 'Промокод исчерпан' });

    const messages = [];
    const rewardsList = promo.rewards && promo.rewards.length > 0 ? promo.rewards : [{ type: 'coins', amount: promo.reward || 0 }];

    for (const r of rewardsList) {
      if (r.type === 'coins') {
        user.coins += r.amount || 0;
        messages.push(`🪙 ${r.amount} монет`);
      } else if (r.type === 'crystals') {
        if (!user.crystals) user.crystals = 0;
        user.crystals += r.amount || 0;
        messages.push(`💎 ${r.amount} кристаллов`);
      } else if (r.type === 'box') {
        if (!user.inventory) user.inventory = [];
        user.inventory.push(r.boxType);
        const box = LOOT_BOXES[r.boxType];
        messages.push(box ? `${box.emoji} ${box.name}` : `📦 Ящик`);
      }
    }

    if (!promo.usedBy) promo.usedBy = [];
    promo.usedBy.push(userId);
    promo.usedCount = (promo.usedCount || 0) + 1;
    if (promo.maxUses && promo.usedCount >= promo.maxUses) promo.active = false;

    saveDB(db);
    const safeUser = { ...user }; delete safeUser.password;
    socket.emit('promo_result', { success: true, message: `Получено: ${messages.join(', ')}!`, user: safeUser });
  });

  // --- BOT GAME ---
  socket.on('start_bot_game', (data) => {
    const { userId, username, role, difficulty } = data;
    const gameId = 'bot_' + uuidv4();

    // Определяем сложность по уровню игрока если не задана явно
    db = loadDB();
    const user = db.users.find(u => u.id === userId);
    let autoDiff = difficulty;
    if (!autoDiff || autoDiff === 'auto') {
      const lv = calcLevel(user ? user.wins : 0).level;
      if (lv <= 10) autoDiff = 'easy';
      else if (lv <= 40) autoDiff = 'medium';
      else autoDiff = 'hard';
    }

    const botName = autoDiff === 'hard' ? '🤖 Бот (Сложный)' : autoDiff === 'medium' ? '🤖 Бот (Средний)' : '🤖 Бот (Лёгкий)';

    const humanPlayer = { socketId: socket.id, userId, username };
    const botPlayer = { socketId: 'bot', userId: 'bot_' + gameId, username: botName };

    let plantPlayer, zombiePlayer;
    if (role === 'plant') {
      plantPlayer = humanPlayer;
      zombiePlayer = botPlayer;
    } else {
      plantPlayer = botPlayer;
      zombiePlayer = humanPlayer;
    }

    const gameState = createGameState(gameId, plantPlayer, zombiePlayer);
    gameState.isBot = true;
    gameState.botRole = role === 'plant' ? 'zombie' : 'plant';
    gameState.botDifficulty = autoDiff;
    gameState.humanUserId = userId;
    activeGames[gameId] = gameState;

    socket.join(gameId);
    socket.emit('game_start', {
      gameId,
      role,
      opponent: botName,
      isBot: true,
      difficulty: autoDiff,
      gameState: getClientState(gameState, role)
    });
  });


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

  // --- MATCHMAKING ---
  socket.on('find_game', (data) => {
    const { userId, username } = data;
    console.log(`🔍 find_game: ${username} (${userId}), queue: ${waitingPlayers.length}`);

    // Убираем из очереди если уже есть
    const idx = waitingPlayers.findIndex(p => p.userId === userId);
    if (idx !== -1) waitingPlayers.splice(idx, 1);

    waitingPlayers.push({ socketId: socket.id, userId, username });
    socket.emit('waiting_for_opponent');
    console.log(`⏳ Queue size: ${waitingPlayers.length}`);

    if (waitingPlayers.length >= 2) {
      const player1 = waitingPlayers.shift();
      const player2 = waitingPlayers.shift();

      const gameId = uuidv4();
      const gameState = createGameState(gameId, player1, player2);
      activeGames[gameId] = gameState;

      console.log(`🎮 Game started: ${gameId}, plant: ${player1.username}, zombie: ${player2.username}`);

      const p1Socket = io.sockets.sockets.get(player1.socketId);
      const p2Socket = io.sockets.sockets.get(player2.socketId);

      if (p1Socket) {
        p1Socket.join(gameId);
        p1Socket.emit('game_start', {
          gameId,
          role: 'plant',
          opponent: player2.username,
          gameState: getClientState(gameState, 'plant')
        });
        console.log(`✅ Sent game_start to plant: ${player1.username}`);
      } else {
        console.log(`❌ p1Socket not found for ${player1.username}`);
      }
      if (p2Socket) {
        p2Socket.join(gameId);
        p2Socket.emit('game_start', {
          gameId,
          role: 'zombie',
          opponent: player1.username,
          gameState: getClientState(gameState, 'zombie')
        });
        console.log(`✅ Sent game_start to zombie: ${player2.username}`);
      } else {
        console.log(`❌ p2Socket not found for ${player2.username}`);
      }
    }
  });

  socket.on('cancel_search', (data) => {
    const { userId } = data;
    const idx = waitingPlayers.findIndex(p => p.userId === userId);
    if (idx !== -1) waitingPlayers.splice(idx, 1);
    socket.emit('search_cancelled');
  });

  // --- GAME ACTIONS ---
  socket.on('place_plant', (data) => {
    const { gameId, userId, plantType, col, row } = data;
    const game = activeGames[gameId];
    if (!game) {
      return socket.emit('action_error', { message: 'Игра не найдена' });
    }
    if (game.phase !== 'playing') {
      return socket.emit('action_error', { message: 'Игра не активна' });
    }
    if (game.plantPlayer.userId !== userId) {
      return socket.emit('action_error', { message: 'Вы играете за зомби!' });
    }

    const cost = getPlantCost(plantType);
    if (game.plantSun < cost) {
      return socket.emit('action_error', { message: 'Недостаточно солнца! Нужно ' + cost });
    }

    const cellKey = `${col}_${row}`;
    if (game.grid[cellKey]) {
      return socket.emit('action_error', { message: 'Клетка занята!' });
    }

    game.plantSun -= cost;
    const hp = getPlantHP(plantType);
    game.grid[cellKey] = { type: plantType, hp: hp, maxHp: hp, col: parseInt(col), row: parseInt(row) };

    io.to(gameId).emit('game_update', getFullGameState(game));
  });

  socket.on('send_zombie', (data) => {
    const { gameId, userId, zombieType, lane } = data;
    const game = activeGames[gameId];
    if (!game) return socket.emit('action_error', { message: 'Игра не найдена' });
    if (game.phase !== 'playing') return;

    // Проверяем что этот игрок - зомби
    if (game.zombiePlayer.userId !== userId) {
      return socket.emit('action_error', { message: 'Вы играете за растения, а не за зомби!' });
    }

    const cost = getZombieCost(zombieType);
    if (game.zombieBrains < cost) {
      return socket.emit('action_error', { message: `Недостаточно мозгов! Нужно ${cost}` });
    }

    game.zombieBrains -= cost;
    const zombie = {
      id: uuidv4(),
      type: zombieType,
      hp: getZombieHP(zombieType),
      maxHp: getZombieHP(zombieType),
      lane: parseInt(lane),
      col: 8.5,
      speed: getZombieSpeed(zombieType)
    };
    game.zombies.push(zombie);

    io.to(gameId).emit('game_update', getFullGameState(game));
  });

  socket.on('disconnect', () => {
    console.log('Отключился:', socket.id);

    // Убираем из очереди
    const idx = waitingPlayers.findIndex(p => p.socketId === socket.id);
    if (idx !== -1) waitingPlayers.splice(idx, 1);

    // Проверяем активные игры - даём 15 секунд на переподключение
    for (const gameId in activeGames) {
      const game = activeGames[gameId];
      if (game.plantPlayer.socketId === socket.id || game.zombiePlayer.socketId === socket.id) {
        if (game.phase === 'playing') {
          console.log(`⏳ Player disconnected from game ${gameId}, waiting 15s for reconnect...`);
          // Помечаем время отключения
          if (game.plantPlayer.socketId === socket.id) {
            game.plantPlayer.disconnectedAt = Date.now();
          } else {
            game.zombiePlayer.disconnectedAt = Date.now();
          }
          // Даём 15 секунд на переподключение
          setTimeout(() => {
            const g = activeGames[gameId];
            if (!g || g.phase !== 'playing') return;
            // Проверяем что игрок не переподключился
            if (g.plantPlayer.disconnectedAt && Date.now() - g.plantPlayer.disconnectedAt >= 14000) {
              console.log(`❌ Plant player did not reconnect, ending game`);
              endGame(gameId, 'zombie', 'disconnect');
            } else if (g.zombiePlayer.disconnectedAt && Date.now() - g.zombiePlayer.disconnectedAt >= 14000) {
              console.log(`❌ Zombie player did not reconnect, ending game`);
              endGame(gameId, 'plant', 'disconnect');
            }
          }, 15000);
        }
      }
    }
  });

  socket.on('leave_game', (data) => {
    const { gameId, userId } = data;
    const game = activeGames[gameId];
    if (!game) return;

    if (game.phase === 'playing') {
      const winner = game.plantPlayer.userId === userId ? 'zombie' : 'plant';
      endGame(gameId, winner, 'surrender');
    }
  });

  // --- REJOIN GAME ---
  socket.on('rejoin_game', (data) => {
    const { gameId, userId } = data;
    const game = activeGames[gameId];
    if (!game) {
      console.log(`rejoin_game: game ${gameId} not found`);
      return;
    }
    socket.join(gameId);
    // Обновляем socketId игрока и сбрасываем disconnectedAt
    if (game.plantPlayer.userId === userId) {
      game.plantPlayer.socketId = socket.id;
      delete game.plantPlayer.disconnectedAt;
      console.log(`✅ Plant player rejoined: ${game.plantPlayer.username}`);
    }
    if (game.zombiePlayer.userId === userId) {
      game.zombiePlayer.socketId = socket.id;
      delete game.zombiePlayer.disconnectedAt;
      console.log(`✅ Zombie player rejoined: ${game.zombiePlayer.username}`);
    }
    socket.emit('game_update', getFullGameState(game));
  });

  // --- BUFFS ---
  socket.on('activate_buff', (data) => {
    const { gameId, userId, role, buffType } = data;
    const game = activeGames[gameId];
    if (!game || game.phase !== 'playing') return;

    // Проверяем что игрок в этой игре
    const isPlant = game.plantPlayer.userId === userId;
    const isZombie = game.zombiePlayer.userId === userId;
    if (!isPlant && !isZombie) return;

    const BUFF_COOLDOWNS = {
      sun_boost: 45, double_dmg: 60, shield: 90,
      brain_boost: 45, speed_boost: 60, horde: 30
    };
    const BUFF_DURATIONS = {
      sun_boost: 30, double_dmg: 20, shield: 15,
      brain_boost: 30, speed_boost: 20, horde: 10
    };

    // Проверяем кулдаун
    if (!game.buffCooldowns) game.buffCooldowns = {};
    const cdKey = userId + '_' + buffType;
    const now = Date.now();
    if (game.buffCooldowns[cdKey] && now < game.buffCooldowns[cdKey]) {
      const left = Math.ceil((game.buffCooldowns[cdKey] - now) / 1000);
      return socket.emit('buff_error', { message: 'Бафф на кулдауне! Осталось ' + left + 'с' });
    }

    const duration = BUFF_DURATIONS[buffType] || 20;
    const cooldown = BUFF_COOLDOWNS[buffType] || 45;
    game.buffCooldowns[cdKey] = now + cooldown * 1000;

    // Применяем бафф
    if (!game.activeBuffs) game.activeBuffs = {};
    game.activeBuffs[buffType] = { expires: now + duration * 1000, role: isPlant ? 'plant' : 'zombie' };

    // Немедленный эффект
    if (buffType === 'sun_boost') game.plantSun = Math.min(game.plantSun + 50, 500);
    if (buffType === 'brain_boost') game.zombieBrains = Math.min(game.zombieBrains + 40, 500);
    if (buffType === 'horde') game.freeZombie = true;

    io.to(gameId).emit('buff_activated', {
      buffType, duration, cooldown,
      activatedBy: isPlant ? 'plant' : 'zombie'
    });
    io.to(gameId).emit('game_update', getFullGameState(game));
  });

  // --- FRIENDS ---
  socket.on('get_friends', (data) => {
    const { userId } = data;
    db = loadDB();
    const user = db.users.find(u => u.id === userId);
    if (!user) return socket.emit('friends_data', { success: false, message: 'Пользователь не найден' });

    const friends = (user.friends || []).map(fId => {
      const f = db.users.find(u => u.id === fId);
      if (!f) return null;
      return { id: f.id, username: f.username, wins: f.wins, coins: f.coins, isAdmin: f.isAdmin };
    }).filter(Boolean);

    const requests = (user.friendRequests || []).map(fId => {
      const f = db.users.find(u => u.id === fId);
      if (!f) return null;
      return { id: f.id, username: f.username };
    }).filter(Boolean);

    socket.emit('friends_data', { success: true, friends, requests });
  });

  socket.on('send_friend_request', (data) => {
    const { userId, targetUsername } = data;
    db = loadDB();
    const user = db.users.find(u => u.id === userId);
    if (!user) return socket.emit('friend_result', { success: false, message: 'Пользователь не найден' });

    const target = db.users.find(u => u.username.toLowerCase() === targetUsername.toLowerCase());
    if (!target) return socket.emit('friend_result', { success: false, message: 'Игрок не найден' });
    if (target.id === userId) return socket.emit('friend_result', { success: false, message: 'Нельзя добавить себя' });

    if (!user.friends) user.friends = [];
    if (!target.friendRequests) target.friendRequests = [];

    if (user.friends.includes(target.id)) return socket.emit('friend_result', { success: false, message: 'Уже в друзьях' });
    if (target.friendRequests.includes(userId)) return socket.emit('friend_result', { success: false, message: 'Запрос уже отправлен' });

    // Если target уже отправил запрос нам — сразу принимаем
    if ((user.friendRequests || []).includes(target.id)) {
      user.friends.push(target.id);
      if (!target.friends) target.friends = [];
      target.friends.push(userId);
      user.friendRequests = (user.friendRequests || []).filter(id => id !== target.id);
      saveDB(db);
      // Уведомляем обоих
      socket.emit('friend_result', { success: true, message: `${target.username} теперь ваш друг!` });
      // Уведомляем target если онлайн
      for (const [sid, s] of io.sockets.sockets) {
        if (s.userId === target.id) {
          s.emit('friend_accepted', { username: user.username });
        }
      }
      return;
    }

    target.friendRequests.push(userId);
    saveDB(db);
    socket.emit('friend_result', { success: true, message: `Запрос отправлен игроку ${target.username}` });

    // Уведомляем target если онлайн
    for (const [sid, s] of io.sockets.sockets) {
      if (s.userId === target.id) {
        s.emit('friend_request_received', { id: userId, username: user.username });
      }
    }
  });

  socket.on('accept_friend', (data) => {
    const { userId, fromId } = data;
    db = loadDB();
    const user = db.users.find(u => u.id === userId);
    const from = db.users.find(u => u.id === fromId);
    if (!user || !from) return socket.emit('friend_result', { success: false, message: 'Пользователь не найден' });

    if (!user.friends) user.friends = [];
    if (!from.friends) from.friends = [];

    user.friends.push(fromId);
    from.friends.push(userId);
    user.friendRequests = (user.friendRequests || []).filter(id => id !== fromId);
    saveDB(db);

    socket.emit('friend_result', { success: true, message: `${from.username} добавлен в друзья!` });
    socket.emit('friends_data', {
      success: true,
      friends: user.friends.map(fId => {
        const f = db.users.find(u => u.id === fId);
        return f ? { id: f.id, username: f.username, wins: f.wins, coins: f.coins } : null;
      }).filter(Boolean),
      requests: (user.friendRequests || []).map(fId => {
        const f = db.users.find(u => u.id === fId);
        return f ? { id: f.id, username: f.username } : null;
      }).filter(Boolean)
    });

    // Уведомляем from
    for (const [sid, s] of io.sockets.sockets) {
      if (s.userId === fromId) {
        s.emit('friend_accepted', { username: user.username });
      }
    }
  });

  socket.on('decline_friend', (data) => {
    const { userId, fromId } = data;
    db = loadDB();
    const user = db.users.find(u => u.id === userId);
    if (!user) return;
    user.friendRequests = (user.friendRequests || []).filter(id => id !== fromId);
    saveDB(db);
    socket.emit('friend_result', { success: true, message: 'Запрос отклонён' });
  });

  socket.on('remove_friend', (data) => {
    const { userId, friendId } = data;
    db = loadDB();
    const user = db.users.find(u => u.id === userId);
    const friend = db.users.find(u => u.id === friendId);
    if (user) user.friends = (user.friends || []).filter(id => id !== friendId);
    if (friend) friend.friends = (friend.friends || []).filter(id => id !== userId);
    saveDB(db);
    socket.emit('friend_result', { success: true, message: 'Друг удалён' });
  });

  // --- FRIENDLY BATTLE ---
  socket.on('challenge_friend', (data) => {
    const { userId, username, friendId } = data;
    db = loadDB();
    const user = db.users.find(u => u.id === userId);
    if (!user) return;
    if (!(user.friends || []).includes(friendId)) {
      return socket.emit('challenge_result', { success: false, message: 'Этот игрок не в вашем списке друзей' });
    }

    // Сохраняем userId в socket для поиска
    socket.userId = userId;

    // Ищем сокет друга
    let found = false;
    for (const [sid, s] of io.sockets.sockets) {
      if (s.userId === friendId) {
        s.emit('friend_challenge', { fromId: userId, fromUsername: username });
        socket.emit('challenge_result', { success: true, message: 'Вызов отправлен! Ждём ответа...' });
        found = true;
        break;
      }
    }
    if (!found) {
      socket.emit('challenge_result', { success: false, message: 'Друг сейчас не в сети' });
    }
  });

  socket.on('accept_challenge', (data) => {
    const { userId, username, fromId } = data;
    socket.userId = userId;

    // Ищем сокет инициатора
    let fromSocket = null;
    for (const [sid, s] of io.sockets.sockets) {
      if (s.userId === fromId) { fromSocket = s; break; }
    }
    if (!fromSocket) {
      return socket.emit('challenge_result', { success: false, message: 'Соперник уже не в сети' });
    }

    db = loadDB();
    const fromUser = db.users.find(u => u.id === fromId);
    const toUser = db.users.find(u => u.id === userId);

    const gameId = 'friendly_' + uuidv4();
    const player1 = { socketId: fromSocket.id, userId: fromId, username: fromUser ? fromUser.username : 'Игрок1' };
    const player2 = { socketId: socket.id, userId, username: toUser ? toUser.username : 'Игрок2' };

    const gameState = createGameState(gameId, player1, player2);
    gameState.isFriendly = true; // дружеский бой — без наград
    activeGames[gameId] = gameState;

    fromSocket.join(gameId);
    socket.join(gameId);

    fromSocket.emit('game_start', {
      gameId, role: 'plant', opponent: player2.username,
      isFriendly: true, gameState: getClientState(gameState, 'plant')
    });
    socket.emit('game_start', {
      gameId, role: 'zombie', opponent: player1.username,
      isFriendly: true, gameState: getClientState(gameState, 'zombie')
    });
  });

  socket.on('decline_challenge', (data) => {
    const { fromId, username } = data;
    for (const [sid, s] of io.sockets.sockets) {
      if (s.userId === fromId) {
        s.emit('challenge_declined', { username });
        break;
      }
    }
  });

  // --- PROFILE ---
  socket.on('update_profile', (data) => {
    const { userId, newUsername, avatar, bio } = data;
    db = loadDB();
    const user = db.users.find(u => u.id === userId);
    if (!user) return socket.emit('profile_result', { success: false, message: 'Пользователь не найден' });

    // Смена ника
    if (newUsername && newUsername !== user.username) {
      if (newUsername.length < 3) return socket.emit('profile_result', { success: false, message: 'Ник минимум 3 символа' });
      if (newUsername.length > 20) return socket.emit('profile_result', { success: false, message: 'Ник максимум 20 символов' });
      const exists = db.users.find(u => u.username.toLowerCase() === newUsername.toLowerCase() && u.id !== userId);
      if (exists) return socket.emit('profile_result', { success: false, message: 'Этот ник уже занят' });
      user.username = newUsername.trim();
    }
    if (avatar !== undefined) user.avatar = avatar;
    if (bio !== undefined) user.bio = bio.slice(0, 150);
    saveDB(db);

    const safeUser = { ...user };
    delete safeUser.password;
    socket.emit('profile_result', { success: true, message: 'Профиль обновлён!', user: safeUser });
  });

  socket.on('get_profile', (data) => {
    const { username } = data;
    db = loadDB();
    const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) return socket.emit('profile_data', { success: false, message: 'Игрок не найден' });
    
    // Проверяем и сбрасываем победы дня если новый день
    const today = new Date().toISOString().split('T')[0];
    if (user.lastWinDate !== today) {
      user.winsToday = 0;
      user.lastWinDate = today;
      saveDB(db);
    }
    
    const level = calcLevel(user.wins);
    const league = getLeague(user.wins);
    socket.emit('profile_data', {
      success: true,
      profile: {
        id: user.id,
        username: user.username,
        avatar: user.avatar || '🎮',
        bio: user.bio || '',
        wins: user.wins || 0,
        winsToday: user.winsToday || 0,
        losses: user.losses || 0,
        coins: user.coins || 0,
        isAdmin: user.isAdmin || false,
        badges: user.badges || [],
        level: level.level,
        xp: level.xp,
        xpNext: level.xpNext,
        league: league,
        createdAt: user.createdAt
      }
    });
  });

  // --- LEADERBOARD RESET (admin) ---
  socket.on('admin_reset_leaderboard', (data) => {
    const { userId } = data;
    db = loadDB();
    const user = db.users.find(u => u.id === userId);
    if (!user || !user.isAdmin) return socket.emit('admin_action_result', { success: false, message: 'Нет доступа' });

    const season = (db.season || 0) + 1;
    const seasonBadges = {
      1: { id: 'season1_top1', emoji: '🥇', name: 'Чемпион Сезона 1', desc: '1-е место в сезоне 1' },
      2: { id: 'season1_top2', emoji: '🥈', name: 'Серебро Сезона 1', desc: '2-е место в сезоне 1' },
      3: { id: 'season1_top3', emoji: '🥉', name: 'Бронза Сезона 1', desc: '3-е место в сезоне 1' }
    };

    // Топ-3 получают значки
    const sorted = db.users.slice().sort((a, b) => (b.wins || 0) - (a.wins || 0));
    for (let i = 0; i < Math.min(3, sorted.length); i++) {
      const u = sorted[i];
      if (!u.badges) u.badges = [];
      const badge = { ...seasonBadges[i + 1], season, earnedAt: new Date().toISOString() };
      u.badges.push(badge);
      u.coins += (3 - i) * 200; // 600, 400, 200 монет
    }

    // Сбрасываем wins/losses у всех
    for (const u of db.users) {
      u.wins = 0;
      u.losses = 0;
    }

    db.season = season;
    saveDB(db);
    socket.emit('admin_action_result', { success: true, message: `Сезон ${season} завершён! Лидерборд сброшен. Топ-3 получили значки.` });
    io.emit('season_reset', { season, message: `🏆 Сезон ${season} завершён! Начинается новый сезон!` });
  });

  // Сохраняем userId в socket при подключении
  socket.on('set_user_id', (data) => {
    socket.userId = data.userId;
  });

  // Получить свежие данные пользователя (вызывается при загрузке меню)
  socket.on('get_fresh_user', (data) => {
    const { userId } = data;
    db = loadDB();
    const user = db.users.find(u => u.id === userId);
    if (!user) return socket.emit('fresh_user_data', { success: false });
    const safeUser = { ...user };
    delete safeUser.password;
    socket.emit('fresh_user_data', { success: true, user: safeUser });
  });

  // --- EVENTS ---
  socket.on('get_events', () => {
    db = loadDB();
    socket.emit('events_data', db.events || []);
  });

  socket.on('admin_create_event', (data) => {
    const { userId, name, description, targetWins, reward } = data;
    db = loadDB();
    const user = db.users.find(u => u.id === userId);
    if (!user || !user.isAdmin) {
      return socket.emit('admin_event_result', { success: false, message: 'Нет доступа' });
    }
    if (!name || !targetWins || !reward) {
      return socket.emit('admin_event_result', { success: false, message: 'Заполните все поля' });
    }
    const newEvent = {
      id: uuidv4(),
      name: name.trim(),
      description: description || '',
      targetWins: parseInt(targetWins),
      reward: parseInt(reward),
      currentWins: 0,
      active: true,
      completed: false,
      participants: [], // userId тех кто уже получил награду
      createdAt: new Date().toISOString()
    };
    if (!db.events) db.events = [];
    db.events.push(newEvent);
    saveDB(db);
    socket.emit('admin_event_result', { success: true, message: `Событие "${newEvent.name}" создано!` });
    io.emit('events_data', db.events);
  });

  socket.on('admin_delete_event', (data) => {
    const { userId, eventId } = data;
    db = loadDB();
    const user = db.users.find(u => u.id === userId);
    if (!user || !user.isAdmin) return;
    db.events = (db.events || []).filter(e => e.id !== eventId);
    saveDB(db);
    socket.emit('admin_event_result', { success: true, message: 'Событие удалено' });
    io.emit('events_data', db.events);
  });

  // ==================== DAILY WINS (ПОБЕДЫ ДНЯ) ====================
  socket.on('get_daily_wins', (data) => {
    const { userId } = data;
    db = loadDB();
    const user = db.users.find(u => u.id === userId);
    if (!user) return socket.emit('daily_wins_data', { success: false, message: 'Пользователь не найден' });

    const today = new Date().toISOString().split('T')[0];
    const resetTime = getDailyResetTime();
    const lucky = isLuckyDay();

    // Проверяем новый день - сбрасываем победы
    if (user.lastWinDate !== today) {
      user.winsToday = 0;
      user.lastWinDate = today;
      saveDB(db);
    }

    socket.emit('daily_wins_data', {
      success: true,
      winsToday: user.winsToday || 0,
      maxWins: 6,
      resetTime: resetTime,
      isLuckyDay: lucky,
      rewards: lucky ? LUCKY_DAYS_REWARDS : DAILY_WINS_REWARDS
    });
  });

  socket.on('claim_daily_reward', (data) => {
    const { userId, rewardIndex } = data;
    db = loadDB();
    const user = db.users.find(u => u.id === userId);
    if (!user) return socket.emit('daily_reward_result', { success: false, message: 'Пользователь не найден' });

    const today = new Date().toISOString().split('T')[0];
    const lucky = isLuckyDay();
    const rewards = lucky ? LUCKY_DAYS_REWARDS : DAILY_WINS_REWARDS;
    
    if (rewardIndex < 0 || rewardIndex >= rewards.length) {
      return socket.emit('daily_reward_result', { success: false, message: 'Неверный индекс награды' });
    }

    const targetWins = rewards[rewardIndex].wins;
    if ((user.winsToday || 0) < targetWins) {
      return socket.emit('daily_reward_result', { success: false, message: `Нужно ${targetWins} побед, у вас ${user.winsToday || 0}` });
    }

    // Проверяем не получена ли уже награда
    if (!user.dailyRewardsClaimed) user.dailyRewardsClaimed = {};
    if (user.dailyRewardsClaimed[today] && user.dailyRewardsClaimed[today].includes(rewardIndex)) {
      return socket.emit('daily_reward_result', { success: false, message: 'Награда уже получена' });
    }

    // Выдаём награду
    const reward = rewards[rewardIndex];
    let message = '';

    if (reward.type === 'loot_box') {
      if (!user.inventory) user.inventory = [];
      user.inventory.push(reward.boxType);
      message = `Получен ${reward.label}!`;
    } else if (reward.type === 'coins') {
      const amount = Math.floor(Math.random() * (reward.max - reward.min)) + reward.min;
      user.coins += amount;
      message = `Получено ${amount} монет!`;
    }

    // Записываем что награда получена
    if (!user.dailyRewardsClaimed[today]) user.dailyRewardsClaimed[today] = [];
    user.dailyRewardsClaimed[today].push(rewardIndex);

    saveDB(db);

    const safeUser = { ...user };
    delete safeUser.password;
    socket.emit('daily_reward_result', { success: true, message, user: safeUser });
  });

  // ==================== LOOT BOXES SHOP ====================
  socket.on('get_loot_boxes', () => {
    socket.emit('loot_boxes_data', SHOP_LOOT_BOXES);
  });

  socket.on('buy_loot_box', (data) => {
    const { userId, boxId } = data;
    db = loadDB();
    const user = db.users.find(u => u.id === userId);
    if (!user) return socket.emit('buy_loot_result', { success: false, message: 'Пользователь не найден' });

    const box = SHOP_LOOT_BOXES.find(b => b.id === boxId);
    if (!box) return socket.emit('buy_loot_result', { success: false, message: 'Ящик не найден' });

    if (user.coins < box.price) {
      return socket.emit('buy_loot_result', { success: false, message: 'Недостаточно монет' });
    }

    user.coins -= box.price;
    if (!user.inventory) user.inventory = [];
    user.inventory.push(boxId);
    saveDB(db);

    const safeUser = { ...user };
    delete safeUser.password;
    socket.emit('buy_loot_result', { success: true, message: `Куплено: ${box.name}!`, user: safeUser });
  });

  socket.on('open_loot_box', (data) => {
    const { userId, boxId } = data;
    db = loadDB();
    const user = db.users.find(u => u.id === userId);
    if (!user) return socket.emit('loot_open_result', { success: false, message: 'Пользователь не найден' });

    if (!user.inventory) user.inventory = [];
    const boxIdx = user.inventory.indexOf(boxId);
    if (boxIdx === -1) return socket.emit('loot_open_result', { success: false, message: 'Ящик не найден в инвентаре' });

    user.inventory.splice(boxIdx, 1);

    let reward = null;
    const box = LOOT_BOXES[boxId];

    if (boxId.startsWith('coins_')) {
      // Монетный ящик
      const min = box.description.match(/(\d+)-(\d+)/);
      let minVal = 20, maxVal = 40;
      if (min) { minVal = parseInt(min[1]); maxVal = parseInt(min[2]); }
      const amount = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
      user.coins += amount;
      reward = { type: 'coins', amount, message: `💰 Выпало ${amount} монет!` };
    } else if (boxId.startsWith('card_')) {
      // Карточный ящик
      const rarity = boxId.includes('common') ? 'common' : boxId.includes('rare') ? 'rare' : boxId.includes('epic') ? 'epic' : 'common';
      const cards = UPGRADE_CARDS.filter(c => c.rarity === rarity);
      if (cards.length > 0) {
        const card = cards[Math.floor(Math.random() * cards.length)];
        if (!user.cards) user.cards = [];
        user.cards.push(card.id);
        reward = { type: 'card', card, message: `🃏 Выпала карта: ${card.emoji} ${card.name}!` };
      } else {
        user.coins += 50;
        reward = { type: 'coins', amount: 50, message: '🪙 Выпало 50 монет (карт нет)' };
      }
    } else if (boxId === 'plant_box') {
      // Ящик растений
      const plants = ALL_SHOP_ITEMS.filter(i => i.type === 'plant');
      const notOwned = plants.filter(i => !user.inventory.includes(i.id));
      if (notOwned.length > 0) {
        const weights = { common: 50, rare: 30, epic: 15, legendary: 5 };
        const pool = [];
        notOwned.forEach(i => { for (let w = 0; w < (weights[i.rarity] || 10); w++) pool.push(i); });
        const item = pool[Math.floor(Math.random() * pool.length)];
        user.inventory.push(item.id);
        reward = { type: 'plant', item, message: `🌱 Выпало растение: ${item.emoji} ${item.name}!` };
      } else {
        user.coins += 100;
        reward = { type: 'coins', amount: 100, message: '🪙 Все растения есть! Получено 100 монет.' };
      }
    } else if (boxId === 'skin_box' || boxId === 'legendary_box' || boxId === 'lucky_super_box') {
      // Ящик скинов
      const skins = ALL_SHOP_ITEMS.filter(i => i.type === 'skin');
      const notOwned = skins.filter(i => !user.inventory.includes(i.id));
      if (notOwned.length > 0) {
        const weights = boxId === 'legendary_box' || boxId === 'lucky_super_box' 
          ? { common: 0, rare: 20, epic: 40, legendary: 40 }
          : { common: 40, rare: 35, epic: 20, legendary: 5 };
        const pool = [];
        notOwned.forEach(i => { for (let w = 0; w < (weights[i.rarity] || 5); w++) pool.push(i); });
        const item = pool[Math.floor(Math.random() * pool.length)];
        user.inventory.push(item.id);
        reward = { type: 'skin', item, message: `✨ Выпал скин: ${item.emoji} ${item.name}!` };
      } else {
        user.coins += 200;
        reward = { type: 'coins', amount: 200, message: '🪙 Все скины есть! Получено 200 монет.' };
      }
    } else if (boxId === 'super_box') {
      // Супер ящик - карта + монеты
      const cards = UPGRADE_CARDS.filter(c => c.rarity === 'rare' || c.rarity === 'epic');
      const card = cards[Math.floor(Math.random() * cards.length)];
      if (!user.cards) user.cards = [];
      user.cards.push(card.id);
      user.coins += 100;
      reward = { type: 'super', card, coins: 100, message: `⭐ Супер награда! ${card.emoji} ${card.name} + 100 монет!` };
    }

    if (!reward) {
      return socket.emit('loot_open_result', { success: false, message: 'Неизвестный тип ящика' });
    }

    saveDB(db);
    const safeUser = { ...user };
    delete safeUser.password;
    socket.emit('loot_open_result', { success: true, reward, user: safeUser });
  });

  // ==================== UPGRADE CARDS ====================
  socket.on('get_cards_catalog', () => {
    socket.emit('cards_catalog_data', UPGRADE_CARDS);
  });

  socket.on('get_user_cards', (data) => {
    const { userId } = data;
    db = loadDB();
    const user = db.users.find(u => u.id === userId);
    if (!user) return socket.emit('user_cards_data', { success: false });
    socket.emit('user_cards_data', { 
      success: true, 
      cards: user.cards || [],
      upgrades: user.upgrades || {} 
    });
  });

  socket.on('use_card', (data) => {
    const { userId, cardId } = data;
    db = loadDB();
    const user = db.users.find(u => u.id === userId);
    if (!user) return socket.emit('card_use_result', { success: false, message: 'Пользователь не найден' });

    if (!user.cards || !user.cards.includes(cardId)) {
      return socket.emit('card_use_result', { success: false, message: 'У вас нет этой карты' });
    }

    const card = UPGRADE_CARDS.find(c => c.id === cardId);
    if (!card) return socket.emit('card_use_result', { success: false, message: 'Карта не найдена' });

    // Удаляем карту из инвентаря
    user.cards = user.cards.filter(c => c !== cardId);

    // Применяем улучшение
    if (!user.upgrades) user.upgrades = {};
    if (!user.upgrades[card.target]) user.upgrades[card.target] = {};
    
    const current = user.upgrades[card.target][card.effect] || 0;
    user.upgrades[card.target][card.effect] = current + card.value;

    saveDB(db);

    const safeUser = { ...user };
    delete safeUser.password;
    socket.emit('card_use_result', { 
      success: true, 
      message: `Карта применена! ${card.target} +${card.value * 100}% ${card.effect}`,
      upgrades: user.upgrades,
      user: safeUser 
    });
  });
});

  // ==================== LEVEL SYSTEM ====================
  function calcLevel(wins) {
    const xp = (wins || 0) * 100;
    const level = Math.floor(Math.sqrt(xp / 100)) + 1;
    const xpForLevel = (level - 1) * (level - 1) * 100;
    const xpNext = level * level * 100;
    return { level, xp, xpForLevel, xpNext };
  }

  // ==================== LEAGUE SYSTEM ====================
  const LEAGUES = [
    { name: 'Новичок', emoji: '🌱', minWins: 0, color: '#9E9E9E', bg: 'linear-gradient(135deg, #424242, #616161)' },
    { name: 'Бронзовая', emoji: '🥉', minWins: 10, color: '#CD7F32', bg: 'linear-gradient(135deg, #8D6E63, #A1887F)' },
    { name: 'Серебряная', emoji: '🥈', minWins: 25, color: '#C0C0C0', bg: 'linear-gradient(135deg, #78909C, #90A4AE)' },
    { name: 'Золотая', emoji: '🥇', minWins: 50, color: '#FFD700', bg: 'linear-gradient(135deg, #FFA000, #FFB300)' },
    { name: 'Алмазная', emoji: '💎', minWins: 100, color: '#00BCD4', bg: 'linear-gradient(135deg, #00838F, #00ACC1)' },
    { name: 'Мифическая', emoji: '🔮', minWins: 200, color: '#9C27B0', bg: 'linear-gradient(135deg, #6A1B9A, #8E24AA)' },
    { name: 'Легендарная', emoji: '👑', minWins: 400, color: '#FF5722', bg: 'linear-gradient(135deg, #BF360C, #E64A19)' },
    { name: 'Мастер', emoji: '🏆', minWins: 750, color: '#FF1744', bg: 'linear-gradient(135deg, #C62828, #D32F2F)' }
  ];
  
  function getLeague(wins) {
    const winsCount = wins || 0;
    const level = Math.floor(Math.sqrt(winsCount * 100 / 100)) + 1;
    
    // Лига показывается только после 99 уровня (макс)
    if (level < 99) {
      return { name: '🔒 Скрыто', emoji: '🔒', minWins: 0, color: '#666', bg: 'linear-gradient(135deg, #333, #444)', hidden: true };
    }
    
    // После 99 уровня - показываем лигу
    for (let i = LEAGUES.length - 1; i >= 0; i--) {
      if (winsCount >= LEAGUES[i].minWins) {
        return LEAGUES[i];
      }
    }
    return LEAGUES[0];
  }

    // ==================== LEVEL REWARDS ====================
  const LEVEL_REWARDS = {
  2:  { type: 'coins', amount: 50,  label: '🪙 50 монет' },
  3:  { type: 'coins', amount: 75,  label: '🪙 75 монет' },
  4:  { type: 'plant', itemId: 1,   label: '🌱 Горошина-стрелок' },
  5:  { type: 'coins', amount: 100, label: '🪙 100 монет' },
  6:  { type: 'skin',  itemId: 34,  label: '🌸 Скин "Розовый горох"' },
  7:  { type: 'coins', amount: 150, label: '🪙 150 монет' },
  8:  { type: 'plant', itemId: 5,   label: '❄️ Снежный горох' },
  9:  { type: 'coins', amount: 200, label: '🪙 200 монет' },
  10: { type: 'skin',  itemId: 27,  label: '💀 Скин "Зомби-скелет"' },
  12: { type: 'coins', amount: 250, label: '🪙 250 монет' },
  15: { type: 'skin',  itemId: 14,  label: '⭐ Скин "Золотая горошина"' },
  18: { type: 'coins', amount: 300, label: '🪙 300 монет' },
  20: { type: 'plant', itemId: 4,   label: '🍒 Вишнёвая бомба' },
  25: { type: 'skin',  itemId: 15,  label: '🌈 Скин "Радужный подсолнух"' },
  30: { type: 'coins', amount: 500, label: '🪙 500 монет' },
  35: { type: 'skin',  itemId: 22,  label: '🥷 Скин "Зомби-ниндзя"' },
  40: { type: 'plant', itemId: 6,   label: '🌺 Огненный цветок' },
  45: { type: 'skin',  itemId: 29,  label: '🔮 Скин "Кристальная горошина"' },
  50: { type: 'coins', amount: 1000, label: '🪙 1000 монет' },
  // Максимальный уровень — рандомный легендарный скин
  99: { type: 'legendary_random', label: '🟠 Рандомный легендарный скин' }
};

const MAX_LEVEL = 99;

function grantLevelRewards(user, newLevel) {
  const rewards = [];
  const reward = LEVEL_REWARDS[newLevel];
  if (!reward) return rewards;

  if (reward.type === 'coins') {
    user.coins += reward.amount;
    rewards.push({ type: 'coins', amount: reward.amount, label: reward.label });
  } else if (reward.type === 'plant' || reward.type === 'skin') {
    if (!user.inventory) user.inventory = [];
    if (!user.inventory.includes(reward.itemId)) {
      user.inventory.push(reward.itemId);
      rewards.push({ type: reward.type, itemId: reward.itemId, label: reward.label });
    } else {
      // Уже есть — даём монеты вместо
      user.coins += 100;
      rewards.push({ type: 'coins', amount: 100, label: '🪙 100 монет (замена)' });
    }
  } else if (reward.type === 'legendary_random') {
    // Рандомный легендарный скин
    const legendaryItems = ALL_SHOP_ITEMS.filter(i => i.rarity === 'legendary' && i.type === 'skin');
    const notOwned = legendaryItems.filter(i => !(user.inventory || []).includes(i.id));
    if (notOwned.length > 0) {
      const item = notOwned[Math.floor(Math.random() * notOwned.length)];
      if (!user.inventory) user.inventory = [];
      user.inventory.push(item.id);
      rewards.push({ type: 'legendary_skin', itemId: item.id, label: item.emoji + ' ' + item.name });
    } else {
      user.coins += 500;
      rewards.push({ type: 'coins', amount: 500, label: '🪙 500 монет (все легендарные уже есть)' });
    }
  }

  return rewards;
}

// ==================== GAME LOGIC ====================
function createGameState(gameId, player1, player2) {
  return {
    gameId,
    plantPlayer: { ...player1 },
    zombiePlayer: { ...player2 },
    phase: 'playing',
    plantSun: 50,
    zombieBrains: 50,
    grid: {},
    zombies: [],
    tick: 0,
    plantHP: 100,
    startTime: Date.now()
  };
}

function getPlantCost(type) {
  const costs = {
    // Базовые растения
    peashooter: 100, sunflower: 50, cherrybomb: 150, wallnut: 50, snowpea: 175,
    fireflower: 500, cactus: 800,
    // Новые растения
    repeater: 350, threepeater: 600, chomper: 450, puffshroom: 25, sunshroom: 50,
    fumeshroom: 350, iceshroom: 400, spikeweed: 100, pumpkin: 350, megacactus: 1200,
    starfruit: 550, snapsdragon: 400, magnet: 300, slowbomb: 250, flowerqueen: 1500
  };
  return costs[type] || 100;
}

function getPlantHP(type) {
  const hp = {
    // Базовые растения
    peashooter: 100, sunflower: 80, cherrybomb: 50, wallnut: 300, snowpea: 100,
    fireflower: 80, cactus: 150,
    // Новые растения
    repeater: 120, threepeater: 150, chomper: 200, puffshroom: 50, sunshroom: 60,
    fumeshroom: 70, iceshroom: 120, spikeweed: 30, pumpkin: 400, megacactus: 250,
    starfruit: 90, snapsdragon: 180, magnet: 60, slowbomb: 80, flowerqueen: 300
  };
  return hp[type] || 100;
}

function getZombieCost(type) {
  const costs = {
    // Базовые зомби
    basic: 50, cone: 75, bucket: 100, football: 125, knight: 450, giant: 700,
    // Новые зомби
    polevault: 180, newspaper: 150, dancer: 600, balloon: 350, digger: 400,
    swimmer: 250, guard: 350, kamikaze: 300, teleporter: 500, zomboss: 2000,
    yogurt: 150, gargoyle: 650, emperor: 2500
  };
  return costs[type] || 50;
}

function getZombieHP(type) {
  const hp = {
    // Базовые зомби
    basic: 3, cone: 5, bucket: 8, football: 10, knight: 15, giant: 30,
    // Новые зомби
    polevault: 4, newspaper: 3, dancer: 8, balloon: 4, digger: 6,
    swimmer: 5, guard: 12, kamikaze: 2, teleporter: 7, zomboss: 100,
    yogurt: 4, gargoyle: 12, emperor: 50
  };
  return hp[type] || 3;
}

function getZombieSpeed(type) {
  const speed = {
    // Базовые зомби
    basic: 1, cone: 1, bucket: 0.8, football: 1.5, knight: 0.9, giant: 0.5,
    // Новые зомби
    polevault: 1.8, newspaper: 2.0, dancer: 1.1, balloon: 0.7, digger: 1.2,
    swimmer: 1.0, guard: 0.8, kamikaze: 1.3, teleporter: 1.4, zomboss: 0.3,
    yogurt: 1.6, gargoyle: 0.9, emperor: 0.4
  };
  return speed[type] || 1;
}

function getClientState(game, role) {
  return {
    gameId: game.gameId,
    phase: game.phase,
    plantSun: game.plantSun,
    zombieBrains: game.zombieBrains,
    grid: game.grid,
    zombies: game.zombies,
    plantHP: game.plantHP,
    tick: game.tick,
    myRole: role
  };
}

function getFullGameState(game) {
  return {
    phase: game.phase,
    plantSun: game.plantSun,
    zombieBrains: game.zombieBrains,
    grid: game.grid,
    zombies: game.zombies,
    plantHP: game.plantHP,
    tick: game.tick
  };
}

function endGame(gameId, winnerRole, reason) {
  const game = activeGames[gameId];
  if (!game) return;

  game.phase = 'ended';

  const winnerId = winnerRole === 'plant' ? game.plantPlayer.userId : game.zombiePlayer.userId;
  const loserId = winnerRole === 'plant' ? game.zombiePlayer.userId : game.plantPlayer.userId;

  console.log(`🏁 endGame: gameId=${gameId} winner=${winnerRole} reason=${reason} isBot=${game.isBot} isFriendly=${game.isFriendly}`);
  console.log(`   plantPlayer.userId=${game.plantPlayer.userId} zombiePlayer.userId=${game.zombiePlayer.userId}`);
  console.log(`   winnerId=${winnerId} loserId=${loserId}`);

  db = loadDB();
  const winner = db.users.find(u => u.id === winnerId);
  const loser = db.users.find(u => u.id === loserId);

  console.log(`   winner found: ${winner ? winner.username : 'NOT FOUND'} loser found: ${loser ? loser.username : 'NOT FOUND'}`);

  // Награды за бота зависят от сложности
  const BOT_REWARDS = { easy: { coins: 15, wins: 1 }, medium: { coins: 30, wins: 1 }, hard: { coins: 50, wins: 1 } };
  const botReward = BOT_REWARDS[game.botDifficulty || 'easy'];
  const pvpReward = 50;
  // Честная победа — только если зомби дошли до базы (hp) или таймер (timeout)
  // Сдача (surrender) и дисконнект (disconnect) — без наград победителю
  const isHonestWin = (reason === 'hp' || reason === 'timeout');
  const isRanked = !game.isFriendly && isHonestWin;

  console.log(`   isRanked=${isRanked} isHonestWin=${isHonestWin} reason=${reason} pvpReward=${pvpReward}`);

  if (winner && isRanked) {
    if (game.isBot) {
      // Победа над ботом — монеты и победа по сложности
      if (winner.id === game.humanUserId) {
        winner.wins++;
        winner.winsToday = (winner.winsToday || 0) + 1;
        winner.coins += botReward.coins;
        console.log(`   ✅ Bot win: +${botReward.coins} coins, wins=${winner.wins}, winsToday=${winner.winsToday}`);
      }
    } else {
      winner.wins++;
      winner.winsToday = (winner.winsToday || 0) + 1;
      winner.coins += pvpReward;
      console.log(`   ✅ PvP win: +${pvpReward} coins, wins=${winner.wins}, winsToday=${winner.winsToday}`);
    }
  } else {
    console.log(`   ❌ No reward: winner=${!!winner} isRanked=${isRanked} reason=${reason}`);
  }
  // Поражение засчитывается только при честной игре
  if (loser && isRanked && !game.isBot) { loser.losses++; }

  // Проверяем награды за уровень для победителя
  let levelUpRewards = [];
  if (winner && isRanked) {
    const oldLevel = calcLevel(winner.wins - 1).level;
    const newLevel = calcLevel(winner.wins).level;
    console.log(`   Level check: oldLevel=${oldLevel} newLevel=${newLevel}`);
    if (newLevel > oldLevel) {
      levelUpRewards = grantLevelRewards(winner, newLevel);
      console.log(`   🎉 Level up! Rewards: ${JSON.stringify(levelUpRewards)}`);
    }
  }

  const reward = game.isBot ? botReward.coins : pvpReward;

  // Обновляем события (все честные победы, включая ботов)
  if (!game.isFriendly) {
    const events = db.events || [];
    for (const event of events) {
      if (!event.active || event.completed) continue;
      event.currentWins = (event.currentWins || 0) + 1;
      if (event.currentWins >= event.targetWins) {
        event.completed = true;
        event.active = false;
        // Выдаём награду всем игрокам у кого есть хотя бы 1 победа
        for (const u of db.users) {
          if (u.wins > 0 && !event.participants.includes(u.id)) {
            u.coins += event.reward;
            event.participants.push(u.id);
          }
        }
        io.emit('event_completed', { event, reward: event.reward });
        console.log(`🎉 Событие "${event.name}" завершено! Награда выдана.`);
      }
    }
    db.events = events;
  }

  saveDB(db);

  // Отправляем level_up победителю если он поднял уровень
  if (levelUpRewards.length > 0 && winner) {
    const winnerSocketId = winnerRole === 'plant' ? game.plantPlayer.socketId : game.zombiePlayer.socketId;
    const winnerSocket = io.sockets.sockets.get(winnerSocketId);
    const newLvl = calcLevel(winner.wins).level;
    if (winnerSocket) {
      winnerSocket.emit('level_up', {
        newLevel: newLvl,
        rewards: levelUpRewards
      });
    }
  }

  io.to(gameId).emit('game_over', {
    winner: winnerRole,
    reason,
    reward: isRanked ? reward : 0,
    isFriendly: !!game.isFriendly,
    isBot: !!game.isBot,
    levelUpRewards,
    plantPlayer: game.plantPlayer.username,
    zombiePlayer: game.zombiePlayer.username
  });

  setTimeout(() => {
    delete activeGames[gameId];
  }, 5000);
}

// ==================== GAME TICK ====================
setInterval(() => {
  for (const gameId in activeGames) {
    const game = activeGames[gameId];
    if (game.phase !== 'playing') continue;

    game.tick++;

    // Генерация ресурсов
    if (game.tick % 5 === 0) {
      game.plantSun = Math.min(game.plantSun + 25, 500);
      game.zombieBrains = Math.min(game.zombieBrains + 20, 500);

      // Подсолнухи дают дополнительное солнце
      for (const key in game.grid) {
        if (game.grid[key].type === 'sunflower') {
          game.plantSun = Math.min(game.plantSun + 10, 500);
        }
      }
    }

    // Движение зомби
    if (game.tick % 3 === 0) {
      for (const zombie of game.zombies) {
        zombie.col -= zombie.speed;

        // Проверка столкновения с растениями
        const cellKey = `${Math.floor(zombie.col)}_${zombie.lane}`;
        if (game.grid[cellKey]) {
          const plant = game.grid[cellKey];
          plant.hp--;
          if (plant.hp <= 0) {
            delete game.grid[cellKey];
          }
          zombie.col = Math.floor(zombie.col) + 0.5; // Стоп перед растением
        }

        // Зомби дошёл до конца
        if (zombie.col <= 0) {
          game.plantHP -= 20;
          zombie.col = -1; // Помечаем для удаления
        }
      }

      // Удаляем зомби дошедших до конца
      game.zombies = game.zombies.filter(z => z.col > 0);

      // Стрельба растений
      for (const key in game.grid) {
        const plant = game.grid[key];
        if (plant.type === 'peashooter' || plant.type === 'snowpea') {
          // Ищем зомби в той же линии
          const zombiesInLane = game.zombies.filter(z => z.lane === plant.row && z.col > plant.col);
          if (zombiesInLane.length > 0) {
            const target = zombiesInLane.reduce((a, b) => a.col < b.col ? a : b);
            target.hp -= 1;
            if (plant.type === 'snowpea') target.speed = Math.max(0.3, target.speed * 0.8);
            if (target.hp <= 0) {
              game.zombies = game.zombies.filter(z => z.id !== target.id);
            }
          }
        }

        // Вишнёвая бомба - взрывается сразу
        if (plant.type === 'cherrybomb') {
          const nearbyZombies = game.zombies.filter(z =>
            Math.abs(z.col - plant.col) <= 1.5 && Math.abs(z.lane - plant.row) <= 1
          );
          for (const z of nearbyZombies) {
            z.hp -= 10;
          }
          game.zombies = game.zombies.filter(z => z.hp > 0);
          delete game.grid[key];
        }
      }

      // Проверка победы/поражения
      if (game.plantHP <= 0) {
        endGame(gameId, 'zombie', 'hp');
        continue;
      }

    // Таймер 3 минуты — если растения продержались, они побеждают
    const elapsed = Date.now() - game.startTime;
    if (elapsed >= 3 * 60 * 1000) {
      endGame(gameId, 'plant', 'timeout');
      continue;
    }
    }

    // Логика бота
    if (game.isBot && game.tick % 8 === 0) {
      runBotLogic(game);
    }

    // Отправляем обновление каждые 2 тика
    if (game.tick % 2 === 0) {
      io.to(gameId).emit('game_update', getFullGameState(game));
    }
  }
}, 1000);

// ==================== BOT LOGIC ====================
function runBotLogic(game) {
  const diff = game.botDifficulty || 'easy';
  const interval = diff === 'hard' ? 1 : diff === 'medium' ? 2 : 4;
  if (game.tick % (8 * interval) !== 0) return;

  if (game.botRole === 'zombie') {
    // Бот играет за зомби
    if (game.zombieBrains >= 50) {
      const types = diff === 'hard' ? ['cone', 'bucket', 'football'] : diff === 'medium' ? ['basic', 'cone'] : ['basic'];
      const type = types[Math.floor(Math.random() * types.length)];
      const cost = getZombieCost(type);
      if (game.zombieBrains >= cost) {
        game.zombieBrains -= cost;
        // Выбираем линию с наименьшим количеством растений
        const laneCounts = [0, 1, 2, 3, 4].map(lane => {
          return Object.values(game.grid).filter(p => p.row === lane).length;
        });
        const minLane = laneCounts.indexOf(Math.min(...laneCounts));
        game.zombies.push({
          id: uuidv4(), type, hp: getZombieHP(type), maxHp: getZombieHP(type),
          lane: minLane, col: 8.5, speed: getZombieSpeed(type)
        });
      }
    }
  } else {
    // Бот играет за растения
    if (game.plantSun >= 50) {
      const types = diff === 'hard' ? ['peashooter', 'sunflower', 'wallnut', 'snowpea'] : diff === 'medium' ? ['peashooter', 'sunflower', 'wallnut'] : ['peashooter', 'sunflower'];
      const type = types[Math.floor(Math.random() * types.length)];
      const cost = getPlantCost(type);
      if (game.plantSun >= cost) {
        // Ищем свободную клетку
        for (let col = 1; col <= 5; col++) {
          for (let row = 0; row < 5; row++) {
            const key = `${col}_${row}`;
            if (!game.grid[key]) {
              game.plantSun -= cost;
              game.grid[key] = { type, hp: getPlantHP(type), col, row };
              return;
            }
          }
        }
      }
    }
  }
}

// ==================== AUTO-CREATE RELEASE EVENT ====================
(function ensureReleaseEvent() {
  const d = loadDB();
  if (!d.events) d.events = [];
  const exists = d.events.find(e => e.name && e.name.includes('Релиз'));
  if (!exists) {
    // Создаём событие с фиксированным endsAt — 7 дней с момента первого создания
    const endsAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    d.events.push({
      id: 'release_event_2024',
      name: '🚀 Релиз игры',
      description: 'Отмечаем запуск! Любая PvP победа засчитывается!',
      targetWins: 100,
      reward: 500,
      currentWins: 0,
      active: true,
      completed: false,
      participants: [],
      endsAt,
      createdAt: new Date().toISOString()
    });
    saveDB(d);
    console.log('🎉 Событие "Релиз игры" создано! Заканчивается: ' + new Date(endsAt).toLocaleString());
  } else if (!exists.endsAt) {
    // Событие уже есть, но без endsAt (старая версия) — добавляем
    exists.endsAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    saveDB(d);
    console.log('🔧 Добавлен endsAt к существующему событию: ' + new Date(exists.endsAt).toLocaleString());
  } else {
    console.log('✅ Событие "Релиз игры" активно. Заканчивается: ' + new Date(exists.endsAt).toLocaleString());
  }
})();

// ==================== START ====================
const os = require('os');
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal && iface.address.startsWith('192.168.')) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

server.listen(PORT, '0.0.0.0', () => {
  const localIP = getLocalIP();
  console.log(`🌱 Сервер запущен!`);
  console.log(`💻 На этом компьютере: http://localhost:${PORT}`);
  console.log(`📱 С телефона (та же сеть Wi-Fi): http://${localIP}:${PORT}`);
  console.log(`📊 База данных: ${DB_FILE}`);
});
