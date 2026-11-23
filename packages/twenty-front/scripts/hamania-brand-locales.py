"""Hamania white-label: rename the product in the user-visible translations (msgstr only).

Hebrew only: the build's `lingui extract --overwrite` resets en.po, so other locales are renamed at
runtime by src/hamania/hamaniaBrandMessages.ts. msgid lines are untouched.
Re-runnable: strings already renamed are left as they are.
"""
import re
import sys
from pathlib import Path

LOCALES = Path(__file__).resolve().parent.parent / "src" / "locales"

HE = [
    # Hebrew prefixes: ב/ו/ש attach to ה-, ל drops into "למערכת", מ keeps the ה.
    ("ברוכים הבאים ל-Twenty", "ברוכים הבאים לסורק הנכסים של החמניה"),
    ("ב-Twenty", "בחמניה"),
    ("ל-Twenty", "למערכת החמניה"),
    ("מ-Twenty", "מהחמניה"),
    ("ש-Twenty", "שהחמניה"),
    ("Twenty", "החמניה"),
]


def rewrite(name, rules):
    path = LOCALES / name
    text = path.read_text(encoding="utf-8")
    changed = []

    def fix(block):
        body = block.group(0)
        new = body
        for old, rep in rules:
            new = new.replace(old, rep)
        if new != body:
            changed.append((body.strip(), new.strip()))
        return new

    # a msgstr entry: the msgstr line and its continuation lines
    text = re.sub(r'^msgstr (?:".*"\n)+', fix, text, flags=re.M)
    path.write_text(text, encoding="utf-8", newline="\n")
    return changed


if __name__ == "__main__":
    verbose = "-v" in sys.argv
    for name, rules in (("he-IL.po", HE),):
        changed = rewrite(name, rules)
        print(f"{name}: {len(changed)} strings renamed")
        if verbose:
            for old, new in changed:
                print("  -", old[:140])
                print("  +", new[:140])
