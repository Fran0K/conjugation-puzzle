/**
 * DEPRECATED: Client-side AI generation has been removed to improve security and performance.
 * 
 * Please use the offline generator script in `scripts/generate_dataset.js` to create
 * your verb database, and then import it into Supabase.
 */

export const generatePuzzle = async () => {
  throw new Error("Client-side generation is disabled. Please connect to Supabase with valid data.");
};

export const generateFullVerbDataset = async () => {
  throw new Error("Client-side generation is disabled. Please use the offline Node.js script.");
};
