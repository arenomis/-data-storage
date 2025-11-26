import { FileItem } from '../models/FileItem.js'

export class PreviewComponent {
  private container: HTMLElement
  private onRename: (name: string) => void
  private onDelete: () => void

  constructor(container: HTMLElement, callbacks: {
    onRename: (name: string) => void
    onDelete: () => void
  }) {
    this.container = container
    this.onRename = callbacks.onRename
    this.onDelete = callbacks.onDelete
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
      items.push(`<div class="preview-item"><span class="item-type">DIR</span> ${this.escapeHtml(f.name)}</div>`)
    }

    for (const file of folder.files) {
      items.push(`<div class="preview-item"><span class="item-type">FILE</span> ${this.escapeHtml(file.name)}</div>`)
    }

    this.container.innerHTML = `
      <div class="preview-header">
        <h3>Папка: ${this.escapeHtml(folder.name)}</h3>
      </div>
      <div class="preview-list">
        ${items.join('')}
      </div>
    `
  }

  showFilePreview(file: FileItem) {
    // Очищаем контейнер
    this.container.innerHTML = '';

    // Проверяем тип файла
    if (file.type.startsWith('image/')) {
      this.container.innerHTML = `
        <div class="preview-header">
          <h3>${this.escapeHtml(file.name)}</h3>
          <p class="preview-info">${file.type} • ${this.formatSize(file.size)}</p>
        </div>
        <div class="preview-content">
          <img src="${file.content}" alt="Предпросмотр" class="preview-image" />
        </div>
        <div class="preview-controls">
          <button id="btn-download" class="btn btn-secondary">⬇ СКАЧАТЬ</button>
          <button id="btn-rename" class="btn btn-secondary">✏ ПЕРЕИМЕНОВАТЬ</button>
          <button id="btn-delete" class="btn btn-secondary btn-danger">✕ УДАЛИТЬ</button>
        </div>
      `;
    } else if (
      file.type.startsWith('text/') ||
      file.name.match(/\.(txt|css|ts|js|html|json|md)$/)
    ) {
      const content = typeof file.content === 'string' ? file.content : '[Бинарные данные]';
      this.container.innerHTML = `
        <div class="preview-header">
          <h3>${this.escapeHtml(file.name)}</h3>
          <p class="preview-info">${file.type} • ${this.formatSize(file.size)}</p>
        </div>
        <div class="preview-content">
          <pre class="preview-code">${this.escapeHtml(content)}</pre>
        </div>
        <div class="preview-controls">
          <button id="btn-download" class="btn btn-secondary">⬇ СКАЧАТЬ</button>
          <button id="btn-rename" class="btn btn-secondary">✏ ПЕРЕИМЕНОВАТЬ</button>
          <button id="btn-delete" class="btn btn-secondary btn-danger">✕ УДАЛИТЬ</button>
        </div>
      `;
    } else {
      this.container.innerHTML = `
        <div class="preview-header">
          <h3>${this.escapeHtml(file.name)}</h3>
          <p class="preview-info">${file.type} • ${this.formatSize(file.size)}</p>
        </div>
        <div class="preview-content">
          <div class="preview-unsupported">Тип файла не поддерживается для предпросмотра</div>
        </div>
        <div class="preview-controls">
          <button id="btn-download" class="btn btn-secondary">⬇ СКАЧАТЬ</button>
          <button id="btn-rename" class="btn btn-secondary">✏ ПЕРЕИМЕНОВАТЬ</button>
          <button id="btn-delete" class="btn btn-secondary btn-danger">✕ УДАЛИТЬ</button>
        </div>
      `;
    }

    // Добавляем обработчики кнопок
    this.container.querySelector('#btn-download')?.addEventListener('click', () => {
      this.downloadFile(file);
    });
    this.container.querySelector('#btn-rename')?.addEventListener('click', () => {
      const name = prompt('Новое имя файла:', file.name);
      if (name && name.trim()) {
        this.onRename(name.trim());
      }
    });
    this.container.querySelector('#btn-delete')?.addEventListener('click', () => {
      if (confirm('Вы уверены, что хотите удалить этот файл?')) {
        this.onDelete();
      }
    });

    document.getElementById('btn-download')?.addEventListener('click', () => {
      this.downloadFile(file)
    })

    document.getElementById('btn-rename')?.addEventListener('click', () => {
      const name = prompt('Новое имя файла:', file.name)
      if (name && name.trim()) {
        this.onRename(name.trim())
      }
    })

    document.getElementById('btn-delete')?.addEventListener('click', () => {
      if (confirm('Вы уверены, что хотите удалить этот файл?')) {
        this.onDelete()
      }
    })
  }

  private downloadFile(file: FileItem) {
    const link = document.createElement('a')

    const contentAny: any = (file as any).content

    // If content is a string
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
