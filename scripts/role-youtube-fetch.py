import json, re, urllib.parse, urllib.request, time, sys

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"

src = open('src/data/roles.ts').read()
# Each role: { title: "X", slug: "y", ... }
entries = []
for m in re.finditer(r'title:\s*"([^"]+)",\s*slug:\s*"([^"]+)"', src):
    entries.append((m.group(2), m.group(1)))
print('roles:', len(entries), file=sys.stderr)

results = {}
for i,(slug,name) in enumerate(entries):
    q = f"day in the life {name} UK"
    url = f"https://www.youtube.com/results?search_query={urllib.parse.quote(q)}&sp=EgIQAQ%253D%253D"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "en-GB,en;q=0.9"})
        html = urllib.request.urlopen(req, timeout=15).read().decode('utf-8','ignore')
    except Exception as e:
        print(slug, 'ERR', e, file=sys.stderr); continue
    blocks = re.findall(
        r'"videoRenderer":\{"videoId":"([A-Za-z0-9_-]{11})".*?"title":\{"runs":\[\{"text":"([^"]+)".*?"longBylineText":\{"runs":\[\{"text":"([^"]+)"',
        html
    )
    seenv=set(); picks=[]
    for vid, title, channel in blocks:
        if vid in seenv: continue
        seenv.add(vid)
        if len(title) < 8: continue
        try:
            title_d = bytes(title,'utf-8').decode('unicode_escape')
            channel_d = bytes(channel,'utf-8').decode('unicode_escape')
        except Exception:
            title_d, channel_d = title, channel
        picks.append({"id": vid, "title": title_d, "channel": channel_d})
        if len(picks) >= 4: break
    results[slug] = picks
    print(f"[{i+1}/{len(entries)}] {slug}: {len(picks)}", file=sys.stderr)
    time.sleep(0.4)

json.dump(results, open('/tmp/yt-results.json','w'), indent=2)
print('total videos:', sum(len(v) for v in results.values()), file=sys.stderr)
