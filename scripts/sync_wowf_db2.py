#!/usr/bin/env python3
"""sync_wowf_db2.py — تبدیل جداول db2 وکو (wago.tools) برای build wowf 1.60.1.70630
به JSON ساختاریافته + مقایسه با دادهٔ پارس‌شدهٔ وکی (abilities-parsed.json).
منابع CSV (همه با build=1.60.1.70630):
  Spell.csv, SpellName.csv, Talent.csv, TalentTab.csv,
  SkillLine.csv, SkillLineAbility.csv, ChrClasses.csv
خروجی (workspace/forever/data/):
  db2-talents-wowf.json   — درخت تلنت ماشینی ۹ کلاس × ۲۷ تب (رنک‌ها با نام+توضیح)
  db2-abilities-wowf.json — فهرست اسپل کلاسی از SkillLineAbility
  db2-vs-wiki.json        — گزارش تطبیق نام‌ها با پارس وکی
"""
import csv, json, re, os
from collections import defaultdict
from datetime import datetime, timezone

DATA = '/home/z/my-project/agent-hub/workspace/forever/data'
BUILD = '1.60.1.70630'
NOW = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')

# TalentTab ID blocks (کلاسیک؛ در dump هم ترتیب همین است) — مستند در meta.method
TAB_CLASS = {}
_blocks = [(41, 61, 81, 'mage'), (161, 163, 164, 'warrior'), (181, 182, 183, 'rogue'),
           (201, 202, 203, 'priest'), (261, 262, 263, 'shaman'), (281, 282, 283, 'druid'),
           (301, 302, 303, 'warlock'), (361, 362, 363, 'hunter'), (381, 382, 383, 'paladin')]
for _b in _blocks:
    for _i in _b[:3]:
        TAB_CLASS[_i] = _b[3]


def load(name):
    with open(os.path.join(DATA, name), encoding='utf-8') as f:
        return list(csv.DictReader(f))


def norm(s):
    s = re.sub(r'\s*\((?:[^()]*(?:talent|ability|spell|racial)[^()]*)\)\s*$', '', s or '', flags=re.I)
    s = re.sub(r'[^a-z0-9 ]', '', s.lower())
    return re.sub(r'\s+', ' ', s).strip()


