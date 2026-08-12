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
  company: CompanyInfo,
): string {
  return `You are an expert personal branding strategist and pitch writer. Your job is to transform a candidate's resume and a target company's information into a compelling, creative pitch deck — NOT a boring resume summary.

The pitch should feel like a founder pitching their startup, except the product is the candidate themselves. It should be confident, specific, and memorable. Avoid clichés like "passionate", "team player", "hard worker", "results-driven". Every claim must be backed by a specific project, number, or experience from the resume.

---

INPUT DATA

CANDIDATE RESUME:
${JSON.stringify(resume, null, 2)}

TARGET COMPANY:
- Company Name: ${company.name}
- Job Role: ${company.role}
- Job Description: ${company.jobDescription}
- About the Company: ${company.about || "Not provided"}

---

OUTPUT FORMAT

Generate content for exactly 7 pitch slides. Return ONLY a valid JSON array with no markdown, no code fences, no extra text.

Each slide object must have:
- slide_number (number)
- slide_title (string, max 6 words, punchy)
- headline (string, one bold statement, max 15 words)
- body (string, 2-4 sentences, specific and concrete)
- bullet_points (array of strings, 3-5 items, or empty array)
- tone_note (string, one sentence describing the vibe)

---

THE 7 SLIDES

Slide 1 — The Hook:
Open with a bold specific claim about what the candidate brings to THIS company. Reference something real and specific about the company — a product, a challenge they face, their market position, or something from the job description. Make the reader feel this pitch was made for them and only them.

Slide 2 — Who Am I:
A human confident introduction. Not a job title list. Who is this person, what do they care about, what kind of work excites them. Keep it personal and real. No bullet points — flowing copy only.

Slide 3 — The Problem I'll Solve For You:
Based on the job description and company context, identify 1-2 specific problems or challenges this company likely faces in this role. Name the actual challenge. Frame the candidate as someone who has already solved a version of that problem. Do NOT list skills here.

Slide 4 — Proof of Work:
Pick the 2-3 most relevant projects or experiences from the resume that directly map to the job requirements. For each: what was the problem, what did the candidate do, what was the measurable result. Use numbers wherever available. Present as mini case studies.

Slide 5 — My Edge:
3-5 core skills most relevant to THIS role. For each skill, one sentence of evidence from the resume. Not a list — a skills argument. Each bullet should be "[Skill]: [evidence from resume]".

Slide 6 — Why This Company:
Written from the candidate's genuine perspective. Why does THIS company excite them? Reference something specific — their product, mission, a challenge they're solving, their scale. Must feel researched, not templated. Should NOT sound like a generic cover letter opener.

Slide 7 — The Ask:
A confident clear closing. What does the candidate want (interview, conversation, coffee chat)? One bold memorable closing line. Include a call to action with contact info from the resume. If the candidate is underqualified in some areas, acknowledge it honestly and briefly — this builds trust.

---

TONE GUIDELINES:
- Confident but not arrogant
- Specific, never vague
- Human and conversational, not corporate
- Creative framing — think startup pitch, not HR document

CONSTRAINTS:
- Never use: passionate, driven, motivated, team player, hard worker, results-oriented, leverage, synergy, dynamic
- Every claim must trace back to something in the resume — no fabrication
- If resume data is missing for a section, note [NEEDS_INFO: what's missing] rather than making something up
- Keep each slide digestible — it will be displayed as a carousel card

Return ONLY the JSON array. No other text.`;
}

export interface CompanyInfo {
  name: string;
  role: string;
  jobDescription: string;
  about: string;
}
