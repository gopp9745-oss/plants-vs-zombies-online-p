
# Читаем game.js
with open('public/game.js', 'r', encoding='utf-8', errors='replace') as f:
    content = f.read()

# Новые красивые эмодзи для растений
# Горошина -> зелёный шар/мишень
# Подсолнух -> подсолнух
# Орех -> щит/кокос
# Вишня-бомба -> бомба
# Снежный горох -> снежинка
# Огненный цветок -> огонь
# Кактус -> молния

old_plants = "peashooter: '??', sunflower: '??', wallnut: '??',\n  cherrybomb: '??', snowpea: '??', fireflower: '??', cactus: '??'"

new_plants = """peashooter: '\U0001F7E2', sunflower: '\U0001F33B', wallnut: '\U0001F6E1\uFE0F',
  cherrybomb: '\U0001F4A3', snowpea: '\u2744\uFE0F', fireflower: '\U0001F525', cactus: '\u26A1'"""

# Новые эмодзи для зомби
# Обычный -> череп
# Конус -> строительный конус
# Ведро -> шлем
# Футболист -> спортсмен
# Рыцарь -> рыцарь
# Гигант -> монстр

old_zombies = "basic: '??', cone: '????', bucket: '??', football: '??', knight: '??', giant: '??'"

new_zombies = """basic: '\U0001F480', cone: '\U0001F9DF', bucket: '\U0001F9DF\u200D\u2642\uFE0F', football: '\U0001F3C3', knight: '\U0001F9DF\u200D\u2640\uFE0F', giant: '\U0001F47E'"""

# Заменяем
if 'peashooter:' in content and 'sunflower:' in content:
    # Найдём строки с plantEmoji
    import re
    
    # Заменяем plantEmoji блок
    content = re.sub(
        r"var plantEmoji = \{[^}]+\};",
        "var plantEmoji = {\n  peashooter: '\U0001F7E2', sunflower: '\U0001F33B', wallnut: '\U0001F6E1\uFE0F',\n  cherrybomb: '\U0001F4A3', snowpea: '\u2744\uFE0F', fireflower: '\U0001F525', cactus: '\u26A1'\n};",
        content
    )
    
    # Заменяем zombieEmoji блок
    content = re.sub(
        r"var zombieEmoji = \{[^}]+\};",
        "var zombieEmoji = {\n  basic: '\U0001F480', cone: '\U0001F9DF', bucket: '\U0001F9DF\u200D\u2642\uFE0F', football: '\U0001F3C3', knight: '\U0001F9DF\u200D\u2640\uFE0F', giant: '\U0001F47E'\n};",
        content
    )
    
    print('Replaced emoji blocks')
else:
    print('Could not find emoji blocks')
    print(content[:500])

with open('public/game.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done!')
