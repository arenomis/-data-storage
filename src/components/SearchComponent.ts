export class SearchComponent {
  private container: HTMLElement
  private onItemClick: (type: 'file' | 'folder', id: string) => void
  private onHover: (id: string, desc: string, rect: DOMRect) => void

  constructor(container: HTMLElement, callbacks: {
    onItemClick: (type: 'file' | 'folder', id: string) => void
    onHover: (id: string, desc: string, rect: DOMRect) => void
  }) {
    this.container = container
    this.onItemClick = callbacks.onItemClick
    this.onHover = callbacks.onHover

    this.setupEventListeners()
  }

  private setupEventListeners() {
    this.container.addEventListener('click', (e: Event) => this.handleClick(e as MouseEvent))
    this.container.addEventListener('mouseover', (e: Event) => this.handleHover(e as MouseEvent))
  }

  private handleClick(e: MouseEvent) {
    const item = (e.target as HTMLElement).closest('[data-search-item]') as HTMLElement | null
    if (!item) return

    const id = item.dataset.searchItem!
    const type = item.dataset.searchType as 'file' | 'folder'

    this.onItemClick(type, id)
  }

  private handleHover(e: MouseEvent) {
    const item = (e.target as HTMLElement).closest('[data-search-item]') as HTMLElement | null
    if (!item) return

    const id = item.dataset.searchItem!
    const desc = item.dataset.searchDesc || 'Нет описания'
    const rect = item.getBoundingClientRect()

    this.onHover(id, desc, rect)
  }

  render(results: any[]): string {
    if (results.length === 0) {
      return '<div class="search-empty">Ничего не найдено</div>'
    }

    return results
      .map(r => `
        <div class="search-result" data-search-item="${(r.item as any).id}" data-search-type="${r.type}" data-search-desc="${this.escapeAttr((r.item as any).description || '')}">
          <div class="search-result-info">
            <span class="search-icon">${r.type === 'folder' ? 'DIR' : 'FILE'}</span>
            <div>
              <div class="search-result-name">${this.escapeHtml((r.item as any).name)}</div>
              <div class="search-result-path">${this.escapeHtml(r.path)}</div>
            </div>
          </div>
        </div>
      `)
      .join('')
  }

  update(results: any[]) {
    this.container.innerHTML = this.render(results)
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  private escapeAttr(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }
}
