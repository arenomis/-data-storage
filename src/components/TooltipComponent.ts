export class TooltipComponent {
  private container: HTMLElement
  private hideTimer: number | null = null

  constructor(container: HTMLElement) {
    this.container = container
    // Скрывать тултип при клике вне
    document.addEventListener('click', () => this.hide())

    this.container.addEventListener('mouseleave', () => this.scheduleHide())
    this.container.addEventListener('mouseenter', () => {
      if (this.hideTimer) {
        clearTimeout(this.hideTimer)
        this.hideTimer = null
      }
    })
  }

  show(text: string, x: number, y: number) {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer)
      this.hideTimer = null
    }
    
    this.container.textContent = text
    this.container.classList.remove('hidden')
    
    // Ensure tooltip is rendered before measuring
    requestAnimationFrame(() => {
      const rect = this.container.getBoundingClientRect()
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight
      
      let posX = x
      let posY = y
      
      if (posX + rect.width > windowWidth - 10) posX = windowWidth - rect.width - 10
      if (posY + rect.height > windowHeight - 10) posY = Math.max(10, posY - rect.height - 10)
      
      this.container.style.left = posX + 'px'
      this.container.style.top = posY + 'px'
    })
  }

  private scheduleHide() {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer)
    }
    this.hideTimer = setTimeout(() => {
      this.hide()
    }, 300)
  }

  hide() {
    this.container.classList.add('hidden')
    if (this.hideTimer) {
      clearTimeout(this.hideTimer)
      this.hideTimer = null
    }
  }
}
