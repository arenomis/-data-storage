import { dataStore } from './services/store.js'
import { FileItem } from './models/FileItem.js'
import { FolderItem } from './models/FolderItem.js'
import { TreeComponent } from './components/TreeComponent.js'
import { TopBarComponent } from './components/TopBarComponent.js'
import { PreviewComponent } from './components/PreviewComponent.js'
import { SearchComponent } from './components/SearchComponent.js'
import { ContextMenuComponent } from './components/ContextMenuComponent.js'
import { TooltipComponent } from './components/TooltipComponent.js'
import { ModalComponent } from './components/ModalComponent.js'
import { debounce } from './utils/helpers.js'

// Основной модуль: инициализация интерфейса и управление состоянием хранилища
class FileStorageApp {
  private store = dataStore
  private selectedFolderId: string = this.store.root.id
  private selectedFileId: string | null = null
  private currentContextId: string | null = null
  private currentContextIsFolder: boolean = false

  private tree!: TreeComponent
  private topBar!: TopBarComponent
  private preview!: PreviewComponent
  private search!: SearchComponent
  private contextMenu!: ContextMenuComponent
  private tooltip!: TooltipComponent
  private modal!: ModalComponent

  constructor() {
    this.initializeComponents()
    this.setupSubscriptions()
    this.render()
  }

  private initializeComponents() {
    const treeContainer = document.getElementById('tree-container')!
    const topBarContainer = document.getElementById('topbar-container')!
    const previewContainer = document.getElementById('preview-container')!
    const searchContainer = document.getElementById('search-container')!
    const contextMenuContainer = document.getElementById('context-menu')!
    const tooltipContainer = document.getElementById('tooltip')!
    const pathBarContainer = document.getElementById('pathbar')!

    this.tree = new TreeComponent(treeContainer, {
      onFolderClick: (id) => this.selectFolder(id),
      onFileClick: (id) => this.selectFile(id),
      onContextMenu: (id, isFolder, x, y) => this.showContextMenu(id, isFolder, x, y),
      onHover: (id, isFile, rect) => this.showTooltip(id, isFile, rect)
    })

    this.topBar = new TopBarComponent(topBarContainer, {
      onAddFolder: () => this.promptAddFolder(),
      onUploadFiles: (files) => this.handleFileUpload(files)
    })

    this.preview = new PreviewComponent(previewContainer, {
      onRenameRequest: () => this.handlePreviewRenameRequest(),
      onDeleteRequest: () => this.handlePreviewDeleteRequest(),
      onOpenFile: (id: string) => this.selectFile(id),
      onOpenFolder: (id: string) => this.selectFolder(id)
    })

    this.search = new SearchComponent(searchContainer, {
      onItemClick: (type, id) => this.selectFromSearch(type, id),
      onHover: (id, desc, rect) => this.showSearchTooltip(desc, rect)
    })

    this.contextMenu = new ContextMenuComponent(contextMenuContainer, {
      onAdd: () => this.promptAddFolderToContext(),
      onRename: () => this.promptRenameContext(),
      onDelete: () => this.deleteContext()
    })

    this.tooltip = new TooltipComponent(tooltipContainer)

    const searchInput = this.topBar.getSearchInput()
    searchInput.addEventListener('input', debounce((e: Event) => {
      const query = (e.target as HTMLInputElement).value
      const results = this.store.search(query)
      this.search.update(results)
    }, 300))

    const modalContainer = document.createElement('div')
    modalContainer.id = 'modal-container'
    modalContainer.className = 'modal-container hidden'
    document.body.appendChild(modalContainer)

    const modalBackdrop = document.createElement('div')
    modalBackdrop.className = 'modal-backdrop hidden'
    document.body.appendChild(modalBackdrop)

    this.modal = new ModalComponent(modalContainer)
  }

  private setupSubscriptions() {
    this.store.subscribe(() => this.render())
  }

  private render() {
    const root = this.store.root
    this.tree.update(root)
    this.updatePathBar()
    if (this.selectedFileId) {
      const res = this.store.findFileById(this.selectedFileId)
      if (res) {
        this.preview.showFilePreview(res.file)
      } else {
        this.preview.showEmpty()
      }
    } else {
      const folder = this.store.findFolderById(this.selectedFolderId)
      if (folder) {
        this.preview.showFolderContents(folder)
      } else {
        this.preview.showEmpty()
      }
    }
  }

  private updatePathBar() {
    const pathBar = document.getElementById('pathbar')!
    let path = ''
    if (this.selectedFileId) {
      const res = this.store.findFileById(this.selectedFileId)
      if (res) {
        path = this.store.getPath(res.parent.id) + '/' + res.file.name
      } else {
        path = this.store.getPath(this.selectedFolderId)
      }
    } else {
      path = this.store.getPath(this.selectedFolderId)
    }
    pathBar.textContent = path

    if (this.selectedFolderId !== this.store.root.id) {
      pathBar.style.cursor = 'pointer'
      pathBar.title = 'Клик для перемещения на уровень выше'
      pathBar.onclick = () => this.goToParentFolder()
    } else {
      pathBar.style.cursor = 'default'
      pathBar.title = ''
      pathBar.onclick = null
    }
  }

  private goToParentFolder() {
    if (this.selectedFileId) {
      this.selectFolder(this.selectedFolderId)
      return
    }
    
    const parentFolder = this.store.findParentFolder(this.selectedFolderId)
    if (parentFolder) {
      this.selectFolder(parentFolder.id)
    } else if (this.selectedFolderId !== this.store.root.id) {
      this.selectFolder(this.store.root.id)
    }
  }

