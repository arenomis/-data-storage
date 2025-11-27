export class TreeComponent {
    constructor(container, callbacks) {
        this.expandedFolders = new Set();
        this.selectedItemId = null;
        this.container = container;
        this.onFolderClick = callbacks.onFolderClick;
        this.onFileClick = callbacks.onFileClick;
        this.onContextMenu = callbacks.onContextMenu;
        this.onHover = callbacks.onHover;
        this.onToggleExpand = callbacks.onToggleExpand;
        this.setupEventListeners();
    }
    setupEventListeners() {
        this.container.addEventListener('click', (e) => this.handleClick(e));
        this.container.addEventListener('contextmenu', (e) => this.handleContextMenu(e));
        this.container.addEventListener('mouseover', (e) => this.handleHover(e));
    }
    handleClick(e) {
        const item = e.target.closest('[data-tree-item]');
        if (!item)
            return;
        const id = item.dataset.treeItem;
        const isFolder = item.classList.contains('tree-folder');
        if (isFolder) {
            const toggle = item.querySelector('.tree-toggle');
            if (e.target.closest('.tree-toggle')) {
                this.toggleExpand(item, id);
            }
            else {
                this.selectedItemId = id;
                this.updateSelection();
                this.onFolderClick(id);
            }
        }
        else {
            this.selectedItemId = id;
            this.updateSelection();
            this.onFileClick(id);
        }
    }
    handleContextMenu(e) {
        const item = e.target.closest('[data-tree-item]');
        if (!item)
            return;
        e.preventDefault();
        const id = item.dataset.treeItem;
        const isFolder = item.classList.contains('tree-folder');
        const rect = item.getBoundingClientRect();
        this.onContextMenu(id, isFolder, rect.right, rect.top);
    }
    handleHover(e) {
        const item = e.target.closest('[data-tree-item]');
        if (!item)
            return;
        const id = item.dataset.treeItem;
        const isFile = item.classList.contains('tree-file');
        const rect = item.getBoundingClientRect();
        if (isFile) {
            this.onHover(id, true, rect);
        }
    }
    toggleExpand(item, id) {
        const toggle = item.querySelector('.tree-toggle');
        const children = item.nextElementSibling;
        if (children === null || children === void 0 ? void 0 : children.classList.contains('tree-children')) {
            if (children.style.display === 'none') {
                this.expandedFolders.add(id);
                children.style.display = 'block';
                if (toggle)
                    toggle.textContent = '↓';
                if (this.onToggleExpand) {
                    try {
                        const res = this.onToggleExpand(id);
                        if (res && typeof res.then === 'function') {
                            ;
                            res.catch(() => { });
                        }
                    }
                    catch (e) {
                    }
                }
            }
            else {
                children.style.display = 'none';
                if (toggle)
                    toggle.textContent = '→';
                this.expandedFolders.delete(id);
            }
        }
    }
    updateSelection() {
        this.container.querySelectorAll('.tree-item').forEach(el => {
            el.classList.remove('tree-active');
        });
        if (this.selectedItemId) {
            const selected = this.container.querySelector(`[data-tree-item="${this.selectedItemId}"]`);
            if (selected) {
                selected.classList.add('tree-active');
            }
        }
    }
    render(folder) {
        const parts = [];
        for (const f of folder.folders) {
            parts.push(`
        <div class="tree-item tree-folder" data-tree-item="${f.id}">
          <button class="tree-toggle">→</button>
          <span class="tree-type-icon folder-icon">DIR</span>
          <span class="tree-name">${this.escapeHtml(f.name)}</span>
        </div>
      `);
            parts.push(`
        <div class="tree-children" style="display: none;">
          ${this.render(f)}
        </div>
      `);
        }
        for (const file of folder.files) {
            parts.push(`
        <div class="tree-item tree-file" data-tree-item="${file.id}">
          <span class="tree-type-icon file-icon">FILE</span>
          <span class="tree-name">${this.escapeHtml(file.name)}</span>
        </div>
      `);
        }
        return parts.join('');
    }
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    update(folder) {
        this.container.innerHTML = this.render(folder);
        this.restoreExpandedState();
        this.updateSelection();
    }
    restoreExpandedState() {
        this.expandedFolders.forEach(id => {
            const item = this.container.querySelector(`[data-tree-item="${id}"]`);
            if (item) {
                const toggle = item.querySelector('.tree-toggle');
                const children = item.nextElementSibling;
                if (children === null || children === void 0 ? void 0 : children.classList.contains('tree-children')) {
                    children.style.display = 'block';
                    toggle.textContent = '↓';
                }
            }
        });
    }
    setSelectedItemId(id) {
        this.selectedItemId = id;
        this.updateSelection();
    }
    expandToItem(itemId, store) {
        const pathToRoot = [];
        let folderId = itemId;
        const fileRes = store.findFileById(itemId);
        if (fileRes)
            folderId = fileRes.parent.id;
        let current = store.findFolderById(folderId);
        while (current) {
            pathToRoot.unshift(current.id);
            current = store.findParentFolder(current.id);
        }
        pathToRoot.forEach(id => {
            this.expandedFolders.add(id);
            const item = this.container.querySelector(`[data-tree-item="${id}"]`);
            if (item) {
                const toggle = item.querySelector('.tree-toggle');
                const children = item.nextElementSibling;
                if (children === null || children === void 0 ? void 0 : children.classList.contains('tree-children')) {
                    children.style.display = 'block';
                    toggle.textContent = '↓';
                }
            }
        });
    }
}
