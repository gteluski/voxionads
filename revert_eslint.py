import os

directory = "src"
bad_string = "// eslint-disable-next-line @next/next/no-img-element"
bad_string2 = "{/* eslint-disable-next-line @next/next/no-img-element */}"

def process_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    new_content = content.replace(bad_string, "").replace(bad_string2, "")
    
    # Also remove any empty lines that might have been left
    lines = new_content.split('\n')
    cleaned_lines = []
    for line in lines:
        if line.strip() == "" and len(cleaned_lines) > 0 and cleaned_lines[-1].strip() == "":
             continue # skip double empty lines
        cleaned_lines.append(line)

    if content != new_content:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Reverted in: {filepath}")

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith(".tsx") or file.endswith(".ts"):
            process_file(os.path.join(root, file))

print("Revert applied!")
