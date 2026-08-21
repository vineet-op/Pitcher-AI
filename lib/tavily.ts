const TAVILY_BASE = 'https://api.tavily.com';

function apiKey(): string | null {
  return process.env.TAVILY_API_KEY?.trim() || null;
}

export function hasTavilyKey(): boolean {
  return !!apiKey();
}

export function isLinkedInUrl(url: string): boolean {
  try {
    const host = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
    return host.includes('linkedin.com');
  } catch {
    return false;
  }
}

async function tavilyPost(path: string, body: Record<string, unknown>): Promise<unknown> {
  const key = apiKey();
  if (!key) throw new Error('Missing TAVILY_API_KEY');

  const res = await fetch(`${TAVILY_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Tavily ${path} failed (${res.status}): ${text.slice(0, 200)}`);
  }

  return res.json();
}

export interface TavilySearchHit {
  title: string;
  url: string;
  content: string;
}

export async function tavilySearch(query: string): Promise<{
  answer: string;
  results: TavilySearchHit[];
}> {
  const data = (await tavilyPost('/search', {
    query,
    search_depth: 'basic',
    max_results: 5,
    include_answer: true,
  })) as {
    answer?: string;
    results?: { title?: string; url?: string; content?: string }[];
  };

  return {
    answer: data.answer ?? '',
    results: (data.results ?? []).map((r) => ({
      title: r.title ?? '',
      url: r.url ?? '',
      content: r.content ?? '',
    })),
  };
}

export async function tavilyExtract(url: string): Promise<string> {
  const data = (await tavilyPost('/extract', {
    urls: [url],
    extract_depth: 'basic',
    format: 'markdown',
  })) as {
    results?: { raw_content?: string }[];
    failed_results?: unknown[];
  };

  const content = data.results?.[0]?.raw_content?.trim() ?? '';
  if (!content) throw new Error('Tavily extract returned no content');
  return content;
}
