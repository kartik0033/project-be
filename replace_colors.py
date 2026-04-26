import os

target_dir = r'c:\Users\Kartik\OneDrive\Desktop\project-BE\frontend\src'

replacements = {
    '#4ade80': '#3b82f6', # primary green -> blue-500
    '#16a34a': '#1d4ed8', # dark green -> blue-700
    '#2ecc71': '#2563eb', # emerald green -> blue-600
    '#e8f8f5': '#eff6ff', # light emerald bg -> blue-50
    '#f0fdf4': '#eff6ff', # light green bg -> blue-50
    'rgba(74, 222, 128': 'rgba(59, 130, 246', # rgba #4ade80 -> rgba #3b82f6
}

updated_count = 0

for root, dirs, files in os.walk(target_dir):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.css'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = content
            for old, new in replacements.items():
                new_content = new_content.replace(old, new)
                new_content = new_content.replace(old.upper(), new.upper())
            
            if new_content != content:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {path}")
                updated_count += 1

print(f"Total files updated: {updated_count}")
