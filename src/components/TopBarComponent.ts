export class TopBarComponent {
  private container: HTMLElement
  private onAddFolder: () => void
  private onUploadFiles: (files: File[]) => void

  constructor(container: HTMLElement, callbacks: {
    onAddFolder: () => void
    onUploadFiles: (files: File[]) => void
  }) {
    this.container = container
    this.onAddFolder = callbacks.onAddFolder
    this.onUploadFiles = callbacks.onUploadFiles

    this.render()
  }

  private render() {
    this.container.innerHTML = `
      <div class="topbar-actions">
        <button id="btn-add-folder" class="btn btn-primary">+ НОВАЯ ПАПКА</button>
        <input id="file-input" type="file" multiple style="display: none;" />
        <button id="btn-upload" class="btn btn-primary">+ ЗАГРУЗИТЬ</button>
      </div>
      <div class="topbar-search">
        <div class="search-input-wrapper">
          <input id="search-input" type="text" placeholder="Поиск..." class="search-input" />
          <button id="btn-clear-search" class="btn-clear-search" title="Очистить поиск">✕</button>
        </div>
      </div>
    `

    const btnAddFolder = document.getElementById('btn-add-folder')!
    const btnUpload = document.getElementById('btn-upload')!
    const btnClearSearch = document.getElementById('btn-clear-search')!
    const fileInput = document.getElementById('file-input') as HTMLInputElement
    const searchInput = document.getElementById('search-input') as HTMLInputElement

    btnAddFolder.addEventListener('click', () => this.onAddFolder())
    btnUpload.addEventListener('click', () => fileInput.click())
    btnClearSearch.addEventListener('click', () => {
      searchInput.value = ''
      searchInput.dispatchEvent(new Event('input', { bubbles: true }))
      searchInput.focus()
    })
    fileInput.addEventListener('change', (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || [])
      this.onUploadFiles(files)
      fileInput.value = ''
    })
  }

  getSearchInput(): HTMLInputElement {
    return document.getElementById('search-input') as HTMLInputElement
  }
}
