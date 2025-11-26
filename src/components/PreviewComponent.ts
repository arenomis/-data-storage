import { FileItem } from '../models/FileItem.js'

// Компонент предпросмотра: поддерживает image/audio/video/pdf/text
export class PreviewComponent {
  private container: HTMLElement
  private onRename: () => void
  private onDelete: () => void
  private onOpenFile: (id: string) => void
  private onOpenFolder: (id: string) => void

  constructor(container: HTMLElement, callbacks: {
    onRenameRequest?: () => void
    onDeleteRequest?: () => void
    onOpenFile?: (id: string) => void
    onOpenFolder?: (id: string) => void
  }) {
    this.container = container
    this.onRename = (callbacks as any).onRenameRequest ?? (() => {})
    this.onDelete = (callbacks as any).onDeleteRequest ?? (() => {})
    this.onOpenFile = (callbacks as any).onOpenFile ?? (() => {})
    this.onOpenFolder = (callbacks as any).onOpenFolder ?? (() => {})
  }

  showEmpty() {
    this.container.innerHTML = `
      <div class="preview-empty">
        <p>Выберите файл или папку для предпросмотра</p>
      </div>
    `
  }

  showFolderContents(folder: any) {
    const items: string[] = []
    for (const f of folder.folders) {
      items.push(`<div class="preview-item preview-folder" data-id="${f.id}">${this.escapeHtml(f.name)}</div>`)
    }

    for (const file of folder.files) {
      items.push(`<div class="preview-item preview-file" data-id="${file.id}">${this.escapeHtml(file.name)}</div>`)
    }

    this.container.innerHTML = `
      <div class="preview-header">
        <h3>Папка: ${this.escapeHtml(folder.name)}</h3>
      </div>
      <div class="preview-list">
        ${items.join('')}
      </div>
    `

    this.container.querySelectorAll('.preview-item.preview-file').forEach(el => {
      el.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id!
        if (this.onOpenFile) this.onOpenFile(id)
      })
    })
    this.container.querySelectorAll('.preview-item.preview-folder').forEach(el => {
      el.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id!
        if (this.onOpenFolder) this.onOpenFolder(id)
      })
    })
  }

  showFilePreview(file: FileItem) {
    this.container.innerHTML = ''

    const header = `
      <div class="preview-header">
        <h3>${this.escapeHtml(file.name)}</h3>
        <p class="preview-info">${file.type} • ${this.formatSize(file.size)}</p>
      </div>
    `

    const controls = `
      <div class="preview-controls">
        <button id="btn-download" class="btn btn-secondary">Скачать</button>
        <button id="btn-rename" class="btn btn-secondary">Переименовать</button>
        <button id="btn-delete" class="btn btn-secondary btn-danger">Удалить</button>
      </div>
    `

    let contentHtml = ''
    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf')

    if (file.type.startsWith('image/')) {
      contentHtml = `<div class="preview-content"><img src="${file.content}" alt="Предпросмотр" class="preview-image" /></div>`
    } else if (file.type.startsWith('audio/')) {
      contentHtml = `<div class="preview-content"><audio controls src="${file.content}"></audio></div>`
    } else if (file.type.startsWith('video/')) {
      contentHtml = `<div class="preview-content"><video controls src="${file.content}" class="preview-video"></video></div>`
    } else if (isPdf) {
      contentHtml = `<div class="preview-content"><iframe src="${file.content}" class="preview-pdf" frameborder="0"></iframe></div>`
    } else if (file.type.startsWith('text/') || file.name.match(/\.(txt|css|ts|js|html|json|md)$/)) {
      const content = typeof file.content === 'string' ? file.content : '[Бинарные данные]'
      contentHtml = `<div class="preview-content"><pre class="preview-code">${this.escapeHtml(content)}</pre></div>`
    } else {
      contentHtml = `<div class="preview-content"><div class="preview-unsupported">Тип файла не поддерживается для предпросмотра</div></div>`
    }
    if (isPdf) {
      this.container.classList.add('pdf-mode')
      this.container.innerHTML = contentHtml
    } else {
      this.container.classList.remove('pdf-mode')
      this.container.innerHTML = header + contentHtml + controls
      
      this.container.querySelector('#btn-download')?.addEventListener('click', () => {
        this.downloadFile(file);
      });
      this.container.querySelector('#btn-rename')?.addEventListener('click', () => {
        if (this.onRename) this.onRename();
      });
      this.container.querySelector('#btn-delete')?.addEventListener('click', () => {
        if (this.onDelete) this.onDelete();
      });
    }
  }

  private downloadFile(file: FileItem) {
    const link = document.createElement('a')

    const contentAny: any = (file as any).content

    
    if (typeof contentAny === 'string') {
      if (contentAny.startsWith('data:') || contentAny.startsWith('blob:')) {
        link.href = contentAny
      } else {
        const blob = new Blob([contentAny], { type: 'text/plain' })
        link.href = URL.createObjectURL(blob)
      }
    } else if (typeof Blob !== 'undefined' && contentAny instanceof Blob) {
      link.href = URL.createObjectURL(contentAny)
    } else if ((typeof ArrayBuffer !== 'undefined' && contentAny instanceof ArrayBuffer) || (typeof Uint8Array !== 'undefined' && contentAny instanceof Uint8Array)) {
      const uint8 = contentAny instanceof Uint8Array ? contentAny : new Uint8Array(contentAny as ArrayBuffer)
      const blob = new Blob([uint8 as BufferSource], { type: 'application/octet-stream' })
      link.href = URL.createObjectURL(blob)
    } else {
      link.href = ''
    }

    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    try {
      if (link.href && link.href.startsWith('blob:')) URL.revokeObjectURL(link.href)
    } catch (e) { }
  }


  private formatSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }
}
