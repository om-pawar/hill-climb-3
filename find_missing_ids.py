import re, glob

with open('g:/DESKTOP/trial/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html_ids = set(re.findall(r'id=["\']([^"\']+)["\']', html))
print(f"Total HTML IDs found: {len(html_ids)}")

for js_file in sorted(glob.glob('g:/DESKTOP/trial/js/*.js')):
    with open(js_file, 'r', encoding='utf-8') as f:
        content = f.read()
    js_ids = re.findall(r'getElementById\(["\']([^"\']+)["\']\)', content)
    missing = []
    for jid in js_ids:
        # Ignore dynamic IDs like level-stat, bar-stat, btn-upgrade-stat
        if jid not in html_ids and not any(jid.startswith(prefix) for prefix in ['level-', 'bar-', 'btn-upgrade-']):
            missing.append(jid)
    if missing:
        print(f"\nMissing IDs in {js_file}:")
        for m in missing:
            print(f"  - {m}")
