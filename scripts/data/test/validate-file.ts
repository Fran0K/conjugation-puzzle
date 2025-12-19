import fs from "fs";
import path from "path";
import { validateBatch } from "./validator.js";

/* =========================
   Types (minimal)
========================= */

type Root = {
  verb: any[];
};

/* =========================
   Runner
========================= */

function runValidation(jsonPath: string) {
  const raw = fs.readFileSync(jsonPath, "utf-8");
  const data: Root = JSON.parse(raw);

  if (!data.verb || !Array.isArray(data.verb)) {
    console.error("❌ Root must contain 'verb' array");
    process.exit(1);
  }

  let totalErrors = 0;

  data.verb.forEach((batch, index) => {
    console.log(`\n▶ Validating verb[${index}] — ${batch.infinitive}`);

    const errors = validateBatch(batch);

    if (errors.length === 0) {
      console.log("✅ OK");
      return;
    }

    totalErrors += errors.length;

    errors.forEach((err) => {
      console.log(
        `❌ [${err.level}] ${err.path}: ${err.message}`
      );
    });
  });

  console.log("\n=================================");
  console.log(`Validation finished. Total errors: ${totalErrors}`);

  if (totalErrors > 0) {
    process.exit(1);
  }
}

/* =========================
   CLI
========================= */

const filePath = process.argv[2];

if (!filePath) {
  console.error("Usage: ts-node validate-file.ts <data.json>");
  process.exit(1);
}

runValidation(path.resolve(filePath));
