export class ContextMenuComponent {
  private container: HTMLElement
  private callbacks: {
    onAdd: () => void
    onRename: () => void
    onDelete: () => void
  }

  constructor(container: HTMLElement, callbacks: {
    onAdd: () => void
    onRename: () => void
    onDelete: () => void
  }) {
    this.container = container
    this.callbacks = callbacks
  }

  show(x: number, y: number) {
    this.container.innerHTML = `
      <div class="context-menu-item" data-action="add">ДОБАВИТЬ</div>
      <div class="context-menu-item" data-action="rename">ПЕРЕИМЕНОВАТЬ</div>
      <div class="context-menu-item" data-action="delete">УДАЛИТЬ</div>
    `

    this.container.style.left = x + 'px'
    this.container.style.top = y + 'px'
    this.container.classList.remove('hidden')

    const items = this.container.querySelectorAll('.context-menu-item')
    items.forEach(item => {
      item.addEventListener('click', () => {
        const action = (item as HTMLElement).dataset.action
        if (action === 'add') this.callbacks.onAdd()
        if (action === 'rename') this.callbacks.onRename()
        if (action === 'delete') this.callbacks.onDelete()
        this.hide()
      })
    })

    const onDocClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.context-menu-item') && !(e.target as HTMLElement).closest('#' + this.container.id)) {
        this.hide()
      }
    }
    document.addEventListener('click', onDocClick)
    ;(this.container as any)._docClickHandler = onDocClick
  }

  hide() {
    this.container.classList.add('hidden')
    const handler = (this.container as any)._docClickHandler
    if (handler) {
      document.removeEventListener('click', handler)
      delete (this.container as any)._docClickHandler
    }
  }
}
