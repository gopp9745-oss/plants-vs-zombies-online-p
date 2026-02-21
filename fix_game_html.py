
with open('public/game.html', 'r', encoding='utf-8', errors='replace') as f:
    html = f.read()

# Заменяем эмодзи в панели растений
# Горошина: зелёный круг 🟢
# Подсолнух: 🌻
# Орех: 🛡️
# Вишня-бомба: 💣
# Снежный горох: ❄️
# Огненный цветок: 🔥
# Кактус: ⚡

# Заменяем карточки растений
import re

# Панель растений - заменяем card-emoji
html = re.sub(
    r'(<div class="plant-card" onclick="selectPlant\(\'peashooter\'\)"[^>]*>.*?<div class="card-emoji">)[^<]*(</div>)',
    r'\g<1>\U0001F7E2\g<2>',
    html, flags=re.DOTALL
)
html = re.sub(
    r'(<div class="plant-card" onclick="selectPlant\(\'sunflower\'\)"[^>]*>.*?<div class="card-emoji">)[^<]*(</div>)',
    r'\g<1>\U0001F33B\g<2>',
    html, flags=re.DOTALL
)
html = re.sub(
    r'(<div class="plant-card" onclick="selectPlant\(\'wallnut\'\)"[^>]*>.*?<div class="card-emoji">)[^<]*(</div>)',
    r'\g<1>\U0001F6E1\uFE0F\g<2>',
    html, flags=re.DOTALL
)
html = re.sub(
    r'(<div class="plant-card" onclick="selectPlant\(\'cherrybomb\'\)"[^>]*>.*?<div class="card-emoji">)[^<]*(</div>)',
    r'\g<1>\U0001F4A3\g<2>',
    html, flags=re.DOTALL
)
html = re.sub(
    r'(<div class="plant-card" onclick="selectPlant\(\'snowpea\'\)"[^>]*>.*?<div class="card-emoji">)[^<]*(</div>)',
    r'\g<1>\u2744\uFE0F\g<2>',
    html, flags=re.DOTALL
)

# Зомби карточки
html = re.sub(
    r'(<div class="zombie-card" onclick="selectZombie\(\'basic\'\)"[^>]*>.*?<div class="card-emoji">)[^<]*(</div>)',
    r'\g<1>\U0001F480\g<2>',
    html, flags=re.DOTALL
)
html = re.sub(
    r'(<div class="zombie-card" onclick="selectZombie\(\'cone\'\)"[^>]*>.*?<div class="card-emoji">)[^<]*(</div>)',
    r'\g<1>\U0001F9DF\g<2>',
    html, flags=re.DOTALL
)
html = re.sub(
    r'(<div class="zombie-card" onclick="selectZombie\(\'bucket\'\)"[^>]*>.*?<div class="card-emoji">)[^<]*(</div>)',
    r'\g<1>\U0001F9DF\u200D\u2642\uFE0F\g<2>',
    html, flags=re.DOTALL
)
html = re.sub(
    r'(<div class="zombie-card" onclick="selectZombie\(\'football\'\)"[^>]*>.*?<div class="card-emoji">)[^<]*(</div>)',
    r'\g<1>\U0001F3C3\g<2>',
    html, flags=re.DOTALL
)

# Заголовки панелей
html = html.replace(
    '<div class="panel-title">?? \u0440\u043e\u043b\u0435\u0439 \u0440\u0430\u0441\u0442\u0435\u043d\u0438\u0439</div>',
    '<div class="panel-title">\U0001F331 \u0412\u044b\u0431\u0435\u0440\u0438 \u0440\u0430\u0441\u0442\u0435\u043d\u0438\u0435</div>'
)

# Ищем все ?? в panel-title и card-cost и заменяем
# Солнце в стоимости растений
html = html.replace('<div class="card-cost">?? 100</div>', '<div class="card-cost">\u2600\uFE0F 100</div>')
html = html.replace('<div class="card-cost">?? 50</div>', '<div class="card-cost">\u2600\uFE0F 50</div>')
html = html.replace('<div class="card-cost">?? 150</div>', '<div class="card-cost">\u2600\uFE0F 150</div>')
html = html.replace('<div class="card-cost">?? 175</div>', '<div class="card-cost">\u2600\uFE0F 175</div>')
html = html.replace('<div class="card-cost">?? 75</div>', '<div class="card-cost">\U0001F9E0 75</div>')
html = html.replace('<div class="card-cost">?? 125</div>', '<div class="card-cost">\U0001F9E0 125</div>')

with open('public/game.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('game.html updated!')
