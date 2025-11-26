export class TooltipComponent {
  private container: HTMLElement
  private hideTimer: number | null = null

  constructor(container: HTMLElement) {
    this.container = container
    
    // Hide tooltip on click anywhere
    document.addEventListener('click', () => {
      this.hide()
    })
    
    // Hide tooltip when mouse leaves it
    this.container.addEventListener('mouseleave', () => {
      this.scheduleHide()
    })
    
    this.container.addEventListener('mouseenter', () => {
      if (this.hideTimer) {
        clearTimeout(this.hideTimer)
        this.hideTimer = null
      }
    })
  }

  show(text: string, x: number, y: number) {
    // Clear any pending hide
    if (this.hideTimer) {
      clearTimeout(this.hideTimer)
      this.hideTimer = null
    }
    
    this.container.textContent = text
    this.container.style.left = x + 'px'
    this.container.style.top = y + 'px'
    this.container.classList.remove('hidden')
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
