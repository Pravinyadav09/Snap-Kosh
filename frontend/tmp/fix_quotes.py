import os
import re

src_dir = r"c:\Users\HP\Desktop\DigitalErp\src"
api_lib = r"c:\Users\HP\Desktop\DigitalErp\src\lib\api.ts"

# Pattern: `${API_BASE}/something" → `${API_BASE}/something`
# The script replaces mismatched quotes in template literals

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Fix: `${API_BASE}/some/path" → `${API_BASE}/some/path`
    # Match: backtick-started template literal that ends with double-quote instead of backtick
    content = re.sub(r'`(\$\{API_BASE\}[^`"]*)"', r'`\1`', content)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

fixed_count = 0
for root, dirs, files in os.walk(src_dir):
    for fname in files:
        if fname.endswith(('.tsx', '.ts')):
            fpath = os.path.join(root, fname)
            if fpath == api_lib:
                continue
            if fix_file(fpath):
                print(f"Fixed quotes: {fname}")
                fixed_count += 1

print(f"\nTotal files fixed: {fixed_count}")

# Verify one file
test_file = r"c:\Users\HP\Desktop\DigitalErp\src\app\(dashboard)\management\processes\page.tsx"
with open(test_file, 'r', encoding='utf-8') as f:
    lines = f.readlines()
for i, line in enumerate(lines[:20], 1):
    print(f"{i}: {line}", end='')
