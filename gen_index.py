
with open('public/index.html', 'r', encoding='utf-8', errors='replace') as f:
    content = f.read()

# Найдём строку с admin-btn и добавим mod-btn после неё
old = "id=\"admin-btn\""
if old in content:
    # Найдём всю строку с admin-btn
    import re
    # Добавим кнопку модератора после кнопки admin-btn
    content = re.sub(
        r'(<button[^>]*id="admin-btn"[^>]*>)[^<]*(</button>)',
        r'<button id="admin-btn" class="btn btn-purple hidden" onclick="window.location.href=\'admin.html\'">&#x1F451; Admin Panel</button>',
        content
    )
    content = content.replace(
        '<button id="admin-btn" class="btn btn-purple hidden" onclick="window.location.href=\'admin.html\'">&#x1F451; Admin Panel</button>',
        '<button id="admin-btn" class="btn btn-purple hidden" onclick="window.location.href=\'admin.html\'">&#x1F451; Admin Panel</button>\n          <button id="mod-btn" class="btn btn-warning hidden" onclick="window.location.href=\'mod.html\'">&#x1F6E1; Mod Panel</button>'
    )
    print('Added mod-btn after admin-btn')
else:
    print('admin-btn not found, trying different approach')
    # Попробуем найти по другому
    print(repr(content[content.find('admin'):content.find('admin')+200]))

with open('public/index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done!')
