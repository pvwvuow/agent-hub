#!/usr/bin/env python3
"""parse_wiki_only.py — واکشی ۳۷ صفحهٔ فقط-ویکی از Category:Forever abilities
(بر اساس abilities-crosscheck.json) با MediaWiki API action=parse
خروجی: workspace/forever/data/wiki-only-parsed.json
"""
import json, re, time, urllib.parse, urllib.request, os
from datetime import datetime, timezone

DATA = '/home/z/my-project/agent-hub/workspace/forever/data'
API = 'https://warcraft.wiki.gg/api.php'
NOW = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')

def fetch_wikitext(title):
    params = urllib.parse.urlencode({
        'action': 'parse', 'page': title, 'prop': 'wikitext',
        'format': 'json', 'redirects': 1})
    req = urllib.request.Request(f'{API}?{params}', headers={'User-Agent': 'wowfarsi-data-bot/1.0'})
    with urllib.request.urlopen(req, timeout=25) as r:
        d = json.load(r)
    if 'error' in d:
        return None, d['error'].get('info', 'error')
    return d['parse'].get('wikitext', {}).get('*', ''), None

def clean(wt):
    """خلاصهٔ خوانا از ویکیتکست: حذف جدول‌ها/قالب‌های سنگین، نگه‌داشتن خطوط معنادار اول"""
    wt = re.sub(r'<ref[^>]*>.*?</ref>|<ref[^/>]*/>', '', wt, flags=re.S)
    wt = re.sub(r'\{\{(?:distinguish|about|for|see also)\|[^}]*\}\}', '', wt, flags=re.I)
    # اطلاعات کلیدی قالب‌ها
    inf = {}
    for key in ('classes?', 'spec(?:ialization)?s?', 'race(?:s)?', 'level', 'type', 'school', 'range', 'cost', 'cooldown'):
        m = re.search(rf'\|\s*{key}\s*=\s*([^\n|}}]+)', wt, flags=re.I)
        if m:
            v = m.group(1).strip()
            if v and v.lower() != 'none':
                inf[key.split('[')[0].rstrip('?s')] = v[:60]
    # متن توصیفی: خطوط بیرون از جدول/قالب
    body = re.sub(r'\{\{[^{}]*\}\}', '', wt)          # قالب‌های تکی
    body = re.sub(r'\{\|.*?\|\}', '', body, flags=re.S)  # جدول‌ها
    body = re.sub(r'<[^>]+>', '', body)
    lines = [l.strip() for l in body.split('\n')]
    lines = [re.sub(r"'''?", '', l) for l in lines if 25 < len(l) < 400 and not l.startswith(('|', '!', '{', '}', '#', '*', ':', '=='))]
    return inf, lines[:3]

def main():
    cross = json.load(open(os.path.join(DATA, 'abilities-crosscheck.json'), encoding='utf-8'))
    only = cross['wiki_only']
    out = {'meta': {
        'source': 'warcraft.wiki.gg api.php?action=parse (per page, redirects=1)',
        'fetched_at': NOW, 'count': len(only),
        'note': 'صفحات خارج از جدول کلاس‌ها: racial/legacy talent/pet/proc — از crosscheck وکی'},
        'pages': []}
    errors = []
    for name in only:
        wt, err = fetch_wikitext(name)
        rec = {'page': name}
        if err or wt is None:
            rec['error'] = err or 'empty'
            errors.append(name)
        else:
            inf, summary = clean(wt)
            rec['infobox'] = inf
            rec['summary'] = summary
            rec['wt_len'] = len(wt)
        out['pages'].append(rec)
        time.sleep(0.25)
    with open(os.path.join(DATA, 'wiki-only-parsed.json'), 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print('pages:', len(out['pages']), '| errors:', len(errors), errors)
    for p in out['pages'][:5]:
        print('-', p['page'], '|', p.get('infobox', {}), '|', (p.get('summary') or [''])[0][:90])

if __name__ == '__main__':
    main()
