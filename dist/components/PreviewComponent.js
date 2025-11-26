// Компонент предпросмотра: поддерживает image/audio/video/pdf/text
export class PreviewComponent {
    constructor(container, callbacks) {
        var _a, _b, _c, _d;
        this.container = container;
        this.onRename = (_a = callbacks.onRenameRequest) !== null && _a !== void 0 ? _a : (() => { });
        this.onDelete = (_b = callbacks.onDeleteRequest) !== null && _b !== void 0 ? _b : (() => { });
        this.onOpenFile = (_c = callbacks.onOpenFile) !== null && _c !== void 0 ? _c : (() => { });
        this.onOpenFolder = (_d = callbacks.onOpenFolder) !== null && _d !== void 0 ? _d : (() => { });
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
            items.push(`<div class="preview-item preview-folder" data-id="${f.id}">${this.escapeHtml(f.name)}</div>`);
        }
        for (const file of folder.files) {
            items.push(`<div class="preview-item preview-file" data-id="${file.id}">${this.escapeHtml(file.name)}</div>`);
        }
        this.container.innerHTML = `
      <div class="preview-header">
        <h3>Папка: ${this.escapeHtml(folder.name)}</h3>
      </div>
      <div class="preview-list">
        ${items.join('')}
      </div>
    `;
        this.container.querySelectorAll('.preview-item.preview-file').forEach(el => {
            el.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                if (this.onOpenFile)
                    this.onOpenFile(id);
            });
        });
        this.container.querySelectorAll('.preview-item.preview-folder').forEach(el => {
            el.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                if (this.onOpenFolder)
                    this.onOpenFolder(id);
            });
        });
    }
    showFilePreview(file) {
        var _a, _b, _c;
        this.container.innerHTML = '';
        const header = `
      <div class="preview-header">
        <h3>${this.escapeHtml(file.name)}</h3>
        <p class="preview-info">${file.type} • ${this.formatSize(file.size)}</p>
      </div>
    `;
        const controls = `
      <div class="preview-controls">
        <button id="btn-download" class="btn btn-secondary">Скачать</button>
        <button id="btn-rename" class="btn btn-secondary">Переименовать</button>
        <button id="btn-delete" class="btn btn-secondary btn-danger">Удалить</button>
      </div>
    `;
        let contentHtml = '';
        const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
        if (file.type.startsWith('image/')) {
            contentHtml = `<div class="preview-content"><img src="${file.content}" alt="Предпросмотр" class="preview-image" /></div>`;
        }
        else if (file.type.startsWith('audio/')) {
            contentHtml = `<div class="preview-content"><audio controls src="${file.content}"></audio></div>`;
        }
        else if (file.type.startsWith('video/')) {
            contentHtml = `<div class="preview-content"><video controls src="${file.content}" class="preview-video"></video></div>`;
        }
        else if (isPdf) {
            contentHtml = `<div class="preview-content"><iframe src="${file.content}" class="preview-pdf" frameborder="0"></iframe></div>`;
        }
        else if (file.type.startsWith('text/') || file.name.match(/\.(txt|css|ts|js|html|json|md)$/)) {
            const content = typeof file.content === 'string' ? file.content : '[Бинарные данные]';
            contentHtml = `<div class="preview-content"><pre class="preview-code">${this.escapeHtml(content)}</pre></div>`;
        }
        else {
            contentHtml = `<div class="preview-content"><div class="preview-unsupported">Тип файла не поддерживается для предпросмотра</div></div>`;
        }
        if (isPdf) {
            this.container.classList.add('pdf-mode');
            this.container.innerHTML = contentHtml;
        }
        else {
            this.container.classList.remove('pdf-mode');
            this.container.innerHTML = header + contentHtml + controls;
            (_a = this.container.querySelector('#btn-download')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
                this.downloadFile(file);
            });
            (_b = this.container.querySelector('#btn-rename')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => {
                if (this.onRename)
                    this.onRename();
            });
            (_c = this.container.querySelector('#btn-delete')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => {
                if (this.onDelete)
                    this.onDelete();
            });
        }
    }
    downloadFile(file) {
        const link = document.createElement('a');
        const contentAny = file.content;
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
