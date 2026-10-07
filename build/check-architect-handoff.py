"""Independent Stage 1 verification; stdlib only, no importer helpers.

Usage: python build/check-architect-handoff.py <fresh-stage1-clone> <pinned-upstream-clone>
Compares NFC text after whitespace removal, ordered labels and character Counters.
This verifies digital transcription fidelity, not accuracy against printed Swete.
"""
import collections
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import unicodedata
import xml.etree.ElementTree as ET

clone, upstream = map(Path, sys.argv[1:3])
data = json.loads((clone / 'data/lxx-swete.json').read_text(encoding='utf-8'))
failures = 0

def check(name, ok, detail):
    global failures
    failures += not ok
    print(f"{'PASS' if ok else 'FAIL'} {name}: {detail}")

def tag(element):
    return element.tag.rsplit('}', 1)[-1]

def compact(value):
    return ''.join(unicodedata.normalize('NFC', value).split())

def text(element, skip_nested=False):
    parts = [element.text or '']
    for child in element:
        if tag(child) not in {'note', 'app', 'head'} and not (
            skip_nested and child.get('subtype') == 'verse'
        ) and not (child.get('subtype') == 'chapter' and child.get('n') == '151'):
            parts.append(text(child, skip_nested))
        parts.append(child.tail or '')
    return ''.join(parts)

def verses(element):
    result = []
    def walk(node):
        if tag(node) in {'note', 'app', 'head'}:
            return
        if node.get('subtype') == 'verse':
            result.append((node.get('n'), compact(text(node, True))))
        for child in node:
            walk(child)
    walk(element)
    return result

pin = '03776b39f4047c5cff06f5296fae4b2bae4b08fb'
head = subprocess.check_output(['git', '-C', str(upstream), 'rev-parse', 'HEAD'], text=True).strip()
check('upstream-pin', head == pin, head)
total = 0
hash_errors, counter_errors, label_errors, verse_errors = [], [], [], []
raw_verse_count = 0
omitted_chapters = []
for record in data['source']['files']:
    relative = record['path']
    raw = (upstream / relative).read_bytes()
    if hashlib.sha256(raw).hexdigest() != record['sha256']:
        hash_errors.append(relative)
    tree = ET.fromstring(raw)
    body = next(e for e in tree.iter() if tag(e) == 'text')
    source_text = compact(text(body))
    books = [b for b in data['books'] if b['sourceFile'] == relative]
    shipped_text = compact(''.join(s['t'] for b in books for c in b['chapters'] for s in c['segments']))
    if collections.Counter(source_text) != collections.Counter(shipped_text):
        counter_errors.append(relative)
    total += len(source_text)
    chapters = [e for e in body.iter() if e.get('subtype') == 'chapter' and e.get('n') != '151']
    raw_verse_count += len(verses(body)) - sum(len(verses(e)) for e in body.iter() if e.get('subtype') == 'chapter' and e.get('n') == '151')
    if not chapters:
        chapters = [body]
    shipped_chapters = [c for b in books for c in b['chapters']]
    expected = []
    for chapter in chapters:
        label = chapter.get('n', '1')
        own = verses(chapter)
        if not own and not compact(text(chapter)):
            omitted_chapters.append((relative, label))
            continue
        expected.append((label, own))
    actual = [(c['n'], [(s['l'], compact(s['t'])) for s in c['segments'] if s['kind'] == 'verse']) for c in shipped_chapters]
    if [(n, [v[0] for v in vs]) for n, vs in expected] != [(n, [v[0] for v in vs]) for n, vs in actual]:
        label_errors.append(relative)
    if expected != actual:
        verse_errors.append(relative)

check('files', len(data['source']['files']) == 47, len(data['source']['files']))
check('source-hashes', not hash_errors, hash_errors or '47 pinned Git blobs match')
check('character-counters', not counter_errors and total == 2754390, f'{total} characters; differences={counter_errors}')
check('ordered-labels', not label_errors, label_errors or 'all source chapter/verse labels match')
check('ordered-verse-text', not verse_errors, verse_errors or 'all verses match individually, including nested verses')
chapters = [c for b in data['books'] for c in b['chapters']]
segments = [s for c in chapters for s in c['segments']]
counts = (len(data['books']), len(chapters), sum(s['kind']=='verse' for s in segments), sum(s['kind']=='unnumbered' for s in segments), sum(bool(s.get('flags')) for s in segments if s['kind']=='verse'))
check('shipped-counts', counts == (48,1055,27048,100,686), counts)
print(f'INFO raw verse containers={raw_verse_count}; omitted empty chapters={omitted_chapters}')
by_id = {b['id']: b for b in data['books']}
def labels(book, chapter):
    return [s['l'] for c in by_id[book]['chapters'] if c['n']==chapter for s in c['segments'] if s['kind']=='verse']
check('ps88', labels('PSA','88')[-9:] == ['45','46','47','84','49','50','51','52','53'], labels('PSA','88')[-9:])
check('ps115', labels('PSA','115') == ['1','2','3','4','5','7','8','9','10'], labels('PSA','115'))
check('ps129', labels('PSA','129') == [str(i) for i in range(1,9)], labels('PSA','129'))
check('bel', labels('BEL','1')[-1]=='36' and any('37-42' in n for n in by_id['BEL']['notices']), 'ends at 36; truncation disclosed')
check('ecclesiastes', 'ECC' not in by_id and any(x['id']=='ECC' for x in data['missing']), 'absent and disclosed')
digest = hashlib.sha256((clone/'data/lxx-swete.json').read_bytes()).hexdigest()
check('shipped-hash', digest=='d31c332f69a7baec02901d6e2612795326bdcee69a74282e3065f2c5f79d75a4', digest)
sys.exit(bool(failures))
