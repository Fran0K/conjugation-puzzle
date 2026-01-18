from __future__ import annotations

import json
import sys
from pathlib import Path
from datetime import datetime, timezone
from typing import Any, List, Optional
from enum import Enum
import argparse


# ==================================================
# Constants (from validator.ts)
# ==================================================

PERSONS = ["je", "tu", "il", "elle", "on", "nous", "vous", "ils", "elles"]

SIMPLE_TENSES = {
    "Présent",
    "Imparfait",
    "Futur Simple",
    "Conditionnel Présent",
    "Subjonctif Présent",
    "Subjonctif Imparfait",
    "Impératif",
}

COMPOUND_TENSES = {
    "Passé Composé",
    "Plus-que-parfait",
    "Futur Antérieur",
    "Conditionnel Passé",
    "Subjonctif Passé",
}


# ==================================================
# Error model
# ==================================================

class Level(str, Enum):
    FATAL = "FATAL"
    STRONG = "STRONG"
    WARNING = "WARNING"


def fatal(path: str, message: str):
    return {
        "level": Level.FATAL.value,
        "path": path,
        "message": message,
    }


def strong(path: str, message: str):
    return {
        "level": Level.STRONG.value,
        "path": path,
        "message": message,
    }


def warning(path: str, message: str):
    return {
        "level": Level.WARNING.value,
        "path": path,
        "message": message,
    }


# ==================================================
# Helpers (required / ensureDistinct)
# ==================================================

def required(value: Any, path: str, errors: List[dict]):
    if value is None or value == "":
        errors.append(
            fatal(path, "Required field is missing")
        )


def ensure_distinct(
    correct: Optional[str],
    distractors: Optional[list],
    path: str,
    errors: List[dict],
):
    if not correct or not distractors:
        return

    if correct in distractors:
        errors.append(
            strong(
                path,
                "Correct value must not appear in distractors",
            )
        )


# ==================================================
# Puzzle validator (1:1 with validator.ts)
# ==================================================

def validate_puzzle(p: dict, index: int, errors: List[dict]):
    base_path = f"puzzles[{index}]"

    context = {
        "tense": p.get("tense"),
        "person": p.get("person"),
        "pronoun": p.get("pronoun"),
        "puzzleIndex": index,
    }

    # ---- Basic required fields ----
    required(p.get("verb"), f"{base_path}.verb", errors)
    required(p.get("tense"), f"{base_path}.tense", errors)
    required(p.get("person"), f"{base_path}.person", errors)
    required(p.get("pronoun"), f"{base_path}.pronoun", errors)

    # ---- Person validity ----
    if p.get("person") not in PERSONS:
        errors.append(
            fatal(
                f"{base_path}.person",
                f"Invalid person '{p.get('person')}', must be one of {', '.join(PERSONS)}",
            )
        )

    # ---- Tense structure ----
    tense = p.get("tense")
    is_compound = tense in COMPOUND_TENSES
    is_simple = tense in SIMPLE_TENSES

    if not is_compound and not is_simple:
        errors.append(
            fatal(
                f"{base_path}.tense",
                f"Unknown tense '{tense}'",
            )
        )

    # ---- Compound vs Simple enforcement ----
    if is_compound:
        if not p.get("auxStem"):
            errors.append(
                fatal(
                    base_path,
                    "Compound tense requires auxStem and auxEnding",
                )
            )

    if is_simple:
        if p.get("auxStem") is not None:
            errors.append(
                strong(
                    base_path,
                    "Simple tense must not include auxiliary fields",
                )
            )

    # ---- Subjonctif pronoun rule ----
    if tense and tense.startswith("Subjonctif"):
        pronoun = p.get("pronoun") or ""
        if not (pronoun.startswith("Que ") or pronoun.startswith("Qu'")):
            errors.append(
                fatal(
                    f"{base_path}.pronoun",
                    "Subjonctif must start with 'Que' or 'Qu''",
                )
            )

    # ---- J' elision rule ----
    if p.get("person") == "je":
        stem = p.get("auxStem") or p.get("correctStem") or ""
        verb_start = stem[:1].lower()
        should_elide = verb_start in "aeiouhé"

        pronoun = p.get("pronoun") or ""
        has_elided = (
            pronoun.startswith("J'")
            or pronoun.startswith("j'")
            or pronoun.startswith("Que j'")
        )

        if should_elide and not has_elided:
            errors.append({
                "level": Level.STRONG.value,
                "path": f"{base_path}.pronoun",
                "message": "Je must elide to j' before vowel or mute h",
                "context": context,
            })

        if not should_elide and has_elided:
            errors.append({
                "level": Level.STRONG.value,
                "path": f"{base_path}.pronoun",
                "message": "J' used incorrectly before consonant",
                "context": context,
            })

    # ---- Distractor integrity ----
    ensure_distinct(
        p.get("correctStem"),
        p.get("distractorStems"),
        f"{base_path}.distractorStems",
        errors,
    )

    if p.get("correctEnding") and p.get("distractorEndings"):
        ensure_distinct(
            p.get("correctEnding"),
            p.get("distractorEndings"),
            f"{base_path}.distractorEndings",
            errors,
        )

    if p.get("auxStem") and p.get("distractorAuxStems"):
        ensure_distinct(
            p.get("auxStem"),
            p.get("distractorAuxStems"),
            f"{base_path}.distractorAuxStems",
            errors,
        )

    if p.get("auxEnding") and p.get("distractorAuxEndings"):
        ensure_distinct(
            p.get("auxEnding"),
            p.get("distractorAuxEndings"),
            f"{base_path}.distractorAuxEndings",
            errors,
        )


# ==================================================
# Batch validator
# ==================================================

def validate_batch(data: dict) -> List[dict]:
    errors: List[dict] = []

    verbs = data.get("verb")
    if not isinstance(verbs, list):
        errors.append(
            fatal("verb", "Root must contain a verb array")
        )
        return errors

    for vi, verb_entry in enumerate(verbs):
        puzzles = verb_entry.get("puzzles")
        if not isinstance(puzzles, list):
            errors.append(
                fatal(
                    f"verb[{vi}].puzzles",
                    "Verb entry must contain a puzzles array",
                )
            )
            continue

        for pi, puzzle in enumerate(puzzles):
            validate_puzzle(puzzle, pi, errors)

    return errors



# ==================================================
# Report generator
# ==================================================

def generate_report(errors: List[dict]) -> dict:
    print(datetime.now(timezone.utc).isoformat())
    return {
        "meta": {
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "errorCount": len(errors),
            "fatalCount": sum(
                1 for e in errors if e["level"] == Level.FATAL.value
            ),
        },
        "errors": errors,
    }


# ==================================================
# CLI
# ==================================================

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("input", help="verb json file")
    args = parser.parse_args()

    input_path = Path(args.input)
    if not input_path.exists():
        print("Input file not found", file=sys.stderr)
        sys.exit(1)

    try:
        data = json.loads(input_path.read_text(encoding="utf-8"))
    except Exception as e:
        print(f"Invalid JSON: {e}", file=sys.stderr)
        sys.exit(1)

    errors = validate_batch(data)
    report = generate_report(errors)

    output_path = input_path.with_name(
        input_path.stem + "_report.json"
    )

    print("generating the report file")
    output_path.write_text(
        json.dumps(report, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    if any(e["level"] == Level.FATAL.value for e in errors):
        sys.exit(1)


if __name__ == "__main__":
    main()
