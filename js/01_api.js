// === DOI EXTRACTOR ===
function extractAllDOIs(text) {
  if (!text) return [];
  const dois = [];
  let match;
  const regex = new RegExp(DOI_REGEX);
  
  while ((match = regex.exec(text)) !== null) {
    let bareDoi = match[1];
    bareDoi = bareDoi.replace(/[.,;:]+$/, '');
    bareDoi = bareDoi.split('#')[0].split('?')[0];
    if (bareDoi) dois.push(bareDoi);
  }
  return [...new Set(dois)];
}

// === API RESOLVER ===
async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function fetchCrossref(doi) {
  const url = `https://api.crossref.org/works/${encodeURIComponent(doi)}`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) return null;
  const data = await res.json();
  const item = data.message;
  
  return {
    doi: item.DOI || doi,
    title: item.title && item.title[0] ? item.title[0] : '',
    authors: (item.author || []).map(a => {
      if (a.family && a.given) return `${a.family} ${a.given.split(' ').map(n => n[0]).join('')}`;
      if (a.family) return a.family;
      return a.name || '';
    }).filter(Boolean),
    journal: item['short-container-title'] && item['short-container-title'][0] ? item['short-container-title'][0] : (item['container-title'] && item['container-title'][0] ? item['container-title'][0] : ''),
    year: item.issued && item.issued['date-parts'] && item.issued['date-parts'][0][0] ? item.issued['date-parts'][0][0] : null,
    volume: item.volume || '',
    issue: item.issue || '',
    pages: item.page || ''
  };
}

async function fetchDataCite(doi) {
  const url = `https://api.datacite.org/dois/${encodeURIComponent(doi)}`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) return null;
  const data = await res.json();
  const item = data.data.attributes;
  
  return {
    doi: item.doi || doi,
    title: item.titles && item.titles[0] ? item.titles[0].title : '',
    authors: (item.creators || []).map(c => {
      if (c.familyName && c.givenName) return `${c.familyName} ${c.givenName.split(' ').map(n=>n[0]).join('')}`;
      if (c.name) return c.name;
      return '';
    }).filter(Boolean),
    journal: item.publisher || '',
    year: item.publicationYear || null,
    volume: '',
    issue: '',
    pages: ''
  };
}

async function fetchEuropePMC(doi) {
  const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:${encodeURIComponent(doi)}&format=json`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.resultList || !data.resultList.result || data.resultList.result.length === 0) return null;
  const item = data.resultList.result[0];
  
  return {
    doi: item.doi || doi,
    title: item.title || '',
    authors: (item.authorList && item.authorList.author) ? item.authorList.author.map(a => {
      if (a.lastName && a.initials) return `${a.lastName} ${a.initials}`;
      return a.fullName || '';
    }).filter(Boolean) : [],
    journal: item.journalTitle || '',
    year: item.pubYear ? parseInt(item.pubYear) : null,
    volume: item.journalVolume || '',
    issue: item.issue || '',
    pages: item.pageInfo || ''
  };
}

async function fetchPDFMeta(doi) {
  const url = `https://api.unpaywall.org/v2/${encodeURIComponent(doi)}?email=${encodeURIComponent(UNPAYWALL_EMAIL)}`;
  try {
    const res = await fetchWithTimeout(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.is_oa && data.best_oa_location) {
      return {
        pdfUrl: data.best_oa_location.url_for_pdf || data.best_oa_location.url_for_landing_page || data.best_oa_location.url || null,
        oaStatus: data.oa_status || 'unknown',
        license: data.best_oa_location.license || null
      };
    }
  } catch (e) {
    console.warn(`[Unpaywall] Failed for ${doi}:`, e);
  }
  return null;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function resolveDOISingle(doi) {
  const cached = getCache(doi);
  if (cached) {
    let pdfUrl = cached.pdfUrl;
    // Migration: fetch PDF if missing from v1.0 cache or if missing oaStatus
    if (pdfUrl === undefined || cached.oaStatus === undefined) {
      const unpaywallData = await fetchPDFMeta(doi);
      if (unpaywallData) {
        cached.pdfUrl = unpaywallData.pdfUrl;
        cached.oaStatus = unpaywallData.oaStatus;
        cached.license = unpaywallData.license;
      } else {
        cached.pdfUrl = null;
        cached.oaStatus = 'closed';
        cached.license = null;
      }
      setCache(doi, cached);
      pdfUrl = cached.pdfUrl;
    }
    return { doi, status: 'found', source: 'cache', meta: cached, pdfUrl: pdfUrl || null, isDownloading: false };
  }

  const fetchers = [
    { name: 'crossref', fn: fetchCrossref },
    { name: 'datacite', fn: fetchDataCite },
    { name: 'europepmc', fn: fetchEuropePMC }
  ];

  let meta = null;
  let sourceName = '';

  for (const { name, fn } of fetchers) {
    for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
      try {
        const fetchedMeta = await fn(doi);
        if (fetchedMeta && fetchedMeta.title) {
          meta = fetchedMeta;
          sourceName = name;
          break;
        }
        break; 
      } catch (e) {
        console.warn(`[${name}] Attempt ${attempt} failed for ${doi}:`, e);
        if (attempt > MAX_RETRIES) break;
      }
    }
    if (meta) break;
  }

  if (meta) {
    const unpaywallData = await fetchPDFMeta(doi);
    if (unpaywallData) {
      meta.pdfUrl = unpaywallData.pdfUrl;
      meta.oaStatus = unpaywallData.oaStatus;
      meta.license = unpaywallData.license;
    } else {
      meta.pdfUrl = null;
      meta.oaStatus = 'closed';
      meta.license = null;
    }
    setCache(doi, meta);
    return { doi, status: 'found', source: sourceName, meta, pdfUrl: meta.pdfUrl, isDownloading: false };
  }

  return { doi, status: 'not_found', error: 'No metadata found in Crossref / DataCite / Europe PMC.' };
}

async function resolveAll(dois, onProgress) {
  const results = [];
  for (let i = 0; i < dois.length; i += 5) {
    const batch = dois.slice(i, i + 5);
    const batchPromises = batch.map(doi => resolveDOISingle(doi));
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    if (onProgress) {
      onProgress(results.length, dois.length);
    }
    
    if (i + 5 < dois.length) {
      await sleep(100);
    }
  }
  return results;
}
