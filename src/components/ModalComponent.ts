export class ModalComponent {
  private container: HTMLElement
  private backdrop: HTMLElement

  constructor(container: HTMLElement) {
    this.container = container
    this.backdrop = document.createElement('div')
    this.backdrop.className = 'modal-backdrop hidden'
  }

  prompt(title: string, defaultValue: string = ''): Promise<string | null> {
    return new Promise(resolve => {
      this.container.innerHTML = `
        <div class="modal">
          <div class="modal-header">
            <h3>${this.escapeHtml(title)}</h3>
          </div>
          <div class="modal-body">
            <input id="modal-input" type="text" class="modal-input" value="${this.escapeAttr(defaultValue)}" autofocus />
          </div>
          <div class="modal-footer">
            <button id="modal-cancel" class="btn btn-secondary">Отмена</button>
            <button id="modal-ok" class="btn btn-primary">ОК</button>
          </div>
        </div>
      `

      this.backdrop.classList.remove('hidden')
      this.container.classList.remove('hidden')

      const input = document.getElementById('modal-input') as HTMLInputElement
      const btnOk = document.getElementById('modal-ok')!
      const btnCancel = document.getElementById('modal-cancel')!

      const handleOk = () => {
        const value = input.value.trim()
        this.close()
        resolve(value || null)
      }

      const handleCancel = () => {
        this.close()
        resolve(null)
      }

      btnOk.addEventListener('click', handleOk)
      btnCancel.addEventListener('click', handleCancel)
      input.addEventListener('keypress', (e: KeyboardEvent) => {
        if (e.key === 'Enter') handleOk()
        if (e.key === 'Escape') handleCancel()
      })

      input.focus()
      input.select()
    })
  }

  confirm(title: string): Promise<boolean> {
    return new Promise(resolve => {
      this.container.innerHTML = `
        <div class="modal">
          <div class="modal-header">
            <h3>${this.escapeHtml(title)}</h3>
          </div>
          <div class="modal-body">
            <p></p>
          </div>
          <div class="modal-footer">
            <button id="modal-cancel" class="btn btn-secondary">Отмена</button>
            <button id="modal-ok" class="btn btn-danger">Удалить</button>
          </div>
        </div>
      `

      this.backdrop.classList.remove('hidden')
      this.container.classList.remove('hidden')

      const btnOk = document.getElementById('modal-ok')!
      const btnCancel = document.getElementById('modal-cancel')!

      const handleOk = () => {
        this.close()
        resolve(true)
      }

      const handleCancel = () => {
        this.close()
        resolve(false)
      }

      btnOk.addEventListener('click', handleOk, { once: true })
      btnCancel.addEventListener('click', handleCancel, { once: true })
    })
  }

  private close() {
    this.backdrop.classList.add('hidden')
    this.container.classList.add('hidden')
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  private escapeAttr(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }
}
