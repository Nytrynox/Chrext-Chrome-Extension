// Generic Job Page Parser (JSON-LD / Heuristic fallback)

console.log('Job Copilot: Generic parser loaded');

const KNOWN_PLATFORMS = [/\.linkedin\.com$/i, /\.indeed\.com$/i, /boards\.greenhouse\.io$/i, /jobs\.lever\.co$/i];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ANALYZE_JOB') {
    try {
      // Skip on known platforms: let dedicated parsers handle them
      const host = location.hostname;
      if (KNOWN_PLATFORMS.some(rx => rx.test(host))) {
        sendResponse(null);
        return true;
      }

      const jobData = extractFromJsonLd() || extractHeuristic();
      sendResponse(jobData);
    } catch (e) {
      console.error('Job Copilot: Generic extraction error', e);
      sendResponse(null);
    }
    return true;
  }
});

function extractFromJsonLd() {
  const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
  for (const s of scripts) {
    let json;
    try {
      const text = s.textContent.trim();
      if (!text) continue;
      json = JSON.parse(text);
    } catch {
      continue;
    }

    const nodes = Array.isArray(json) ? json : [json];
    for (const node of nodes) {
      if (!node) continue;
      const job = findJobPosting(node);
      if (job) {
        const title = job.title || getMeta(['og:title', 'twitter:title']) || '';
        const company = job.hiringOrganization?.name || job.hiringOrganization || getMeta(['og:site_name']) || location.hostname.split('.')[0];
        const location = deriveLocation(job);
        const descriptionHtml = job.description || '';
        const description = cleanText(descriptionHtml);
        if (!description) continue;
        return {
          platform: 'generic',
          title: title?.trim() || '',
          company: (company || '').toString().trim(),
          location: location?.trim() || '',
          description: description.trim(),
          url: window.location.href
        };
      }
    }
  }
  return null;
}

function findJobPosting(node) {
  if (!node) return null;
  const type = (node['@type'] || node.type || '').toString().toLowerCase();
  if (type === 'jobposting' || (Array.isArray(node['@type']) && node['@type'].map(String).map(s=>s.toLowerCase()).includes('jobposting'))) {
    return node;
  }
  // Some sites nest under graph or itemListElement
  const children = [];
  if (Array.isArray(node['@graph'])) children.push(...node['@graph']);
  if (Array.isArray(node.itemListElement)) children.push(...node.itemListElement);
  for (const child of children) {
    const found = findJobPosting(child);
    if (found) return found;
  }
  return null;
}

function deriveLocation(job) {
  if (job.jobLocationType && /remote/i.test(job.jobLocationType)) return 'Remote';
  const jl = job.jobLocation || job.jobLocations;
  const loc = Array.isArray(jl) ? jl[0] : jl;
  const addr = loc?.address || {};
  const parts = [addr.addressLocality, addr.addressRegion, addr.addressCountry].filter(Boolean);
  return parts.join(', ');
}

function cleanText(html) {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  // Remove scripts/styles
  div.querySelectorAll('script,style,noscript').forEach(n => n.remove());
  const text = div.textContent || div.innerText || '';
  return text.replace(/\s+/g, ' ').trim();
}

function getMeta(names) {
  for (const name of names) {
    const el = document.querySelector(`meta[property="${name}"]`) || document.querySelector(`meta[name="${name}"]`);
    if (el?.content) return el.content;
  }
  return '';
}

function extractHeuristic() {
  // Light heuristic: pick a main block and get text
  const container = document.querySelector('main, article, [role="main"], #job, [id*="job" i], [class*="job" i]');
  const titleEl = document.querySelector('h1, h2');
  const companyEl = document.querySelector('[data-company], [itemprop="hiringOrganization"] [itemprop="name"], .company, .employer');
  const descEl = container || document.querySelector('[itemprop="description"], .description, .job-description, #job-description');

  const description = (descEl?.textContent || '').trim();
  if (!description || description.length < 80) return null; // avoid false positives

  return {
    platform: 'generic',
    title: (titleEl?.textContent || '').trim(),
    company: (companyEl?.textContent || '').trim(),
    location: '',
    description,
    url: window.location.href
  };
}
