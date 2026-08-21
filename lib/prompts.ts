import { MEME_CATALOG } from "./memes";

export function buildResumeParsePrompt(rawText: string): string {
  return `Extract the following resume text into structured JSON. Return ONLY valid JSON with no markdown, no code fences, no extra commentary.

Use this exact schema:
{
  "name": "string",
  "title": "string (current or most recent job title)",
  "summary": "string (brief professional summary if present, else empty string)",
  "contact": {
    "email": "string",
    "linkedin": "string",
    "github": "string",
    "portfolio": "string"
  },
  "skills": ["array of skill strings"],
  "experience": [
    {
      "company": "string",
      "role": "string",
      "duration": "string",
      "highlights": ["array of achievement/responsibility strings"]
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "tech_stack": ["array of tech strings"],
      "impact": "string (measurable result if mentioned, else empty string)"
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "duration": "string"
    }
  ]
}

RESUME TEXT:
${rawText}`;
}

export function buildMasterPrompt(
  resume: Record<string, unknown>,
  tone: string,
  companyContext?: string,
): string {
  const toneInstructions: Record<string, string> = {
    funny: `TONE — Bold & Funny:
Think stand-up comedy meets LinkedIn flex. Slides work in setup → punchline pairs — the reader swipes to get the payoff. That's what keeps them scrolling.
- Wit, self-awareness, and light sarcasm
- Slip technical proof in through humor: "cut 4 hours to 23 minutes. Not magic. Just Node.js."
- One perfect line beats a paragraph every single time`,
    sharp: `TONE — Confident & Sharp:
Founder pitching on a 60-second timer. Every word earns its place.
- No fluff, no filler
- State achievements like facts at a press briefing
- Technical proof front and center. Dry wit allowed.`,
    professional: `TONE — Professional & Warm:
Senior engineer being referred by a mutual connection.
- Warm, direct, human — not corporate
- Technical depth with approachable language
- Story-driven proof over stat-dumping`,
  };

  const selectedTone = toneInstructions[tone] ?? toneInstructions["funny"];

  const jobBlock = companyContext?.trim()
    ? `
---

TARGET COMPANY / ROLE (retrieved — treat as the only source of company facts):
${companyContext}

JOB-AWARE RULES:
- Resume = facts about the candidate. Retrieved block = facts about the company/role. Never mix them up.
- Do NOT invent company products, metrics, stack, offices, or news. If it is not in the retrieved block, skip it.
- Do NOT invent resume metrics. Proof slides still come only from the resume.
- Prefer resume projects that overlap the role's must-haves / stack.
- Slide 1 hook may name the company or role if it still sounds like a swipeable one-liner.
- Slides 10–11 should connect a REAL resume proof to a REAL org problem or product from the retrieved block (setup → punchline).
- Slide 12 ask should be aimed at this company/role, not a generic "let's talk".
- If the resume does not match a requirement, do not claim it.
`
    : "";

  const slide10 = companyContext?.trim()
    ? `Slide 10 — Setup (slide_type: "setup"):
Name a real problem, product, or moment from the retrieved company research. One line. Sets up why this candidate is relevant.
Example: "You are drowning in ops tickets. I have seen that movie."`
    : `Slide 10 — Setup (slide_type: "setup"):
A bold or funny observation about the industry, the hiring process, or what makes this candidate different.
Example: "200 resumes. Most say the same thing." or "I don't just use AI tools. I build them."`;

  const slide11 = companyContext?.trim()
    ? `Slide 11 — Punchline (slide_type: "punchline"):
Payoff: a resume proof that maps to that org fact. Specific. No invented company stats.`
    : `Slide 11 — Punchline (slide_type: "punchline"):
The payoff to slide 10. Confident, memorable, slightly audacious.`;

  const slide12 = companyContext?.trim()
    ? `Slide 12 — The Ask (slide_type: "ask"):
headline: A closer aimed at this company/role — a challenge or confident question.
subtext: "[Name] · [email] · [linkedin or github if available]"`
    : `Slide 12 — The Ask (slide_type: "ask"):
headline: One bold closing line — a challenge, question, or confident statement.
subtext: "[Name] · [email] · [linkedin or github if available]"`;

  return `You are a world-class personal pitch writer — part stand-up comedian, part startup pitch coach, part senior engineer who knows how to tell a story.

Your job: turn a developer's resume into a carousel pitch deck that gets shared on LinkedIn. Not because it's fluffy — because it's specific, human, and impossible to ignore.

Reference benchmark: The Swiggy copywriter pitch that went viral in 2024. It worked because:
1. Each slide had 1-3 lines MAX — no paragraphs ever
2. Slides worked in setup → punchline pairs across swipes
3. Technical proof was delivered as a brag, not a resume entry
4. Zero corporate language

---

${selectedTone}

---

CANDIDATE RESUME:
${JSON.stringify(resume, null, 2)}
${jobBlock}
---

OUTPUT FORMAT

Generate exactly 12 pitch slides. Return ONLY a valid JSON array. No markdown, no code fences, no explanation.

Each slide object must have:
- slide_number (number, 1-12)
- slide_title (string, 2-4 words MAX)
- headline (string, the MAIN text — max 12 words, this is what the viewer reads)
- subtext (string, ONE short follow-up line or empty string — max 10 words)
- bullet_points (array of strings — max 3 items, each under 6 words, or empty array)
- slide_type (string: "hook" | "setup" | "punchline" | "proof" | "skills" | "ask")
- image_tag (string: one meme tag from the catalog below, or empty string "")

CRITICAL SLIDE RULES:
- headline + subtext = the ENTIRE slide content. Nothing else.
- No paragraphs. Ever. More than 2 lines per slide = failure.
- bullet_points ONLY on the skills slide (slide 9). Empty array everywhere else.
- Slides work in PAIRS: N is setup, N+1 is payoff. Reader swipes to get the punchline.
- Technical proof must include ONE real number from the resume (%, time saved, count, etc.)

MEME IMAGES (image_tag):
Available meme catalog — use the EXACT tag string:
${MEME_CATALOG}

Meme rules:
- The meme must LAND the joke of that specific slide — like the Swiggy pitch, images are punchline amplifiers, not decoration
- Never use the same meme twice
- If tone is "funny": add memes to 4-6 slides (especially punchline, proof, and ask slides)
- If tone is "sharp": max 2 memes, only where they genuinely amplify
- If tone is "professional": max 1 meme, or none
- All other slides: image_tag = ""

---

THE 12 SLIDES

Slide 1 — Hook (slide_type: "hook"):
A clever one-liner or wordplay about what this person does or who they are. Should make the reader smirk and immediately swipe. This is the opening act — make it count.

Slide 2 — Setup (slide_type: "setup"):
A bold claim about who the candidate is. One sentence. Sets up slide 3.
Example: "I build things that actually ship."

Slide 3 — Punchline (slide_type: "punchline"):
The payoff to slide 2. One line that reframes or adds a twist. Can be humorous or punchy.

Slide 4 — Proof Setup (slide_type: "proof"):
One technical achievement from the resume. Result first, then hint at how.
headline: "[Impressive number or outcome]."
subtext: "[What tech or approach made it happen]."

Slide 5 — Proof Payoff (slide_type: "proof"):
A second distinct technical achievement. Result first, tech second. Different project from slide 4.

Slide 6 — Setup (slide_type: "setup"):
Self-aware humor OR a relatable dev problem statement.
Example: "Every dev says they write clean code." or "My GitHub has 0 unresolved PRs."

Slide 7 — Punchline (slide_type: "punchline"):
The payoff to slide 6. Should make the reader think "okay, fair."

Slide 8 — Skills Setup (slide_type: "setup"):
Frame the candidate's skills as a joke, observation, or bold claim — NOT as a list yet.
Example: "React by day. Node by night. Sleep is a deploy-time concern."

Slide 9 — Skills Proof (slide_type: "skills"):
The actual skills list. Top 4-5 most impressive, grounded in real usage.
headline: "In production. Not just on my resume." (or similar setup line)
bullet_points: ["[Skill] — [4-word proof from resume]", ...]

${slide10}

${slide11}

${slide12}

---

HARD CONSTRAINTS:
- Never use: passionate, driven, motivated, team player, hard worker, results-oriented, leverage, synergy, dynamic, excited to, thrilled to
- Every technical claim must trace to something real in the resume — never fabricate numbers
- If a specific number isn't in the resume, don't invent one — use a qualitative truth instead
- Company claims must trace to the retrieved block — never fabricate org facts
- bullet_points ONLY on slide 9. Empty array on all other slides.

Return ONLY the JSON array. No other text.`;
}
