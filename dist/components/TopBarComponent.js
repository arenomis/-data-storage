export class TopBarComponent {
    constructor(container, callbacks) {
        this.container = container;
        this.onAddFolder = callbacks.onAddFolder;
        this.onUploadFiles = callbacks.onUploadFiles;
        this.render();
    }
    render() {
        this.container.innerHTML = `
      <div class="topbar-actions">
        <button id="btn-add-folder" class="btn btn-primary">+ НОВАЯ ПАПКА</button>
        <input id="file-input" type="file" multiple style="display: none;" />
        <button id="btn-upload" class="btn btn-primary">+ ЗАГРУЗИТЬ</button>
      </div>
      <div class="topbar-search">
        <input id="search-input" type="text" placeholder="Поиск..." class="search-input" />
      </div>
    `;
        const btnAddFolder = document.getElementById('btn-add-folder');
        const btnUpload = document.getElementById('btn-upload');
        const fileInput = document.getElementById('file-input');
        btnAddFolder.addEventListener('click', () => this.onAddFolder());
        btnUpload.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files || []);
            this.onUploadFiles(files);
            fileInput.value = '';
        });
    }
    getSearchInput() {
        return document.getElementById('search-input');
    }
}
