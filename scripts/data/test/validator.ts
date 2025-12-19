// validator.ts
// --------------------------------------------------
// Deterministic validator for French conjugation puzzles
// --------------------------------------------------

/* =========================
   Types
========================= */

type Batch = {
  infinitive: string;
  translations: {
    en: string;
    zh: string;
    ja: string;
  };
  puzzles: Puzzle[];
};

type Puzzle = {
  verb: string;
  tense: string;
  person: string;
  pronoun: string;
  is_regular: boolean;

  correctStem: string;
  correctEnding: string | null;
  distractorStems: string[];
  distractorEndings: string[] | null;

  auxStem: string | null;
  auxEnding: string | null;
  distractorAuxStems: string[] | null;
  distractorAuxEndings: string[] | null;

  ruleSummary: string;

  explanations: {
    en: string;
    zh: string;
    ja: string;
    fr: string;
  };
};

/* =========================
   Error Model
========================= */

export type ValidationLevel = "FATAL" | "STRONG" | "WARNING";

export type ValidationError = {
  level: ValidationLevel;
  path: string;
  message: string;

  context?: {
    infinitive?: string;
    tense?: string;
    person?: string;
    pronoun?: string;
    puzzleIndex?: number;
  };
};

/* =========================
   Rule Tables
========================= */

const PERSONS = [
  "je",
  "tu",
  "il",
  "elle",
  "nous",
  "vous",
  "ils",
  "elles",
];

const SIMPLE_TENSES = new Set([
  "Présent",
  "Imparfait",
  "Futur Simple",
  "Conditionnel Présent",
  "Subjonctif Présent",
]);

const COMPOUND_TENSES = new Set([
  "Passé Composé",
  "Plus-que-parfait",
  "Futur Antérieur",
  "Conditionnel Passé",
  "Subjonctif Passé",
]);

/* =========================
   Validator Entry
========================= */

export function validateBatch(batch: Batch): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!batch.infinitive) {
    errors.push(fatal("infinitive", "Missing infinitive"));
  }

  if (!Array.isArray(batch.puzzles)) {
    errors.push(fatal("puzzles", "Puzzles must be an array"));
    return errors;
  }

  if (batch.puzzles.length !== 80) {
    errors.push(
      fatal(
        "puzzles",
        `Expected exactly 80 puzzles (8 persons × 10 tenses), got ${batch.puzzles.length}`
      )
    );
  }

  batch.puzzles.forEach((puzzle, index) => {
    validatePuzzle(puzzle, index, errors);
  });

  return errors;
}

/* =========================
   Puzzle Validator
========================= */

function validatePuzzle(
  p: Puzzle,
  index: number,
  errors: ValidationError[]
) {
  const basePath = `puzzles[${index}]`;

  const context = {
    tense: p.tense,
    person: p.person,
    pronoun: p.pronoun,
    puzzleIndex: index,
  };

  // ---- Basic required fields ----
  required(p.verb, `${basePath}.verb`, errors);
  required(p.tense, `${basePath}.tense`, errors);
  required(p.person, `${basePath}.person`, errors);
  required(p.pronoun, `${basePath}.pronoun`, errors);

  // ---- Person validity ----
  if (!PERSONS.includes(p.person)) {
    errors.push(
      fatal(
        `${basePath}.person`,
        `Invalid person '${p.person}', must be one of ${PERSONS.join(", ")}`
      )
    );
  }

  // ---- Tense structure ----
  const isCompound = COMPOUND_TENSES.has(p.tense);
  const isSimple = SIMPLE_TENSES.has(p.tense);

  if (!isCompound && !isSimple) {
    errors.push(
      fatal(`${basePath}.tense`, `Unknown tense '${p.tense}'`)
    );
  }

  // ---- Compound vs Simple enforcement ----
  if (isCompound) {
    if (!p.auxStem) {
      errors.push(
        fatal(
          basePath,
          "Compound tense requires auxStem and auxEnding"
        )
      );
    }
  }

  if (isSimple) {
    if (p.auxStem !== null) {
      errors.push(
        strong(
          basePath,
          "Simple tense must not include auxiliary fields"
        )
      );
    }
  }

  // ---- Subjonctif pronoun rule ----
  if (p.tense.startsWith("Subjonctif")) {
    if (!/^Que\s|^Qu'/.test(p.pronoun)) {
      errors.push(
        fatal(
          `${basePath}.pronoun`,
          "Subjonctif must start with 'Que' or 'Qu''"
        )
      );
    }
  }

  // ---- J' elision rule ----
  if (p.person === "je") {
    const stem =p.auxStem ??p.correctStem ??"";
    const verbStart = stem.charAt(0).toLowerCase();
    const shouldElide = "aeiouhé".includes(verbStart);

    const hasElidedPronoun =p.pronoun.startsWith("J'")||p.pronoun.startsWith("j'") || p.pronoun.startsWith("Que j'");

    if (shouldElide && !hasElidedPronoun ) {
      errors.push({
        level:"STRONG",
        path:`${basePath}.pronoun`,
        message:"Je must elide to j' before vowel or mute h",
        context

      }
      );
    }

    if (!shouldElide && hasElidedPronoun) {
      errors.push(
        {
        level:"STRONG",
        path:`${basePath}.pronoun`,
        message:"J' used incorrectly before consonant",
        context
      }
      );
    }
  }

  // ---- Distractor integrity ----
  ensureDistinct(
    p.correctStem,
    p.distractorStems,
    `${basePath}.distractorStems`,
    errors
  );

  if (p.correctEnding && p.distractorEndings) {
    ensureDistinct(
      p.correctEnding,
      p.distractorEndings,
      `${basePath}.distractorEndings`,
      errors
    );
  }

  if (p.auxStem && p.distractorAuxStems) {
    ensureDistinct(
      p.auxStem,
      p.distractorAuxStems,
      `${basePath}.distractorAuxStems`,
      errors
    );
  }

  if (p.auxEnding && p.distractorAuxEndings) {
    ensureDistinct(
      p.auxEnding,
      p.distractorAuxEndings,
      `${basePath}.distractorAuxEndings`,
      errors
    );
  }
}

/* =========================
   Helpers
========================= */

function required(
  value: unknown,
  path: string,
  errors: ValidationError[]
) {
  if (value === null || value === undefined || value === "") {
    errors.push(fatal(path, "Missing required field"));
  }
}

function ensureDistinct(
  correct: string,
  distractors: string[],
  path: string,
  errors: ValidationError[]
) {
  const set = new Set(distractors);

  if (set.size !== distractors.length) {
    errors.push(
      fatal(path, "Duplicate values in distractors")
    );
  }

  if (set.has(correct)) {
    errors.push(
      fatal(
        path,
        "Distractor must not be identical to correct value"
      )
    );
  }
}

/* =========================
   Error Builders
========================= */

function fatal(path: string, message: string): ValidationError {
  return { level: "FATAL", path, message };
}

function strong(path: string, message: string): ValidationError {
  return { level: "STRONG", path, message };
}

function warning(path: string, message: string): ValidationError {
  return { level: "WARNING", path, message };
}
