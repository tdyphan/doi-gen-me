// === VANCOUVER FORMATTER ===
function formatAuthors(authors) {
  if (!authors || authors.length === 0) return '';
  let authorStr = '';
  if (authors.length > 6) {
    authorStr = authors.slice(0, 6).join(', ') + ', et al';
  } else {
    authorStr = authors.join(', ');
  }
  return authorStr.endsWith('.') ? authorStr : authorStr + '.';
}

function formatVancouver(meta, doiMode = 'url') {
  let parts = [];
  const authors = formatAuthors(meta.authors);
  if (authors) parts.push(authors);
  
  let title = (meta.title || '').trim();
  if (title) {
    if (!title.endsWith('.')) title += '.';
    parts.push(title);
  }
  
  let journalPart = (meta.journal || '').trim();
  if (journalPart && !journalPart.endsWith('.')) journalPart += '.';
  
  let issuePart = '';
  if (meta.year) issuePart += meta.year;
  
  let volIssuePages = '';
  if (meta.volume || meta.issue || meta.pages) {
    if (issuePart) issuePart += ';';
    if (meta.volume) volIssuePages += meta.volume;
    if (meta.issue) volIssuePages += `(${meta.issue})`;
    if (meta.pages) volIssuePages += `:${meta.pages}`;
  }
  
  if (volIssuePages) issuePart += volIssuePages;
  if (issuePart && !issuePart.endsWith('.')) issuePart += '.';
  
  let publicationDetails = [journalPart, issuePart].filter(Boolean).join(' ');
  if (publicationDetails) parts.push(publicationDetails);
  
  if (doiMode !== 'hidden' && meta.doi) {
    if (doiMode === 'url') parts.push(`https://doi.org/${meta.doi}`);
    else if (doiMode === 'doi') parts.push(`doi:${meta.doi}`);
  }
  
  return parts.join(' ').trim();
}

// === VUE APP CONFIGURATION ===

