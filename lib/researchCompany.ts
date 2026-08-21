import { hasTavilyKey, isLinkedInUrl, tavilyExtract, tavilySearch } from './tavily';

export interface CompanyTarget {
  company: string;
  role: string;
  warnings: string[];
  citations: { title: string; url: string }[];
  contextBlock: string;
}

export interface ResearchInput {
  jobUrl?: string;
  companyName?: string;
  jobText?: string;
  roleTitle?: string;
}

function clip(text: string, max: number): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max).trim()}…`;
}

function inferCompanyFromUrl(url: string): string {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    const host = u.hostname.replace(/^www\./, '');
    const path = u.pathname.split('/').filter(Boolean);
    const parts = host.split('.');

    if (host.includes('linkedin.com')) return '';
    if (host.includes('greenhouse.io') && path[0]) return path[0].replace(/-/g, ' ');
    if (host.includes('lever.co') && path[0]) return path[0].replace(/-/g, ' ');
    if (host.includes('ashbyhq.com') && path[0]) return path[0].replace(/-/g, ' ');
    if (host.includes('myworkdayjobs.com')) return parts[0];

    const skip = new Set(['jobs', 'careers', 'boards', 'job-boards', 'go', 'www']);
    if (skip.has(parts[0]) && parts.length > 2) return parts[1];
    return parts[0] ?? '';
  } catch {
    return '';
  }
}

function hasInput(input: ResearchInput): boolean {
  return Boolean(
    input.jobUrl?.trim() || input.companyName?.trim() || input.jobText?.trim(),
  );
}

/**
 * Optional org + JD research. Never throws — generate still runs if Tavily fails.
 */
export async function researchCompany(input: ResearchInput): Promise<CompanyTarget | null> {
  if (!hasInput(input)) return null;

  const warnings: string[] = [];
  const citations: { title: string; url: string }[] = [];
  let jdText = input.jobText?.trim() ?? '';
  const jobUrl = input.jobUrl?.trim() ?? '';
  let company = input.companyName?.trim() ?? '';
  const role = input.roleTitle?.trim() ?? '';

  if (jobUrl && isLinkedInUrl(jobUrl)) {
    warnings.push(
      'LinkedIn URLs are blocked for scraping. Paste the JD text instead — we still researched the company by name if you provided one.',
    );
  } else if (jobUrl) {
    if (!company) company = inferCompanyFromUrl(jobUrl);
    if (hasTavilyKey()) {
      try {
        const extracted = await tavilyExtract(jobUrl);
        jdText = [jdText, extracted].filter(Boolean).join('\n\n');
        citations.push({ title: 'Job posting', url: jobUrl });
      } catch (err) {
        console.warn('Tavily extract failed:', err);
        warnings.push('Could not read that job URL. Paste the JD if you have it.');
      }
    } else {
      warnings.push('Add TAVILY_API_KEY to research job URLs and the org.');
    }
  }

  const searchName = company || inferCompanyFromUrl(jobUrl);
  let orgAnswer = '';
  let orgSnippets = '';

  if (searchName && hasTavilyKey()) {
    try {
      const [about, news] = await Promise.all([
        tavilySearch(`${searchName} company product what they do`),
        tavilySearch(`${searchName} engineering tech stack news`),
      ]);
      orgAnswer = [about.answer, news.answer].filter(Boolean).join('\n');
      const hits = [...about.results, ...news.results].slice(0, 8);
      orgSnippets = hits
        .map((h) => `- ${h.title}: ${h.content}`)
        .join('\n');
      for (const h of hits) {
        if (h.url) citations.push({ title: h.title || searchName, url: h.url });
      }
      if (!company) company = searchName;
    } catch (err) {
      console.warn('Tavily search failed:', err);
      warnings.push('Company web research failed. Pitch will use the JD/resume only.');
    }
  } else if (searchName && !hasTavilyKey()) {
    if (!warnings.some((w) => w.includes('TAVILY_API_KEY'))) {
      warnings.push('Add TAVILY_API_KEY to research the org with Tavily.');
    }
    if (!company) company = searchName;
  }

  if (!company && !jdText && !orgSnippets) {
    return {
      company: '',
      role,
      warnings: warnings.length ? warnings : ['Not enough info to research the org.'],
      citations: [],
      contextBlock: '',
    };
  }

  const contextBlock = [
    company ? `Company: ${company}` : '',
    role ? `Target role: ${role}` : '',
    jobUrl && !isLinkedInUrl(jobUrl) ? `Job URL: ${jobUrl}` : '',
    orgAnswer ? `Org summary:\n${clip(orgAnswer, 1200)}` : '',
    orgSnippets ? `Org research snippets:\n${clip(orgSnippets, 3500)}` : '',
    jdText ? `Job description:\n${clip(jdText, 5000)}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  return {
    company,
    role,
    warnings,
    citations: citations.filter((c, i, arr) => arr.findIndex((x) => x.url === c.url) === i),
    contextBlock,
  };
}
