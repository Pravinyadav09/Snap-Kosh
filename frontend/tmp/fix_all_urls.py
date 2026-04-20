import os
import re

src_dir = r"c:\Users\HP\Desktop\DigitalErp\src"
api_lib = r"c:\Users\HP\Desktop\DigitalErp\src\lib\api.ts"

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    if 'http://localhost:5145' not in content:
        return False
    
    # Add import if not present
    has_api_import = "from '@/lib/api'" in content or 'from "@/lib/api"' in content
    
    if not has_api_import:
        # Add after "use client" line
        if '"use client"' in content:
            content = content.replace(
                '"use client"',
                '"use client"\nimport { API_BASE } from \'@/lib/api\''
            )
        elif "'use client'" in content:
            content = content.replace(
                "'use client'",
                "'use client'\nimport { API_BASE } from '@/lib/api'"
            )
        else:
            # Add at top
            content = "import { API_BASE } from '@/lib/api'\n" + content
    
    # Replace all occurrences of the hardcoded URL in template literals and strings
    # Pattern 1: `http://localhost:5145/...` → `${API_BASE}/...`
    content = re.sub(r'`http://localhost:5145(/[^`]*)`', r'`${API_BASE}\1`', content)
    
    # Pattern 2: "http://localhost:5145/..." → `${API_BASE}/...`
    content = re.sub(r'"http://localhost:5145(/[^"]*)"', r'`${API_BASE}\1`', content)
    
    # Pattern 3: "http://localhost:5145" alone (base url only)
    content = content.replace('"http://localhost:5145"', '`${API_BASE}`')
    
    # Fix double-quote issue in template literals created above
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
                rel = fpath.replace(src_dir + os.sep, '')
                print(f"Fixed: {rel}")
                fixed_count += 1

print(f"\nTotal fixed: {fixed_count}")

# Final check
print("\n=== REMAINING HARDCODED ===")
for root, dirs, files in os.walk(src_dir):
    for fname in files:
        if fname.endswith(('.tsx', '.ts')):
            fpath = os.path.join(root, fname)
            if fpath == api_lib: continue
            with open(fpath, 'r', encoding='utf-8') as f:
                c = f.read()
            if 'http://localhost:5145' in c:
                count = c.count('http://localhost:5145')
                print(f"  [{count}x] {fname}")
print("=== Done ===")
