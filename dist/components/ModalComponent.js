export class ModalComponent {
    constructor(container) {
        this.container = container;
        this.backdrop = document.createElement('div');
        this.backdrop.className = 'modal-backdrop hidden';
        if (!document.body.contains(this.backdrop))
            document.body.appendChild(this.backdrop);
    }
    prompt(title, defaultValue = '') {
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
      `;
            this.backdrop.classList.remove('hidden');
            this.container.classList.remove('hidden');
            const input = document.getElementById('modal-input');
            const btnOk = document.getElementById('modal-ok');
            const btnCancel = document.getElementById('modal-cancel');
            const handleOk = () => {
                const value = input.value.trim();
                this.close();
                resolve(value || null);
            };
            const handleCancel = () => {
                this.close();
                resolve(null);
            };
            btnOk.addEventListener('click', handleOk);
            btnCancel.addEventListener('click', handleCancel);
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter')
                    handleOk();
                if (e.key === 'Escape')
                    handleCancel();
            });
            input.focus();
            input.select();
        });
    }
    confirm(title) {
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
      `;
            this.backdrop.classList.remove('hidden');
            this.container.classList.remove('hidden');
            const btnOk = document.getElementById('modal-ok');
            const btnCancel = document.getElementById('modal-cancel');
            const handleOk = () => {
                this.close();
                resolve(true);
            };
            const handleCancel = () => {
                this.close();
                resolve(false);
            };
            btnOk.addEventListener('click', handleOk, { once: true });
            btnCancel.addEventListener('click', handleCancel, { once: true });
        });
    }
    close() {
        this.backdrop.classList.add('hidden');
        this.container.classList.add('hidden');
    }
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    escapeAttr(text) {
        return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
}
