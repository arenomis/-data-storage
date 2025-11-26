export class PreviewComponent {
    constructor(container, callbacks) {
        this.container = container;
        this.onRename = callbacks.onRename;
        this.onDelete = callbacks.onDelete;
    }
    showEmpty() {
        this.container.innerHTML = `
      <div class="preview-empty">
        <p>Выберите файл или папку для предпросмотра</p>
      </div>
    `;
    }
    showFolderContents(folder) {
        const items = [];
        for (const f of folder.folders) {
            items.push(`<div class="preview-item"><span class="item-type">DIR</span> ${this.escapeHtml(f.name)}</div>`);
        }
        for (const file of folder.files) {
            items.push(`<div class="preview-item"><span class="item-type">FILE</span> ${this.escapeHtml(file.name)}</div>`);
        }
        this.container.innerHTML = `
      <div class="preview-header">
        <h3>Папка: ${this.escapeHtml(folder.name)}</h3>
      </div>
      <div class="preview-list">
        ${items.join('')}
      </div>
    `;
    }
    showFilePreview(file) {
        var _a, _b, _c, _d, _e, _f;
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
        }
        else if (file.type.startsWith('text/') ||
            file.name.match(/\.(txt|css|ts|js|html|json|md)$/)) {
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
        }
        else {
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
        (_a = this.container.querySelector('#btn-download')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
            this.downloadFile(file);
        });
        (_b = this.container.querySelector('#btn-rename')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => {
            const name = prompt('Новое имя файла:', file.name);
            if (name && name.trim()) {
                this.onRename(name.trim());
            }
        });
        (_c = this.container.querySelector('#btn-delete')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => {
            if (confirm('Вы уверены, что хотите удалить этот файл?')) {
                this.onDelete();
            }
        });
        (_d = document.getElementById('btn-download')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', () => {
            this.downloadFile(file);
        });
        (_e = document.getElementById('btn-rename')) === null || _e === void 0 ? void 0 : _e.addEventListener('click', () => {
            const name = prompt('Новое имя файла:', file.name);
            if (name && name.trim()) {
                this.onRename(name.trim());
            }
        });
        (_f = document.getElementById('btn-delete')) === null || _f === void 0 ? void 0 : _f.addEventListener('click', () => {
            if (confirm('Вы уверены, что хотите удалить этот файл?')) {
                this.onDelete();
            }
        });
    }
    downloadFile(file) {
        const link = document.createElement('a');
        const contentAny = file.content;
        // If content is a string
        if (typeof contentAny === 'string') {
            if (contentAny.startsWith('data:') || contentAny.startsWith('blob:')) {
                link.href = contentAny;
            }
            else {
                const blob = new Blob([contentAny], { type: 'text/plain' });
                link.href = URL.createObjectURL(blob);
            }
        }
        else if (typeof Blob !== 'undefined' && contentAny instanceof Blob) {
            link.href = URL.createObjectURL(contentAny);
        }
        else if ((typeof ArrayBuffer !== 'undefined' && contentAny instanceof ArrayBuffer) || (typeof Uint8Array !== 'undefined' && contentAny instanceof Uint8Array)) {
            const uint8 = contentAny instanceof Uint8Array ? contentAny : new Uint8Array(contentAny);
            const blob = new Blob([uint8], { type: 'application/octet-stream' });
            link.href = URL.createObjectURL(blob);
        }
        else {
            link.href = '';
        }
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        try {
            if (link.href && link.href.startsWith('blob:'))
                URL.revokeObjectURL(link.href);
        }
        catch (e) { }
    }
    formatSize(bytes) {
        if (bytes === 0)
            return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
