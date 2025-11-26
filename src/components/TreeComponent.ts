export class TreeComponent {
  private container: HTMLElement
  private onFolderClick: (id: string) => void
  private onFileClick: (id: string) => void
  private onContextMenu: (id: string, isFolder: boolean, x: number, y: number) => void
  private onHover: (id: string, isFile: boolean, rect: DOMRect) => void
  private expandedFolders: Set<string> = new Set()
  private selectedItemId: string | null = null

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
    this.container.addEventListener('mouseover', (e: Event) => this.handleHover(e as MouseEvent))
  }

  private handleClick(e: MouseEvent) {
    const item = (e.target as HTMLElement).closest('[data-tree-item]') as HTMLElement | null
    if (!item) return

    const id = item.dataset.treeItem!
    const isFolder = item.classList.contains('tree-folder')

    if (isFolder) {
      const toggle = item.querySelector('.tree-toggle') as HTMLElement
      if ((e.target as HTMLElement).closest('.tree-toggle')) {
        this.toggleExpand(item, id)
      } else {
        this.selectedItemId = id
        this.updateSelection()
        this.onFolderClick(id)
      }
    } else {
      this.selectedItemId = id
      this.updateSelection()
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

  private toggleExpand(item: HTMLElement, id: string) {
    const toggle = item.querySelector('.tree-toggle') as HTMLElement
    const children = item.nextElementSibling as HTMLElement | null

    if (children?.classList.contains('tree-children')) {
      if (children.style.display === 'none') {
        children.style.display = 'block'
        toggle.textContent = '↓'
        this.expandedFolders.add(id)
      } else {
        children.style.display = 'none'
        toggle.textContent = '→'
        this.expandedFolders.delete(id)
      }
    }
  }

  private updateSelection() {
    this.container.querySelectorAll('.tree-item').forEach(el => {
      el.classList.remove('tree-active')
    })
    if (this.selectedItemId) {
      const selected = this.container.querySelector(`[data-tree-item="${this.selectedItemId}"]`) as HTMLElement
      if (selected) {
        selected.classList.add('tree-active')
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
          <span class="tree-type-icon folder-icon">DIR</span>
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
          <span class="tree-type-icon file-icon">FILE</span>
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
    this.restoreExpandedState()
    this.updateSelection()
  }

  private restoreExpandedState() {
    this.expandedFolders.forEach(id => {
      const item = this.container.querySelector(`[data-tree-item="${id}"]`) as HTMLElement
      if (item) {
        const toggle = item.querySelector('.tree-toggle') as HTMLElement
        const children = item.nextElementSibling as HTMLElement | null
        if (children?.classList.contains('tree-children')) {
          children.style.display = 'block'
          toggle.textContent = '↓'
        }
      }
    })
  }

  setSelectedItemId(id: string | null) {
    this.selectedItemId = id
    this.updateSelection()
  }

  expandToItem(itemId: string, store: any) {
    // Expand folders along the path to the given item
    const pathToRoot: string[] = []
    let folderId = itemId
    const fileRes = store.findFileById(itemId)
    if (fileRes) folderId = fileRes.parent.id

    let current = store.findFolderById(folderId)
    while (current) {
      pathToRoot.unshift(current.id)
      current = store.findParentFolder(current.id)
    }

    pathToRoot.forEach(id => {
      this.expandedFolders.add(id)
      const item = this.container.querySelector(`[data-tree-item="${id}"]`) as HTMLElement
      if (item) {
        const toggle = item.querySelector('.tree-toggle') as HTMLElement
        const children = item.nextElementSibling as HTMLElement | null
        if (children?.classList.contains('tree-children')) {
          children.style.display = 'block'
          toggle.textContent = '↓'
        }
      }
    })
  }
}
