/**
 * Script generation service.
 * Currently uses a stub — swap for OpenAI / Anthropic / any LLM by implementing
 * the same interface: generateScript(params) → Promise<string>
 */

// ── Stub generator ─────────────────────────────────────────────────────────────
function stubGenerate({ symptoms, tone, duration }) {
  const symptomList = symptoms.join(', ');
  const wordCount = duration * 130; // ~130 wpm reading pace

  return `# Hypnotherapy Script — ${tone} Approach
*Approx. ${duration} minutes | Generated for: ${symptomList}*

---

## Induction

Close your eyes and take a slow, deep breath in… and out.
With every breath, you feel your body becoming more relaxed, more at ease.
Let go of any tension you may be holding in your shoulders… your jaw… your hands.

You are safe here. There is nothing you need to do except breathe and listen.

---

## Deepening

As I count from 10 to 1, you will drift deeper into a state of calm, focused relaxation.

10… 9… each number takes you deeper…
8… 7… your thoughts slow, like leaves floating on a gentle stream…
6… 5… halfway there — feeling wonderfully heavy and peaceful…
4… 3… almost there now…
2… 1… completely relaxed, completely at ease.

---

## Therapeutic Suggestions (${symptomList})

Your mind is remarkably capable of healing itself.
Every session strengthens your ability to manage ${symptoms[0] ?? 'the challenges you face'}.
You are calm, in control, and growing stronger each day.

---

## Awakening

In a moment, I will count from 1 to 5 and you will return — fully alert, refreshed, and positive.

1… beginning to return…
2… aware of the room around you…
3… feeling energised…
4… almost there…
5… eyes open, fully awake and feeling wonderful.

---

*Script length: ~${wordCount} words | Tone: ${tone}*`;
}

// ── OpenAI integration (commented out — enable when key is available) ─────────
// async function openaiGenerate({ symptoms, tone, duration }) {
//   const { OpenAI } = await import('openai');
//   const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
//   const prompt = buildPrompt(symptoms, tone, duration);
//   const res = await client.chat.completions.create({
//     model: 'gpt-4o',
//     messages: [{ role: 'user', content: prompt }],
//   });
//   return res.choices[0].message.content;
// }

/**
 * @param {{ symptoms: string[], tone: string, duration: number }} params
 * @returns {Promise<string>} Markdown-formatted hypnotherapy script
 */
export async function generateScript(params) {
  const provider = process.env.AI_PROVIDER ?? 'stub';

  switch (provider) {
    case 'stub':
    default:
      return stubGenerate(params);
  }
}
