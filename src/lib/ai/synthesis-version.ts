/**
 * Bump this whenever we change the synthesis prompt, the model, the
 * post-processor, or the rendering contract in a way that should
 * invalidate cached output. Old summaries with `ai_summary_version`
 * less than this constant are transparently regenerated on next read.
 *
 * Version log:
 *   1 — initial release (Llama 3.1 8B, lax prompt)
 *   2 — Llama 3.3 70B, strict Romanian grammar/style rules,
 *       polishSynthesis post-processor (capitalize, fix dangling
 *       bold, normalize section titles, tighten punctuation spacing).
 *   3 — stiri prompt switched to a structured brief with five
 *       sections („Pe scurt", „Cifre cheie", „Context", „Ce urmează",
 *       „De ce contează") + 250–380 word target. Petitii prompt
 *       unchanged (already structured). Old 2-line stiri summaries
 *       regenerate on next visit.
 */
export const AI_SUMMARY_VERSION = 3;
