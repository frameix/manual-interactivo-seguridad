import os

file_path = r'd:\UNSM CICLO 9\AUDITORIA\Manual\manual-de-seguridad-de-la-información\src\components\TeacherAdminPanel.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    # Modal Outline
    'border-neutral-200 dark:border-neutral-800 rounded-3xl': 'border-neutral-300 dark:border-neutral-800 rounded-3xl',
    # Header Bottom Border
    'border-b border-neutral-200 dark:border-neutral-800/40': 'border-b border-neutral-300 dark:border-neutral-800/40',
    # Tabs Top Border
    'border-t border-neutral-200 dark:border-neutral-800/40': 'border-t border-neutral-300 dark:border-neutral-800/40',
    # Cyan Text
    'text-cyan-300 leading-relaxed': 'text-cyan-800 dark:text-cyan-300 leading-relaxed',
    # Buttons
    'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-400 border border-emerald-400 dark:border-emerald-900/40 rounded hover:bg-emerald-50': 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-400 dark:border-emerald-900/40 rounded hover:bg-emerald-100',
    'bg-red-50 dark:bg-red-950/30 text-red-400 border border-red-400 dark:border-red-900/40 rounded hover:bg-red-50': 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-400 dark:border-red-900/40 rounded hover:bg-red-100',
    # List Items
    'bg-neutral-100 dark:bg-[#0a0a0a] border-neutral-200 dark:border-neutral-800': 'bg-white dark:bg-[#0a0a0a] border-neutral-300 dark:border-neutral-800 shadow-sm dark:shadow-none',
    # Icon Box
    'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-200': 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border-indigo-300',
    'bg-neutral-200 dark:bg-neutral-900 text-neutral-500 dark:text-zinc-500 border-neutral-300': 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-zinc-500 border-neutral-300',
    # Total Grades Badge
    'bg-neutral-200 dark:bg-zinc-900 px-3 py-1 rounded-full border border-neutral-300 dark:border-zinc-800': 'bg-white dark:bg-zinc-900 px-3 py-1 rounded-full border border-neutral-300 dark:border-zinc-800 shadow-sm dark:shadow-none',
    # Search Bar
    'bg-white dark:bg-[#18181b] border border-neutral-300 dark:border-neutral-800 rounded-xl py-2 pl-10 pr-4': 'bg-white dark:bg-[#18181b] border border-neutral-300 dark:border-neutral-800 rounded-xl py-2 pl-10 pr-4 shadow-sm dark:shadow-none',
    # Empty State
    'bg-white dark:bg-neutral-950/30 rounded-2xl border border-neutral-300 dark:border-neutral-800 border-dashed': 'bg-neutral-50 dark:bg-neutral-950/30 rounded-2xl border border-neutral-300 dark:border-neutral-800 border-dashed',
    # Grade Item
    'bg-white dark:bg-[#121214] border border-neutral-200 dark:border-neutral-800 rounded-xl hover:border-neutral-300': 'bg-white dark:bg-[#121214] border border-neutral-300 dark:border-neutral-800 rounded-xl hover:border-neutral-400 shadow-sm dark:shadow-none',
    # Clase Tag
    'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-zinc-400 px-2 py-0.5 rounded font-mono border border-neutral-200': 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-zinc-400 px-2 py-0.5 rounded font-mono border border-neutral-300',
    # History Divider
    'border-t border-neutral-200 dark:border-neutral-800/40': 'border-t border-neutral-300 dark:border-neutral-800/40',
    # Confirm Modal
    'border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl': 'border-neutral-300 dark:border-neutral-800 rounded-2xl shadow-2xl',
}

original_content = content
for old, new in replacements.items():
    content = content.replace(old, new)

if original_content != content:
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Modifications successfully written to file.")
else:
    print("No changes were made. Strings might not match.")
