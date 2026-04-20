import os
import re

src_dir = r"c:\Users\HP\Desktop\DigitalErp\src"
api_lib = r"c:\Users\HP\Desktop\DigitalErp\src\lib\api.ts"

# Check which files still have hardcoded URL
still_hard = []
for root, dirs, files in os.walk(src_dir):
    for fname in files:
        if fname.endswith(('.tsx', '.ts')):
            fpath = os.path.join(root, fname)
            if fpath == api_lib:
                continue
            with open(fpath, 'r', encoding='utf-8') as f:
                content = f.read()
            if 'http://localhost:5145' in content:
                # Count occurrences
                count = content.count('http://localhost:5145')
                rel = fpath.replace(src_dir + os.sep, '')
                still_hard.append((rel, count))

print(f"Still hardcoded ({len(still_hard)} files):")
for rel, count in still_hard:
    print(f"  [{count}x] {rel}")