def main():
    spell_name, spell_desc = {}, {}
    for r in load('spellname-wowf.csv'):
        spell_name[r['ID']] = r['Name_lang']
    for r in load('spell-wowf.csv'):
        if r['Description_lang']:
            spell_desc[r['ID']] = r['Description_lang']
    tabs = {}
    for r in load('TalentTab.csv'):
        tabs[int(r['ID'])] = r['Name_lang']
    classes = load('ChrClasses.csv')

    # ---------- درخت تلنت ----------
    tree = {}
    for r in load('Talent.csv'):
        tab = int(r['TabID'])
        ranks = []
        for i in range(9):
            sid = r.get(f'SpellRank_{i}', '0')
            if sid and sid != '0':
                ranks.append({'spell_id': int(sid), 'name': spell_name.get(sid),
                              'desc': spell_desc.get(sid)})
        t = {'id': int(r['ID']), 'tier': int(r['TierID']), 'col': int(r['ColumnIndex']),
             'ranks': ranks, 'max_rank': len(ranks)}
        prereqs = []
        for i in range(3):
            pid = r.get(f'PrereqTalent_{i}', '0')
            if pid and pid != '0':
                prereqs.append({'talent_id': int(pid), 'rank': int(r.get(f'PrereqRank_{i}') or 0)})
        if prereqs:
            t['prereq'] = prereqs
        tree.setdefault(tab, []).append(t)

    talents_out = {'meta': {
        'source': f'https://wago.tools/db2/Talent/csv?build={BUILD} (+TalentTab/Spell/SpellName)',
        'build': BUILD, 'fetched_at': NOW,
        'method': 'رنک‌های SpellRank_0..8 = SpellID هر رنک؛ نام از SpellName؛ توضیح از Spell.csv؛ '
                  'کلاس هر تب از بلوک‌های ID کلاسیک TalentTab (۴۱-۸۱ مافِ ۱۶۱-۱۶۴ جنگاور … ۳۸۱-۳۸۳ پالاتن) — با جدول وکی تطبیق شد',
        'counts': {'tabs': len(tabs), 'talents': sum(len(v) for v in tree.values())}},
        'classes': {}}
    for tab_id, tlist in tree.items():
        cls = TAB_CLASS.get(tab_id)
        if not cls:
            continue
        tab_name = tabs.get(tab_id, f'tab{tab_id}')
        tlist.sort(key=lambda t: (t['tier'], t['col']))
        talents_out['classes'].setdefault(cls, {'trees': {}})['trees'][tab_name] = {
            'tab_id': tab_id, 'talents': tlist}

    # ---------- اسپل‌های کلاسی از SkillLineAbility (با ClassMask) ----------
    # ClassMask: بیت (classID-1) — کلاس‌های Forever: 1,2,3,4,5,7,8,9,11
    cid2name = {int(r['ID']): r['Name_lang'].lower() for r in classes}
    class_ids = sorted(cid2name)
    class_lines = {cid2name[c]: c for c in cid2name}
    abil = defaultdict(set)
    for r in load('SkillLineAbility.csv'):
        mask = int(r.get('ClassMask') or 0)
        sp = r['Spell']
        if not sp or sp == '0':
            continue
        cls_bits = [c for c in class_ids if mask & (1 << (c - 1))]
        for c in cls_bits:
            abil[c].add(int(sp))
    abilities_out = {'meta': {
        'source': f'https://wago.tools/db2/SkillLineAbility/csv?build={BUILD} (+Spell/SpellName)',
        'build': BUILD, 'fetched_at': NOW,
        'method': 'ClassMask هر ردیف → بیت (classID-1)؛ فقط اسپل‌های نام‌دار؛ شامل همهٔ اسپل‌های tag-شدهٔ کلاسی (بدون تفکیک اسپک)',
        'class_ids': {cid2name[c]: c for c in class_ids}},
        'classes': {}}
    for cls_name in sorted(class_lines):
        items = []
        for sid in sorted(abil.get(class_lines[cls_name], set())):
            nm = spell_name.get(str(sid))
            if not nm:
                continue
            items.append({'spell_id': sid, 'name': nm,
                          'desc': spell_desc.get(str(sid))})
        abilities_out['classes'][cls_name] = {'spells': items}

    # ---------- مقایسه با وکی ----------
    wiki = json.load(open(os.path.join(DATA, 'abilities-parsed.json'), encoding='utf-8'))
    db2_t_names = defaultdict(set)   # class -> norm(name)
    for cls, c in talents_out['classes'].items():
        for tab in c['trees'].values():
            for t in tab['talents']:
                if t['ranks'] and t['ranks'][0]['name']:
                    db2_t_names[cls].add(norm(t['ranks'][0]['name']))
    db2_a_names = defaultdict(set)
    for cls, c in abilities_out['classes'].items():
        for s in c['spells']:
            db2_a_names[cls].add(norm(s['name']))

    report = {'meta': {'fetched_at': NOW, 'build': BUILD,
                       'note': 'norm = حذف پسوند (… talent) و نشانه‌گذاری؛ تطبیق رتبهٔ ۱ تلنت با ردیف وکی'},
              'talents': {}, 'abilities': {}}
    wt_all, wa_all, dt_all, da_all = 0, 0, 0, 0
    for cls, c in wiki['classes'].items():
        wnames, wraw = set(), []
        for spec in c['specs'].values():
            for t in spec.get('talents', []):
                wraw.append(t['name'])
                wnames.add(norm(t['name']))
        a_raw, anames = [], set()
        for spec in c['specs'].values():
            for a in spec.get('abilities', []):
                a_raw.append(a['name'])
                anames.add(norm(a['name']))
        db2t, db2a = db2_t_names.get(cls, set()), db2_a_names.get(cls, set())
        report['talents'][cls] = {
            'wiki_count': len(wnames), 'db2_count': len(db2t),
            'matched': len(wnames & db2t),
            'wiki_only': sorted(wraw and [x for x in wnames - db2t]) or [],
            'db2_only': sorted(db2t - wnames)}
        report['abilities'][cls] = {
            'wiki_count': len(anames), 'db2_count': len(db2a),
            'matched': len(anames & db2a),
            'wiki_only': sorted(anames - db2a),
            'db2_only': sorted(db2a - anames)}
        wt_all += len(wnames); wa_all += len(anames)
        dt_all += len(db2t); da_all += len(db2a)

    with open(os.path.join(DATA, 'db2-talents-wowf.json'), 'w', encoding='utf-8') as f:
        json.dump(talents_out, f, ensure_ascii=False, indent=1)
    with open(os.path.join(DATA, 'db2-abilities-wowf.json'), 'w', encoding='utf-8') as f:
        json.dump(abilities_out, f, ensure_ascii=False, indent=1)
    with open(os.path.join(DATA, 'db2-vs-wiki.json'), 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=1)

    print('talent rows:', sum(len(v) for v in tree.values()), 'tabs:', len(tabs))
    print('named class spells:', sum(len(c["spells"]) for c in abilities_out["classes"].values()))
    print('talent match: wiki', wt_all, 'db2', dt_all, 'matched', sum(r['matched'] for r in report['talents'].values()))
    print('ability match: wiki', wa_all, 'db2', da_all, 'matched', sum(r['matched'] for r in report['abilities'].values()))
    for cls, r in report['talents'].items():
        print(f"  {cls:9s} T {r['wiki_count']}/{r['db2_count']} m={r['matched']} | A {report['abilities'][cls]['wiki_count']}/{report['abilities'][cls]['db2_count']} m={report['abilities'][cls]['matched']}")


if __name__ == '__main__':
    main()
