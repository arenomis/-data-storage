export class ContextMenuComponent {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks;
    }
    show(x, y) {
        this.container.innerHTML = `
      <div class="context-menu-item" data-action="add">ДОБАВИТЬ</div>
      <div class="context-menu-item" data-action="rename">ПЕРЕИМЕНОВАТЬ</div>
      <div class="context-menu-item" data-action="delete">УДАЛИТЬ</div>
    `;
        this.container.style.left = x + 'px';
        this.container.style.top = y + 'px';
        this.container.classList.remove('hidden');
        const items = this.container.querySelectorAll('.context-menu-item');
        items.forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                if (action === 'add')
                    this.callbacks.onAdd();
                if (action === 'rename')
                    this.callbacks.onRename();
                if (action === 'delete')
                    this.callbacks.onDelete();
                this.hide();
            });
        });
        document.addEventListener('click', () => this.hide());
    }
    hide() {
        this.container.classList.add('hidden');
    }
}
