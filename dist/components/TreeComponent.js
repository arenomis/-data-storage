export class TreeComponent {
    constructor(container, callbacks) {
        this.container = container;
        this.onFolderClick = callbacks.onFolderClick;
        this.onFileClick = callbacks.onFileClick;
        this.onContextMenu = callbacks.onContextMenu;
        this.onHover = callbacks.onHover;
        this.setupEventListeners();
    }
    setupEventListeners() {
        this.container.addEventListener('click', (e) => this.handleClick(e));
        this.container.addEventListener('contextmenu', (e) => this.handleContextMenu(e));
        // mouseover hover handler removed to avoid tooltip overlaying preview
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
                console.log('toggle expand for folder:', id);
                this.toggleExpand(item);
            }
            else {
                console.log('folder click:', id);
                this.onFolderClick(id);
            }
        }
        else {
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
    toggleExpand(item) {
        const toggle = item.querySelector('.tree-toggle');
        const children = item.nextElementSibling;
        if (children === null || children === void 0 ? void 0 : children.classList.contains('tree-children')) {
            if (children.style.display === 'none') {
                children.style.display = 'block';
                toggle.textContent = '↓';
            }
            else {
                children.style.display = 'none';
                toggle.textContent = '→';
            }
        }
    }
        render(folder) {
                const parts = [];

                // Render folders with their children immediately after each folder item
                for (const f of folder.folders) {
                        parts.push(`
                <div class="tree-item tree-folder" data-tree-item="${f.id}">
                    <button class="tree-toggle">→</button>
                    <span class="tree-type-icon">DIR</span>
                    <span class="tree-name">${this.escapeHtml(f.name)}</span>
                </div>
            `);

                        parts.push(`
                <div class="tree-children" style="display: none;">
                    ${this.render(f)}
                </div>
            `);
                }

                // Then render files for the current level
                for (const file of folder.files) {
                        parts.push(`
                <div class="tree-item tree-file" data-tree-item="${file.id}">
                    <span class="tree-type-icon">FILE</span>
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
    }
}
