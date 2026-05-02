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
 *   4 — petitii prompt expanded to a five-section brief matching the
 *       stiri standard: „Pe scurt", „Ce cere petiția", „Cifre & date
 *       cheie", „Context", „De ce contează" + 250–380 word target.
 *       Old 3-section petitii summaries regenerate on next visit.
 *   5 — petitii AI generate() gained the same 70B → 8B fallback that
 *       stiri had. v4 silently shipped petition.summary as ai_summary
 *       whenever 70B was rate-limited, so a lot of v4 cache rows are
 *       actually the wrong shape (single paragraph, not 5 sections).
 *       Bumping invalidates them so the new fallback path regenerates
 *       proper structured briefs on next read.
 *   6 — Both stiri AND petitii synthesis chains now go Gemini-first
 *       (2.5 Flash → 2.5 Flash Lite → Groq 70B → Groq 8B). v5 cached
 *       a lot of rows with stire.excerpt as ai_summary because both
 *       Groq tiers were 429-ing daily; those rows render identical
 *       text in "Sinteză Civia" and "Text original" panels. Bumping
 *       invalidates them so the Gemini-backed regeneration produces
 *       proper structured 5-section briefs. Stiri prompt also tightened
 *       with explicit "value-add" rules + "if your output looks like
 *       the excerpt, you failed; reorganise" instruction.
 *   7 — v6 chain still cached excerpt-as-summary on a lot of rows
 *       because of a bug in the fallback loop: Gemini sometimes
 *       returns an empty content field (safety filter on political
 *       articles, thinking-only response with all max_tokens spent
 *       on internal reasoning, mid-output truncation), and the loop
 *       accepted the empty string as success instead of falling
 *       through to Groq. Fix: reject responses < 80 chars and try
 *       the next provider; non-rate-limit errors also cascade now
 *       instead of crashing. Bump invalidates v6 cache so the next
 *       page view of any v6 article regenerates properly.
 */
export const AI_SUMMARY_VERSION = 7;
