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


# Hebrew for strings the Hamania UI shows that upstream leaves untranslated or that Hamania added.
# The build's `lingui extract` keeps a msgstr whose msgid is still used in the source.
HE_EXTRA = {
    "Search": "חיפוש",
    "Open the page list": "פתיחת רשימת העמודים",
}


def lingui_id(message):
    import base64
    import hashlib

    return base64.b64encode(hashlib.sha256((message + "\x1f").encode()).digest()).decode()[:6]


def add_hebrew(text):
    for msgid, msgstr in HE_EXTRA.items():
        entry = f'msgid "{msgid}"\nmsgstr ""\n'
        if entry in text:
            text = text.replace(entry, f'msgid "{msgid}"\nmsgstr "{msgstr}"\n')
        elif f'msgid "{msgid}"\n' not in text:
            text = text.rstrip("\n") + f'\n\n#. js-lingui-id: {lingui_id(msgid)}\nmsgid "{msgid}"\nmsgstr "{msgstr}"\n'
    return text


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
    if name == "he-IL.po":
        text = add_hebrew(text)
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
