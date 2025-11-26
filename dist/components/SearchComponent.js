export class SearchComponent {
    constructor(container, callbacks) {
        this.container = container;
        this.onItemClick = callbacks.onItemClick;
        this.onHover = callbacks.onHover;
        this.setupEventListeners();
    }
    setupEventListeners() {
        this.container.addEventListener('click', (e) => this.handleClick(e));
        this.container.addEventListener('mouseover', (e) => this.handleHover(e));
    }
    handleClick(e) {
        const item = e.target.closest('[data-search-item]');
        if (!item)
            return;
        const id = item.dataset.searchItem;
        const type = item.dataset.searchType;
        this.onItemClick(type, id);
    }
    handleHover(e) {
        const item = e.target.closest('[data-search-item]');
        if (!item)
            return;
        const id = item.dataset.searchItem;
        const desc = item.dataset.searchDesc || 'Нет описания';
        const rect = item.getBoundingClientRect();
        this.onHover(id, desc, rect);
    }
    render(results) {
        if (results.length === 0) {
            return '<div class="search-empty">Ничего не найдено</div>';
        }
        return results
            .map(r => `
        <div class="search-result" data-search-item="${r.item.id}" data-search-type="${r.type}" data-search-desc="${this.escapeAttr(r.item.description || '')}">
          <div class="search-result-info">
            <span class="search-icon">${r.type === 'folder' ? 'DIR' : 'FILE'}</span>
            <div>
              <div class="search-result-name">${this.escapeHtml(r.item.name)}</div>
              <div class="search-result-path">${this.escapeHtml(r.path)}</div>
            </div>
          </div>
          <span class="search-result-arrow">></span>
        </div>
      `)
            .join('');
    }
    update(results) {
        this.container.innerHTML = this.render(results);
    }
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    escapeAttr(text) {
        return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
}
