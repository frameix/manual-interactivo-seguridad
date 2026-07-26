import os
import glob

# Mapping of incorrect strings to corrected strings
replacements = {
    # AircrackSimulator.tsx
    'dark:bg-red-50 dark:bg-red-950/300 dark:hover:bg-red-400': 'dark:bg-red-600 dark:hover:bg-red-500',
    'dark:bg-indigo-50 dark:bg-indigo-950/300': 'dark:bg-indigo-600',
    # CheckpointQuiz.tsx
    'dark:bg-cyan-50 dark:bg-cyan-950/300/5': 'dark:bg-cyan-950/10',
    'dark:bg-indigo-50 dark:bg-indigo-950/300/5': 'dark:bg-indigo-950/10',
    # DictionaryGenerator.tsx & RiskMatrixCalculator.tsx
    'dark:bg-indigo-50 dark:bg-indigo-950/300 dark:hover:bg-indigo-400': 'dark:bg-indigo-600 dark:hover:bg-indigo-500',
    # DigitalSignatureLab.tsx
    'dark:bg-orange-50 dark:bg-orange-950/300/20': 'dark:bg-orange-950/30',
    # GlossaryModal.tsx
    'dark:bg-cyan-50 dark:bg-cyan-950/300/10': 'dark:bg-cyan-950/30',
    # MetasploitSimulator.tsx
    'dark:bg-zinc-50 dark:bg-zinc-950/30': 'dark:bg-zinc-950/30',
    # SetupGuideModal.tsx
    'dark:bg-emerald-50 dark:bg-emerald-950/300/5': 'dark:bg-emerald-950/30',
    # WelcomeScreen.tsx
    'dark:bg-cyan-50 dark:bg-cyan-950/300/20': 'dark:bg-cyan-950/30',
}

files = glob.glob(r'd:\UNSM CICLO 9\AUDITORIA\Manual\manual-de-seguridad-de-la-información\src\**\*.tsx', recursive=True)
count = 0

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for old, new in replacements.items():
        if old in new_content:
            new_content = new_content.replace(old, new)
            
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        count += 1
        print(f"Fixed {file_path}")

print(f"Fixed {count} files total.")
