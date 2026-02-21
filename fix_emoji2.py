
import re

# Читаем game.js
with open('public/game.js', 'r', encoding='utf-8', errors='replace') as f:
    content = f.read()

# Заменяем BUFF_TYPES эмодзи
content = re.sub(
    r"var BUFF_TYPES = \{[^}]+\};",
    """var BUFF_TYPES = {
  sun_boost:   { name: '\u0411\u0443\u0441\u0442 \u0441\u043e\u043b\u043d\u0446\u0430',   emoji: '\u2600\uFE0F', desc: '+50 \u0441\u043e\u043b\u043d\u0446\u0430 \u0441\u0440\u0430\u0437\u0443', duration: 30 },
  double_dmg:  { name: '\u0414\u0432\u043e\u0439\u043d\u043e\u0439 \u0443\u0440\u043e\u043d',    emoji: '\u2694\uFE0F', desc: 'x2 \u0443\u0440\u043e\u043d \u043f\u043e\u0442\u0435\u043d\u0446\u0438\u0430\u043b', duration: 20 },
  shield:      { name: '\u0429\u0438\u0442 \u0437\u0430\u0449\u0438\u0442\u044b',        emoji: '\U0001F6E1\uFE0F', desc: '\u0417\u0430\u0449\u0438\u0442\u0430 \u0440\u0430\u0441\u0442\u0435\u043d\u0438\u0439 15\u0441', duration: 15 },
  brain_boost: { name: '\u0411\u0443\u0441\u0442 \u043c\u043e\u0437\u0433\u043e\u0432',  emoji: '\U0001F9E0', desc: '+40 \u043c\u043e\u0437\u0433\u043e\u0432 \u0441\u0440\u0430\u0437\u0443', duration: 30 },
  speed_boost: { name: '\u0423\u0441\u043a\u043e\u0440\u0435\u043d\u0438\u0435',       emoji: '\u26A1', desc: '\u0417\u043e\u043c\u0431\u0438 \u0431\u044b\u0441\u0442\u0440\u0435\u0435', duration: 20 },
  horde:       { name: '\u041e\u0440\u0434\u0430',            emoji: '\U0001F9DF', desc: '\u041d\u0430\u0441\u043b\u0430\u0442\u044c \u0437\u043e\u043c\u0431\u0438', duration: 10 }
};""",
    content
)

with open('public/game.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('BUFF_TYPES updated!')

# Теперь обновим game.html - панель растений
with open('public/game.html', 'r', encoding='utf-8', errors='replace') as f:
    html = f.read()

# Заменяем эмодзи растений в HTML панели
replacements = [
    # Растения
    ("'peashooter'", "peashooter_marker"),
    ("'sunflower'", "sunflower_marker"),
]

# Найдём секцию с растениями в HTML
print('game.html length:', len(html))

# Ищем паттерн кнопок растений
plant_section = re.search(r'peashooter|sunflower|wallnut', html)
if plant_section:
    print(f'Found plants at pos {plant_section.start()}')
    print(repr(html[plant_section.start()-50:plant_section.start()+200]))
else:
    print('Plants not found in HTML')

with open('public/game.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Done!')
