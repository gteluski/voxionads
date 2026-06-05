import os
import re

directory = "src"

replacements = {
    "bg-indigo-": "bg-orange-",
    "text-indigo-": "text-orange-",
    "border-indigo-": "border-orange-",
    "ring-indigo-": "ring-orange-",
    "glow-indigo": "glow-orange",
    "bg-emerald-": "bg-green-",
    "text-emerald-": "text-green-",
    "border-emerald-": "border-green-",
    "ring-emerald-": "ring-green-",
    "bg-purple-": "bg-[#9C27B0]-",
    "text-purple-": "text-[#9C27B0]-",
    "bg-violet-": "bg-orange-",
    "text-violet-": "text-orange-",
}

def process_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    original = content
    for old, new in replacements.items():
        content = content.replace(old, new)
        
    # specific hex replacements just in case
    content = content.replace("#6366F1", "#f18535")
    content = content.replace("#7C3AED", "#f18535")
    content = content.replace("#8B5CF6", "#f18535")

    if original != content:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Purged purple from: {filepath}")

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith(".tsx") or file.endswith(".ts"):
            process_file(os.path.join(root, file))

print("Purple purge complete!")