  private selectFolder(id: string) {
    this.selectedFolderId = id
    this.selectedFileId = null
    this.tree.setSelectedItemId(id)
    this.tree.expandToItem(id, this.store)
    this.updatePathBar()

    const folder = this.store.findFolderById(id)
    if (folder) {
      this.preview.showFolderContents(folder)
    }
  }

  private selectFile(id: string) {
    this.selectedFileId = id
    const res = this.store.findFileById(id)
    if (res) {
      this.selectedFolderId = res.parent.id
      this.tree.setSelectedItemId(id)
      this.tree.expandToItem(id, this.store)
      this.updatePathBar()
      this.preview.showFilePreview(res.file)
    }
  }

  private selectFromSearch(type: 'file' | 'folder', id: string) {
    if (type === 'folder') {
      this.selectFolder(id)
    } else {
      this.selectFile(id)
    }
  }

  private showContextMenu(id: string, isFolder: boolean, x: number, y: number) {
    this.currentContextId = id
    this.currentContextIsFolder = isFolder
    this.contextMenu.show(x, y)
  }

  private showTooltip(id: string, isFile: boolean, rect: DOMRect) {
    if (isFile) {
      const res = this.store.findFileById(id)
      if (res) {
        this.tooltip.show(res.file.description, rect.right + 8, rect.top)
      }
    }
  }

  private showSearchTooltip(desc: string, rect: DOMRect) {
    this.tooltip.show(desc, rect.right + 8, rect.top)
  }

  private promptAddFolder() {
    this.modal.prompt('Имя новой папки:', 'Новая папка').then(name => {
      if (name) {
        this.store.createFolder(this.selectedFolderId, name)
      }
    })
  }

  private promptAddFolderToContext() {
    const parentId = this.currentContextIsFolder ? this.currentContextId : this.selectedFolderId
    this.modal.prompt('Имя новой папки:', 'Новая папка').then(name => {
      if (name) {
        this.store.createFolder(parentId, name)
      }
    })
  }

  private promptRenameContext() {
    if (!this.currentContextId) return

    if (this.currentContextIsFolder) {
      const folder = this.store.findFolderById(this.currentContextId)
      if (folder) {
        this.modal.prompt('Новое имя папки:', folder.name).then(name => {
          if (name) {
            this.store.renameFolder(this.currentContextId!, name)
          }
        })
      }
    } else {
      const res = this.store.findFileById(this.currentContextId)
      if (res) {
        this.modal.prompt('Новое имя файла:', res.file.name).then(name => {
          if (name) {
            this.store.renameFile(this.currentContextId!, name)
          }
        })
      }
    }
  }

  private deleteContext() {
    if (!this.currentContextId) return

    let itemName = 'неизвестный объект'
    if (this.currentContextIsFolder) {
      const folder = this.store.findFolderById(this.currentContextId)
      if (folder) itemName = `папку "${folder.name}"`
    } else {
      const res = this.store.findFileById(this.currentContextId)
      if (res) itemName = `файл "${res.file.name}"`
    }

    this.modal.confirm(`Удалить ${itemName}? Это действие необратимо.`).then(ok => {
      if (!ok) return

      if (this.currentContextIsFolder) {
        this.store.deleteFolder(this.currentContextId!)
        this.selectedFileId = null
        this.preview.showEmpty()
      } else {
        this.store.deleteFile(this.currentContextId!)
        if (this.selectedFileId === this.currentContextId) {
          this.selectedFileId = null
          this.preview.showEmpty()
        }
      }
    })
  }

  private handlePreviewRenameRequest() {
    if (!this.selectedFileId) return
    const res = this.store.findFileById(this.selectedFileId)
    if (!res) return

    this.modal.prompt('Новое имя файла:', res.file.name).then(name => {
      if (name && name.trim()) {
        this.store.renameFile(this.selectedFileId!, name.trim())
        const updated = this.store.findFileById(this.selectedFileId!)
        if (updated) this.preview.showFilePreview(updated.file)
      }
    })
  }

  private handlePreviewDeleteRequest() {
    if (!this.selectedFileId) return
    const res = this.store.findFileById(this.selectedFileId)
    if (!res) return
    const fileName = res.file.name

    this.modal.confirm(`Удалить файл "${fileName}"? Это действие необратимо.`).then(ok => {
      if (!ok) return
      this.store.deleteFile(this.selectedFileId!)
      this.selectedFileId = null
      this.preview.showEmpty()
    })
  }

  private renameCurrentFile(name: string) {
    if (this.selectedFileId) {
      this.store.renameFile(this.selectedFileId, name)
      const res = this.store.findFileById(this.selectedFileId)
      if (res) {
        this.preview.showFilePreview(res.file)
      }
    }
  }

  private deleteCurrentFile() {
    if (this.selectedFileId) {
      this.store.deleteFile(this.selectedFileId)
      this.selectedFileId = null
      this.preview.showEmpty()
    }
  }

  private async handleFileUpload(files: File[]) {
    for (const file of files) {
      const content = await this.readFile(file)
      const fileItem = new FileItem({
        name: file.name,
        type: file.type,
        size: file.size,
        content,
        description: 'Загруженный файл'
      })
      this.store.addFileToFolder(this.selectedFolderId, fileItem)
    }
  }

  private readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      if (file.type.startsWith('image/')) {
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      } else if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.css') || file.name.endsWith('.ts') || file.name.endsWith('.js') || file.name.endsWith('.json') || file.name.endsWith('.html') || file.name.endsWith('.md')) {
        reader.onload = () => resolve(reader.result as string)
        reader.readAsText(file)
      } else {
        const url = URL.createObjectURL(file)
        resolve(url)
      }

      reader.onerror = () => reject(reader.error)
    })
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new FileStorageApp()
})
