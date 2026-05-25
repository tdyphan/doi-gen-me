// === TYPES (JSDoc) ===
/**
 * @typedef {'url'|'doi'|'hidden'} DoiMode
 * @typedef {'loading'|'found'|'not_found'|'error'} CitationStatus
 * @typedef {'crossref'|'datacite'|'europepmc'|'cache'} DataSource
 */

/**
 * @typedef {Object} CitationResult
 * @property {string}         doi
 * @property {CitationStatus} status
 * @property {string}         [citation]   - formatted string nếu found
 * @property {DataSource}     [source]     - nguồn dữ liệu
 * @property {string}         [error]      - lý do nếu not_found
 * @property {string|null}    [pdfUrl]     - Open-access PDF URL (nếu có)
 */

/**
 * @typedef {Object} WorkMeta   - normalized từ bất kỳ API nào
 * @property {string}   doi
 * @property {string}   title
 * @property {string[]} authors   - ["Họ AB", "Họ CD", ...]
 * @property {string}   journal   - tên viết tắt ưu tiên
 * @property {number}   year
 * @property {string}   [volume]
 * @property {string}   [issue]
 * @property {string}   [pages]
 * @property {string|null} [pdfUrl] - PDF từ Unpaywall
 */

// === CONSTANTS ===
const DOI_REGEX = /(?:https?:\/\/(?:dx\.)?doi\.org\/|doi:\s*)?(10\.\d{4,9}\/[^\s"'<>\]},]+)/gi;
const CACHE_KEY = 'doigenme_cache';
const CACHE_LIMIT = 50;
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
const TIMEOUT_MS = 8000; // 8s
const MAX_RETRIES = 2;
const UNPAYWALL_EMAIL = 'tdytools.dev@gmail.com';

// === CACHE MODULE ===
const memCache = new Map();

function loadCache() {
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const now = Date.now();
      const valid = parsed.filter(item => (now - item.savedAt) < CACHE_TTL);
      
      valid.forEach(item => memCache.set(item.doi, item));
      
      if (valid.length !== parsed.length) {
        saveCache();
      }
    }
  } catch (e) {
    console.error('Failed to load cache', e);
  }
}

function saveCache() {
  try {
    let entries = Array.from(memCache.values());
    entries.sort((a, b) => b.savedAt - a.savedAt);
    entries = entries.slice(0, CACHE_LIMIT);
    localStorage.setItem(CACHE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error('Failed to save cache', e);
  }
}

function getCache(doi) {
  if (memCache.has(doi)) {
    const item = memCache.get(doi);
    if ((Date.now() - item.savedAt) < CACHE_TTL) {
      return item.meta;
    } else {
      memCache.delete(doi);
    }
  }
  return null;
}

function setCache(doi, meta) {
  if (memCache.has(doi)) {
    memCache.delete(doi);
  }
  memCache.set(doi, {
    doi,
    meta,
    savedAt: Date.now()
  });
  
  if (memCache.size > CACHE_LIMIT) {
    const firstKey = memCache.keys().next().value;
    memCache.delete(firstKey);
  }
  
  saveCache();
}

// init cache
loadCache();
