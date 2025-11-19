import { FileSystemState } from '../../services/fileSystem';
import { Icons } from '../ui/Icons';
import { EntityType } from '../../types';

export class Editor {
  private container: HTMLElement;
  private tabsContainer: HTMLElement;
  private textarea: HTMLTextAreaElement;
  private emptyState: HTMLElement;
  private statusMsg: HTMLElement;
  private cursorPos: HTMLElement;
  private state: FileSystemState;

  constructor(container: HTMLElement, state: FileSystemState) {
    this.container = container;
    this.state = state;
    
    this.tabsContainer = document.getElementById('tabs-container')!;
    this.textarea = document.getElementById('code-editor') as HTMLTextAreaElement;
    this.emptyState = document.getElementById('empty-state')!;
    this.statusMsg = document.getElementById('status-msg')!;
    this.cursorPos = document.getElementById('cursor-pos')!;

    this.state.subscribe(() => this.update());
    this.textarea.addEventListener('input', this.handleInput.bind(this));
    this.textarea.addEventListener('keyup', this.updateCursor.bind(this));
    this.textarea.addEventListener('click', this.updateCursor.bind(this));

    this.update();
  }

  private handleInput() {
    if (this.state.selectedItem?.type === EntityType.FILE) {
       this.state.updateFileContent(this.state.selectedItem.id, this.textarea.value);
       this.updateCursor();
       // Status update
       this.statusMsg.textContent = "Не сохранено...";
    }
  }

  private updateCursor() {
     const val = this.textarea.value.substr(0, this.textarea.selectionStart);
     const lines = val.split('\n');
     const lineIndex = lines.length;
     const colIndex = lines[lines.length - 1].length + 1;
     this.cursorPos.textContent = `Ln ${lineIndex}, Col ${colIndex}`;
  }

  update() {
    const sel = this.state.selectedItem;

    if (!sel || sel.type !== EntityType.FILE) {
       this.emptyState.classList.remove('hidden');
       this.textarea.classList.add('hidden');
       this.tabsContainer.innerHTML = '';
       this.statusMsg.textContent = "";
       this.cursorPos.textContent = "";
       return;
    }

    const file = this.state.files.find(f => f.id === sel.id);
    if (!file) return;

    this.emptyState.classList.add('hidden');
    this.textarea.classList.remove('hidden');
    
    // Only update value if it changed externally or just switched file
    // We check if the content in textarea roughly matches to avoid cursor jumps, 
    // but simple way is: if document.activeElement !== textarea, update it.
    // If we are switching files, we MUST update it.
    
    // Simple heuristic: if the textarea dataset id doesn't match, it's a switch.
    if (this.textarea.dataset.fileId !== file.id) {
        this.textarea.value = file.content;
        this.textarea.dataset.fileId = file.id;
        this.statusMsg.textContent = "Готово";
    }

    // Render Tabs
    this.tabsContainer.innerHTML = '';
    const tab = document.createElement('div');
    tab.className = 'bg-white border-r border-gray-200 px-4 py-2 text-sm flex items-center gap-2 border-t-2 border-t-[#007ACC] text-[#007ACC] whitespace-nowrap cursor-default';
    tab.innerHTML = `
      ${Icons.File('w-3 h-3')}
      <span>${file.name}</span>
      <button class="ml-2 hover:text-red-500 flex items-center rounded hover:bg-gray-100 p-0.5 transition-colors">${Icons.Close('w-3 h-3')}</button>
    `;
    // Close button logic
    tab.querySelector('button')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.state.selectItem(null, EntityType.FILE); // Deselect
    });

    this.tabsContainer.appendChild(tab);
    this.updateCursor();
  }
}