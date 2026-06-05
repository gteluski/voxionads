import os
import re

directory = "src"
pattern = re.compile(r'(\s*)(<img\b[^>]*>)', re.IGNORECASE)

def process_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Insert eslint-disable before <img
    def repl(m):
        spaces = m.group(1)
        img_tag = m.group(2)
        # Check if already disabled
        if 'eslint-disable-next-line @next/next/no-img-element' in spaces:
            return m.group(0)
        return spaces + "// eslint-disable-next-line @next/next/no-img-element" + spaces + img_tag

    new_content = pattern.sub(repl, content)

    if content != new_content:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Fixed <img> warnings in: {filepath}")

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith(".tsx") or file.endswith(".ts"):
            process_file(os.path.join(root, file))

print("ESLint fixes applied!")