const appConfig = {
  data() {
    return {
      lang: localStorage.getItem('doi_lang') || 'vi',
      isDark: localStorage.getItem('doi_theme') === 'dark' || (!localStorage.getItem('doi_theme') && window.matchMedia('(prefers-color-scheme: dark)').matches),
      textInput: '',
      doiMode: 'url',
      citations: [],
      isProcessing: false,
      progressDone: 0,
      progressTotal: 0,
      extractedDOIs: [],
      toastMsg: null,
      toastTimeout: null,
      bulkDownloadState: {
        active: false,
        total: 0,
        done: 0,
        success: 0,
        failed: []
      },
      queueState: {
        active: false,
        paused: false,
        cancelled: false
      },
      showFailedDownloadsModal: false,
      projects: JSON.parse(localStorage.getItem('doi_projects') || '[]'),
      currentProjectId: null,
      showProjectsModal: false,
      confirmModal: {
        show: false,
        title: '',
        text: '',
        onConfirm: null
      },
      promptModal: {
        show: false,
        title: '',
        value: '',
        onConfirm: null
      }
    }
  },
  computed: {
    t() { return i18n[this.lang]; },
    doisCount() { return this.extractedDOIs.length; },
    citationsFound() { return this.citations.filter(c => c.status === 'found').length; },
    citationsError() { return this.citations.filter(c => c.status === 'not_found' || c.status === 'error').length; },
    hasPdf() { return this.citations.some(c => c.pdfUrl); }
  },
  watch: {
    textInput(newVal) {
      if (!this.isProcessing) {
        this.extractedDOIs = extractAllDOIs(newVal);
      }
    }
  },
  mounted() {
    if (this.isDark) document.documentElement.classList.add('dark');
  },
  methods: {
    toggleLang() {
      this.lang = this.lang === 'vi' ? 'en' : 'vi';
      localStorage.setItem('doi_lang', this.lang);
    },
    toggleTheme() {
      this.isDark = !this.isDark;
      localStorage.setItem('doi_theme', this.isDark ? 'dark' : 'light');
      if (this.isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    formattedCitation(item, index) {
      if (!item || !item.meta) return '';
      const base = formatVancouver(item.meta, this.doiMode);
      if (typeof index === 'number') {
        return `${index + 1}. ${base}`;
      }
      return base;
    },
    async processDOIs() {
      const dois = extractAllDOIs(this.textInput);
      this.extractedDOIs = dois;
      
      if (dois.length === 0) {
        this.showToast(this.t.noDoi);
        return;
      }
      
      this.isProcessing = true;
      this.queueState = { active: true, paused: false, cancelled: false };
      this.progressDone = 0;
      this.progressTotal = dois.length;
      
      this.citations = dois.map(doi => ({
        doi,
        status: 'loading'
      }));
      
      for (let i = 0; i < dois.length; i += 5) {
        if (this.queueState.cancelled) break;
        
        while (this.queueState.paused) {
          if (this.queueState.cancelled) break;
          await sleep(200);
        }
        if (this.queueState.cancelled) break;

        const batch = dois.slice(i, i + 5);
        const batchPromises = batch.map(doi => resolveDOISingle(doi));
        const batchResults = await Promise.all(batchPromises);
        
        batchResults.forEach((res, index) => {
          this.citations[i + index] = res;
        });
        
        this.progressDone += batch.length;
        
        if (i + 5 < dois.length) {
          await sleep(100);
        }
      }
      
      this.isProcessing = false;
      this.queueState.active = false;
      this.autoSaveProject();
    },
    autoSaveProject() {
      if (this.citations.length === 0) return;
      if (!this.currentProjectId) {
         this.currentProjectId = Date.now().toString();
         this.projects.unshift({
           id: this.currentProjectId,
           name: `Session ${new Date().toLocaleString(this.lang === 'vi' ? 'vi-VN' : 'en-US')}`,
           timestamp: Date.now(),
           textInput: this.textInput,
           citations: this.citations,
           extractedDOIs: this.extractedDOIs
         });
         // Keep max 20
         if (this.projects.length > 20) this.projects = this.projects.slice(0, 20);
      } else {
         const idx = this.projects.findIndex(p => p.id === this.currentProjectId);
         if (idx !== -1) {
            this.projects[idx].citations = this.citations;
            this.projects[idx].textInput = this.textInput;
            this.projects[idx].extractedDOIs = this.extractedDOIs;
            this.projects[idx].timestamp = Date.now();
         }
      }
      this.persistProjects();
    },
    persistProjects() {
      localStorage.setItem('doi_projects', JSON.stringify(this.projects));
    },
    loadProject(p) {
      this.currentProjectId = p.id;
      this.textInput = p.textInput;
      this.citations = p.citations;
      this.extractedDOIs = p.extractedDOIs || [];
      this.showProjectsModal = false;
      this.showToast(this.t.projectLoaded);
    },
    deleteProject(id) {
      this.confirmModal.title = this.t.confirmDeleteTitle;
      this.confirmModal.text = this.t.confirmDeleteText;
      this.confirmModal.onConfirm = () => {
        this.projects = this.projects.filter(p => p.id !== id);
        if (this.currentProjectId === id) this.currentProjectId = null;
        this.persistProjects();
        this.confirmModal.show = false;
      };
      this.confirmModal.show = true;
    },
    renameProject(p) {
      this.promptModal.title = this.t.renameTitle;
      this.promptModal.value = p.name;
      this.promptModal.onConfirm = (newName) => {
        if (newName && newName.trim()) {
          p.name = newName.trim();
          this.persistProjects();
        }
        this.promptModal.show = false;
      };
      this.promptModal.show = true;
    },
    togglePause() {
      this.queueState.paused = !this.queueState.paused;
    },
    cancelQueue() {
      this.queueState.cancelled = true;
    },
    clearInput() {
      this.textInput = '';
      this.citations = [];
      this.extractedDOIs = [];
      this.progressDone = 0;
      this.progressTotal = 0;
      this.currentProjectId = null;
    },
    showToast(msg) {
      this.toastMsg = msg;
      if (this.toastTimeout) clearTimeout(this.toastTimeout);
      this.toastTimeout = setTimeout(() => {
        this.toastMsg = null;
      }, 3000);
    },
    copySingle(item, event) {
      if (event && event.target && event.target.closest('a')) return;
      const text = this.formattedCitation(item).replace(/<[^>]*>?/gm, '');
      navigator.clipboard.writeText(text).then(() => {
        this.showToast(this.t.copiedOne);
      });
    },
    async downloadPdf(item) {
      if (!item.pdfUrl) return;
      item.isDownloading = true;
      
      try {
        const response = await fetch(item.pdfUrl);
        if (!response.ok) throw new Error('Fetch failed');
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Article_${item.doi.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        console.warn('CORS/fetch failed, falling back to new tab');
        window.open(item.pdfUrl, '_blank');
      } finally {
        item.isDownloading = false;
      }
    },
    async downloadAllPdfs() {
      const items = this.citations.filter(c => c.pdfUrl && c.status === 'found');
      if (items.length === 0) return;
      
      this.bulkDownloadState = {
        active: true,
        total: items.length,
        done: 0,
        success: 0,
        failed: []
      };
      
      const queue = [...items];
      const maxConcurrent = 3;
      const workers = [];
      
      const processItem = async (item) => {
        item.isDownloading = true;
        try {
          const response = await fetch(item.pdfUrl);
          if (!response.ok) throw new Error('Fetch failed');
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Article_${item.doi.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
          a.click();
          URL.revokeObjectURL(url);
          this.bulkDownloadState.success++;
        } catch (err) {
          this.bulkDownloadState.failed.push(item);
        } finally {
          item.isDownloading = false;
          this.bulkDownloadState.done++;
        }
      };
      
      const worker = async () => {
        while (queue.length > 0) {
          const item = queue.shift();
          await processItem(item);
          await new Promise(r => setTimeout(r, 300)); // small delay to prevent browser freeze
        }
      };
      
      for (let i = 0; i < maxConcurrent; i++) {
        workers.push(worker());
      }
      
      await Promise.all(workers);
      
      if (this.bulkDownloadState.failed.length > 0) {
        this.showFailedDownloadsModal = true;
      } else {
        this.showToast('All PDFs downloaded successfully!');
        this.bulkDownloadState.active = false;
      }
    },
    closeFailedModal() {
      this.showFailedDownloadsModal = false;
      this.bulkDownloadState.active = false;
    },
    copyFailedLinks() {
      const text = this.bulkDownloadState.failed.map(c => c.pdfUrl).join('\n');
      navigator.clipboard.writeText(text).then(() => {
        this.showToast('Copied direct PDF links to clipboard.');
      });
    },
    downloadFile(content, filename, type) {
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
    },
    copyAll() {
      const texts = this.citations
        .filter(c => c.status === 'found')
        .map(c => this.formattedCitation(c, this.citations.indexOf(c)).replace(/<[^>]*>?/gm, ''));
      
      if (texts.length === 0) return;
      navigator.clipboard.writeText(texts.join('\n\n')).then(() => {
        this.showToast(this.t.copied.replace('{0}', texts.length));
      });
    },
    exportCsv() {
      const valid = this.citations.filter(c => c.status === 'found');
      if (valid.length === 0) return;
      
      const headers = ['citation', 'doi', 'title', 'authors', 'year', 'volume', 'issue', 'pages', 'pdf_url', 'oa_status', 'license'];
      
      const escapeCsv = (text) => {
        if (text === null || text === undefined) return '';
        let str = String(text);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };
      
      const rows = valid.map(c => {
        const m = c.meta || {};
        const citationText = this.formattedCitation(c, this.citations.indexOf(c)).replace(/<[^>]*>?/gm, '');
        return [
          citationText,
          m.doi || c.doi,
          m.title || '',
          (m.authors || []).join('; '),
          m.year || '',
          m.volume || '',
          m.issue || '',
          m.pages || '',
          c.pdfUrl || '',
          m.oaStatus || '',
          m.license || ''
        ].map(escapeCsv).join(',');
      });
      
      const csvContent = headers.join(',') + '\n' + rows.join('\n');
      const bom = '\uFEFF';
      this.downloadFile(bom + csvContent, 'doigenme-citations.csv', 'text/csv;charset=utf-8');
    },
    oaBadgeClass(status) {
      if (!status) return '';
      const s = status.toLowerCase();
      if (s === 'gold') return 'text-yellow-700 dark:text-yellow-400 bg-yellow-500/10 border border-yellow-500/20';
      if (s === 'green') return 'text-green-700 dark:text-green-400 bg-green-500/10 border border-green-500/20';
      if (s === 'hybrid') return 'text-orange-700 dark:text-orange-400 bg-orange-500/10 border border-orange-500/20';
      if (s === 'bronze') return 'text-amber-800 dark:text-amber-500 bg-amber-500/10 border border-amber-500/20';
      return 'text-gray-700 dark:text-gray-400 bg-gray-500/10 border border-gray-500/20';
    },
    oaBadgeLabel(status) {
      if (!status) return '';
      const s = status.toLowerCase();
      if (s === 'gold') return 'OA Gold';
      if (s === 'green') return 'OA Green';
      if (s === 'hybrid') return 'OA Hybrid';
      if (s === 'bronze') return 'OA Bronze';
      return 'Closed';
    }
  }
};
