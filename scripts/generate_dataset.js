
/**
 * OFFLINE DATA GENERATOR (JSONB Version)
 */

const fs = require('fs');
const { GoogleGenAI, Type } = require("@google/genai");

// --- Configuration ---
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.error("Error: Please set API_KEY environment variable.");
  process.exit(1);
}

// Top French Verbs
const VERBS_TO_GENERATE = [
  "être", "avoir", "aller", "faire", "dire", 
  "pouvoir", "vouloir", "savoir", "voir", "devoir",
  "manger", "finir", "aimer", "prendre", "venir"
];

const genAI = new GoogleGenAI({ apiKey: API_KEY });

const PUZZLE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    verb: { type: Type.STRING },
    tense: { type: Type.STRING },
    person: { type: Type.STRING, description: "Standard person e.g., Je, Tu, Il" },
    pronoun: { type: Type.STRING, description: "Contextual display pronoun e.g., J', Que je, Qu'il" },
    
    // Core Logic
    is_regular: { type: Type.BOOLEAN },
    correctStem: { type: Type.STRING },
    correctEnding: { type: Type.STRING, nullable: true },
    distractorStems: { type: Type.ARRAY, items: { type: Type.STRING } },
    distractorEndings: { type: Type.ARRAY, items: { type: Type.STRING }, nullable: true },
    
    auxStem: { type: Type.STRING, nullable: true },
    auxEnding: { type: Type.STRING, nullable: true },
    distractorAuxStems: { type: Type.ARRAY, items: { type: Type.STRING }, nullable: true },
    distractorAuxEndings: { type: Type.ARRAY, items: { type: Type.STRING }, nullable: true },

    ruleSummary: { type: Type.STRING },

    // JSONB Ready Object
    explanations: {
        type: Type.OBJECT,
        properties: {
            en: { type: Type.STRING },
            zh: { type: Type.STRING },
            ja: { type: Type.STRING },
            fr: { type: Type.STRING }
        },
        required: ["en", "zh", "ja"]
    }
  },
  required: ["verb", "tense", "person", "pronoun", "is_regular", "correctStem", "distractorStems", "ruleSummary", "explanations"],
};

const BATCH_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    infinitive: { type: Type.STRING },
    // JSONB Ready Object
    translations: {
        type: Type.OBJECT,
        properties: {
            en: { type: Type.STRING },
            zh: { type: Type.STRING },
            ja: { type: Type.STRING }
        },
        required: ["en", "zh", "ja"]
    },
    puzzles: {
      type: Type.ARRAY,
      items: PUZZLE_SCHEMA,
      description: "Exactly 84 puzzles (14 tenses * 6 persons)"
    }
  },
  required: ["infinitive", "translations", "puzzles"]
};

async function generateVerbData(verb) {
  console.log(`\n[Generating] Verb: ${verb}...`);
  
  const prompt = `
    Create a complete database dataset for the French verb "${verb}".
    
    I need exactly 84 puzzle objects (14 tenses * 6 persons).
    
    Data Structure Requirements:
    1. 'person': The standard grammatical person (Je, Tu, Il, Nous, Vous, Ils).
    2. 'pronoun': The ACTUAL string to display in the UI. 
       **CRITICAL ELISION & SUBJUNCTIVE RULES:**
       - If the verb/aux starts with a vowel or mute h, 'Je' becomes "J'" (e.g. J'ai, J'habite).
       - **FOR ALL SUBJUNCTIVE TENSES (Présent, Passé, Imparfait, PQP)**: The pronoun MUST include 'Que'.
         Examples: "Que je", "Qu'il" (if vowel), "Que nous", "Qu'elles".
    
    TENSES TO GENERATE (14 Total):
    --- Group A: Simple Tenses (2 slots: correctStem + correctEnding) ---
    1. Présent, 2. Imparfait, 3. Futur Simple, 4. Passé Simple, 5. Conditionnel Présent, 6. Subjonctif Présent, 7. Subjonctif Imparfait.

    --- Group B: Compound Tenses (4 slots: auxStem + auxEnding AND correctStem + correctEnding) ---
    8. Passé Composé, 9. Plus-que-parfait, 10. Futur Antérieur, 11. Passé Antérieur, 12. Conditionnel Passé, 13. Subjonctif Passé, 14. Subjonctif PQP.
    
    *** CRITICAL SPLIT LOGIC RULES ***
    
    1. COMPOUND TENSES (e.g., Passé Composé):
       - ALWAYS split Auxiliary and Participle.
       - set auxStem/auxEnding (e.g. "Av"+"ons") AND correctStem/correctEnding (Participle e.g. "Mang"+"é").

    2. SIMPLE TENSES - REGULAR / PREDICTABLE:
       - Split into Root + Suffix.
       - e.g., "Parler" (Je parle) -> Stem="Parl", Ending="e".
       - e.g., "Finir" (Je finis) -> Stem="Fin", Ending="is".

    3. SIMPLE TENSES - IRREGULAR / FUSED (VERY IMPORTANT):
       - If the conjugated form is IRREGULAR and does not follow a clear Stem+Ending pattern (common in Être, Avoir, Aller, Faire), **DO NOT SPLIT**.
       - Put the **COMPLETE WORD** in 'correctStem'.
       - Set 'correctEnding' to **NULL**.
       
       **NEGATIVE EXAMPLES (DO NOT DO THIS):**
       - "Suis" -> "Su" + "is" (WRONG)
       - "Vais" -> "Va" + "is" (WRONG)
       - "Ont"  -> "On" + "t"  (WRONG)
       
       **POSITIVE EXAMPLES (DO THIS):**
       - "Je suis" -> correctStem="Suis", correctEnding=null
       - "Je vais" -> correctStem="Vais", correctEnding=null
       - "Ils ont" -> correctStem="Ont",  correctEnding=null
       - "Il est"  -> correctStem="Est",  correctEnding=null
       - "J'ai"    -> correctStem="Ai",   correctEnding=null
       
       If in doubt for highly irregular verbs (Être/Avoir/Aller/Faire), prefer NULL ending for the Present Tense.
  `;

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: BATCH_SCHEMA,
        temperature: 0.2,
      },
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
  } catch (error) {
    console.error(`[Failed] ${verb}:`, error.message);
    return null;
  }
}

async function main() {
  const fullDataset = [];
  
  console.log(`Starting generation for ${VERBS_TO_GENERATE.length} verbs...`);
  console.log("Waiting 15s between requests to respect rate limits.");

  for (let i = 0; i < VERBS_TO_GENERATE.length; i++) {
    const verb = VERBS_TO_GENERATE[i];
    const data = await generateVerbData(verb);
    
    if (data) {
      fullDataset.push(data);
      console.log(`✅ [${i + 1}/${VERBS_TO_GENERATE.length}] Success: ${verb}`);
    }

    if (i < VERBS_TO_GENERATE.length - 1) {
      console.log("⏳ Cooling down...");
      await new Promise(resolve => setTimeout(resolve, 15000));
    }
  }

  fs.writeFileSync('verbs_data_jsonb.json', JSON.stringify(fullDataset, null, 2));
  console.log("🎉 Done! Saved to verbs_data_jsonb.json");
}

main();
