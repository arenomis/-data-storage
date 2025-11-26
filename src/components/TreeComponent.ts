export class TreeComponent {
  private container: HTMLElement
  private onFolderClick: (id: string) => void
  private onFileClick: (id: string) => void
  private onContextMenu: (id: string, isFolder: boolean, x: number, y: number) => void
  private onHover: (id: string, isFile: boolean, rect: DOMRect) => void

  constructor(container: HTMLElement, callbacks: {
    onFolderClick: (id: string) => void
    onFileClick: (id: string) => void
    onContextMenu: (id: string, isFolder: boolean, x: number, y: number) => void
    onHover: (id: string, isFile: boolean, rect: DOMRect) => void
  }) {
    this.container = container
    this.onFolderClick = callbacks.onFolderClick
    this.onFileClick = callbacks.onFileClick
    this.onContextMenu = callbacks.onContextMenu
    this.onHover = callbacks.onHover

    this.setupEventListeners()
  }

  private setupEventListeners() {
    this.container.addEventListener('click', (e: Event) => this.handleClick(e as MouseEvent))
    this.container.addEventListener('contextmenu', (e: Event) => this.handleContextMenu(e as MouseEvent))
    // Removed mouseover hover handler to avoid tooltip overlaying content
  }

  private handleClick(e: MouseEvent) {
    const item = (e.target as HTMLElement).closest('[data-tree-item]') as HTMLElement | null
    if (!item) return

    const id = item.dataset.treeItem!
    const isFolder = item.classList.contains('tree-folder')

    if (isFolder) {
      const toggle = item.querySelector('.tree-toggle') as HTMLElement
      if ((e.target as HTMLElement).closest('.tree-toggle')) {
        console.log('toggle expand for folder:', id)
        this.toggleExpand(item)
      } else {
        console.log('folder click:', id)
        this.onFolderClick(id)
      }
    } else {
      this.onFileClick(id)
    }
  }

  private handleContextMenu(e: MouseEvent) {
    const item = (e.target as HTMLElement).closest('[data-tree-item]') as HTMLElement | null
    if (!item) return

    e.preventDefault()
    const id = item.dataset.treeItem!
    const isFolder = item.classList.contains('tree-folder')
    const rect = item.getBoundingClientRect()

    this.onContextMenu(id, isFolder, rect.right, rect.top)
  }

  private handleHover(e: MouseEvent) {
    const item = (e.target as HTMLElement).closest('[data-tree-item]') as HTMLElement | null
    if (!item) return

    const id = item.dataset.treeItem!
    const isFile = item.classList.contains('tree-file')
    const rect = item.getBoundingClientRect()

    if (isFile) {
      this.onHover(id, true, rect)
    }
  }

  private toggleExpand(item: HTMLElement) {
    const toggle = item.querySelector('.tree-toggle') as HTMLElement
    const children = item.nextElementSibling as HTMLElement | null

    if (children?.classList.contains('tree-children')) {
      if (children.style.display === 'none') {
        children.style.display = 'block'
        toggle.textContent = '↓'
      } else {
        children.style.display = 'none'
        toggle.textContent = '→'
      }
    }
  }

  render(folder: any): string {
    const parts: string[] = []

    // Render folders with their children immediately after each folder item
    for (const f of folder.folders) {
      parts.push(`
        <div class="tree-item tree-folder" data-tree-item="${f.id}">
          <button class="tree-toggle">→</button>
          <span class="tree-type-icon">DIR</span>
          <span class="tree-name">${this.escapeHtml(f.name)}</span>
        </div>
      `)

      parts.push(`
        <div class="tree-children" style="display: none;">
          ${this.render(f)}
        </div>
      `)
    }

    // Then render files for the current level
    for (const file of folder.files) {
      parts.push(`
        <div class="tree-item tree-file" data-tree-item="${file.id}">
          <span class="tree-type-icon">FILE</span>
          <span class="tree-name">${this.escapeHtml(file.name)}</span>
        </div>
      `)
    }

    return parts.join('')
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  update(folder: any) {
    this.container.innerHTML = this.render(folder)
  }
}
