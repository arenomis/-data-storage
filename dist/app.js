import { dataStore } from './services/store.js';
import { FileItem } from './models/FileItem.js';
import { TreeComponent } from './components/TreeComponent.js';
import { TopBarComponent } from './components/TopBarComponent.js';
import { PreviewComponent } from './components/PreviewComponent.js';
import { SearchComponent } from './components/SearchComponent.js';
import { ContextMenuComponent } from './components/ContextMenuComponent.js';
import { TooltipComponent } from './components/TooltipComponent.js';
import { ModalComponent } from './components/ModalComponent.js';
import { debounce } from './utils/helpers.js';
class FileStorageApp {
    constructor() {
        this.store = dataStore;
        this.selectedFolderId = this.store.root.id;
        this.selectedFileId = null;
        this.currentContextId = null;
        this.currentContextIsFolder = false;
        this.initializeComponents();
        this.setupSubscriptions();
        this.render();
    }
    initializeComponents() {
        // Get container elements
        const treeContainer = document.getElementById('tree-container');
        const topBarContainer = document.getElementById('topbar-container');
        const previewContainer = document.getElementById('preview-container');
        const searchContainer = document.getElementById('search-container');
        const contextMenuContainer = document.getElementById('context-menu');
        const tooltipContainer = document.getElementById('tooltip');
        const pathBarContainer = document.getElementById('pathbar');
        // Initialize components
        this.tree = new TreeComponent(treeContainer, {
            onFolderClick: (id) => this.selectFolder(id),
            onFileClick: (id) => this.selectFile(id),
            onContextMenu: (id, isFolder, x, y) => this.showContextMenu(id, isFolder, x, y),
            onHover: (id, isFile, rect) => this.showTooltip(id, isFile, rect)
        });
        this.topBar = new TopBarComponent(topBarContainer, {
            onAddFolder: () => this.promptAddFolder(),
            onUploadFiles: (files) => this.handleFileUpload(files)
        });
        this.preview = new PreviewComponent(previewContainer, {
            onRename: (name) => this.renameCurrentFile(name),
            onDelete: () => this.deleteCurrentFile()
        });
        this.search = new SearchComponent(searchContainer, {
            onItemClick: (type, id) => this.selectFromSearch(type, id),
            onHover: (id, desc, rect) => this.showSearchTooltip(desc, rect)
        });
        this.contextMenu = new ContextMenuComponent(contextMenuContainer, {
            onAdd: () => this.promptAddFolderToContext(),
            onRename: () => this.promptRenameContext(),
            onDelete: () => this.deleteContext()
        });
        this.tooltip = new TooltipComponent(tooltipContainer);
        // Setup search
        const searchInput = this.topBar.getSearchInput();
        searchInput.addEventListener('input', debounce((e) => {
            const query = e.target.value;
            const results = this.store.search(query);
            this.search.update(results);
        }, 300));
        // Setup modal
        const modalContainer = document.createElement('div');
        modalContainer.id = 'modal-container';
        modalContainer.className = 'modal-container hidden';
        document.body.appendChild(modalContainer);
        const modalBackdrop = document.createElement('div');
        modalBackdrop.className = 'modal-backdrop hidden';
        document.body.appendChild(modalBackdrop);
        this.modal = new ModalComponent(modalContainer);
    }
    setupSubscriptions() {
        this.store.subscribe(() => this.render());
    }
    render() {
        const root = this.store.root;
        this.tree.update(root);
        this.updatePathBar();
        // Явно обновлять предпросмотр
        if (this.selectedFileId) {
            const res = this.store.findFileById(this.selectedFileId);
            if (res) {
                this.preview.showFilePreview(res.file);
            }
            else {
                this.preview.showEmpty();
            }
        }
        else {
            const folder = this.store.findFolderById(this.selectedFolderId);
            if (folder) {
                this.preview.showFolderContents(folder);
            }
            else {
                this.preview.showEmpty();
            }
        }
    }
    updatePathBar() {
        const pathBar = document.getElementById('pathbar');
        let path = '';
        if (this.selectedFileId) {
            // Если выбран файл, показываем путь к файлу
            const res = this.store.findFileById(this.selectedFileId);
            if (res) {
                path = this.store.getPath(res.parent.id) + '/' + res.file.name;
            }
            else {
                path = this.store.getPath(this.selectedFolderId);
            }
        }
        else {
            path = this.store.getPath(this.selectedFolderId);
        }
        pathBar.textContent = path;
        // Make pathbar clickable to go up one level if not at root
        if (this.selectedFolderId !== this.store.root.id) {
            pathBar.style.cursor = 'pointer';
            pathBar.title = 'Клик для перемещения на уровень выше';
            pathBar.onclick = () => this.goToParentFolder();
        }
        else {
            pathBar.style.cursor = 'default';
            pathBar.title = '';
            pathBar.onclick = null;
        }
    }
    goToParentFolder() {
        const parentFolder = this.store.findParentFolder(this.selectedFolderId);
        if (parentFolder) {
            this.selectFolder(parentFolder.id);
        }
        else if (this.selectedFolderId !== this.store.root.id) {
            // If no parent found, go to root
            this.selectFolder(this.store.root.id);
        }
    }
    selectFolder(id) {
        console.log('selectFolder called with id:', id);
        this.selectedFolderId = id;
        this.selectedFileId = null;
        this.updatePathBar();
        const folder = this.store.findFolderById(id);
        console.log('found folder:', folder === null || folder === void 0 ? void 0 : folder.name, 'with files:', folder === null || folder === void 0 ? void 0 : folder.files.length, 'folders:', folder === null || folder === void 0 ? void 0 : folder.folders.length);
        if (folder) {
            this.preview.showFolderContents(folder);
        }
    }
    selectFile(id) {
        this.selectedFileId = id;
        const res = this.store.findFileById(id);
        if (res) {
            this.selectedFolderId = res.parent.id;
            this.updatePathBar();
            this.preview.showFilePreview(res.file);
        }
    }
    selectFromSearch(type, id) {
        if (type === 'folder') {
            this.selectFolder(id);
        }
        else {
            this.selectFile(id);
        }
    }
    showContextMenu(id, isFolder, x, y) {
        this.currentContextId = id;
        this.currentContextIsFolder = isFolder;
        this.contextMenu.show(x, y);
    }
    showTooltip(id, isFile, rect) {
        if (isFile) {
            const res = this.store.findFileById(id);
            if (res) {
                this.tooltip.show(res.file.description, rect.right + 8, rect.top);
            }
        }
    }
    showSearchTooltip(desc, rect) {
        this.tooltip.show(desc, rect.right + 8, rect.top);
    }
    promptAddFolder() {
        this.modal.prompt('Имя новой папки:', 'Новая папка').then(name => {
            if (name) {
                this.store.createFolder(this.selectedFolderId, name);
            }
        });
    }
    promptAddFolderToContext() {
        const parentId = this.currentContextIsFolder ? this.currentContextId : this.selectedFolderId;
        this.modal.prompt('Имя новой папки:', 'Новая папка').then(name => {
            if (name) {
                this.store.createFolder(parentId, name);
            }
        });
    }
    promptRenameContext() {
        if (!this.currentContextId)
            return;
        if (this.currentContextIsFolder) {
            const folder = this.store.findFolderById(this.currentContextId);
            if (folder) {
                this.modal.prompt('Новое имя папки:', folder.name).then(name => {
                    if (name) {
                        this.store.renameFolder(this.currentContextId, name);
                    }
                });
            }
        }
        else {
            const res = this.store.findFileById(this.currentContextId);
            if (res) {
                this.modal.prompt('Новое имя файла:', res.file.name).then(name => {
                    if (name) {
                        this.store.renameFile(this.currentContextId, name);
                    }
                });
            }
        }
    }
    deleteContext() {
        if (!this.currentContextId)
            return;
        if (!confirm('Удалить? Это действие необратимо.'))
            return;
        if (this.currentContextIsFolder) {
            this.store.deleteFolder(this.currentContextId);
            this.selectedFileId = null;
            this.preview.showEmpty();
        }
        else {
            this.store.deleteFile(this.currentContextId);
            if (this.selectedFileId === this.currentContextId) {
                this.selectedFileId = null;
                this.preview.showEmpty();
            }
        }
    }
    renameCurrentFile(name) {
        if (this.selectedFileId) {
            this.store.renameFile(this.selectedFileId, name);
            const res = this.store.findFileById(this.selectedFileId);
            if (res) {
                this.preview.showFilePreview(res.file);
            }
        }
    }
    deleteCurrentFile() {
        if (this.selectedFileId) {
            this.store.deleteFile(this.selectedFileId);
            this.selectedFileId = null;
            this.preview.showEmpty();
        }
    }
    async handleFileUpload(files) {
        for (const file of files) {
            const content = await this.readFile(file);
            const fileItem = new FileItem({
                name: file.name,
                type: file.type,
                size: file.size,
                content,
                description: 'Загруженный файл'
            });
            this.store.addFileToFolder(this.selectedFolderId, fileItem);
        }
    }
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            if (file.type.startsWith('image/')) {
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(file);
            }
            else if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.css') || file.name.endsWith('.ts') || file.name.endsWith('.js') || file.name.endsWith('.json') || file.name.endsWith('.html') || file.name.endsWith('.md')) {
                reader.onload = () => resolve(reader.result);
                reader.readAsText(file);
            }
            else {
                const url = URL.createObjectURL(file);
                resolve(url);
            }
            reader.onerror = () => reject(reader.error);
        });
    }
}
// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new FileStorageApp();
});
