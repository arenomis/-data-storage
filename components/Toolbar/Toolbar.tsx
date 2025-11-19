import { FileSystemState } from '../../services/fileSystem';
import { Icons } from '../ui/Icons';
import { EntityType } from '../../types';

export class Toolbar {
  private container: HTMLElement;
  private state: FileSystemState;
  private fileInput: HTMLInputElement;

  // Modal Elements
  private modalOverlay: HTMLElement;
  private modalTitle: HTMLElement;
  private modalInput: HTMLInputElement;
  private modalConfirmBtn: HTMLElement;
  private modalCancelBtn: HTMLElement;
  private modalCloseBtn: HTMLElement;
  private currentAction: (() => void) | null = null;

  constructor(container: HTMLElement, state: FileSystemState) {
    this.container = container;
    this.state = state;

    // Setup hidden file input
    this.fileInput = document.createElement('input');
    this.fileInput.type = 'file';
    this.fileInput.style.display = 'none';
    this.fileInput.addEventListener('change', this.handleUpload.bind(this));
    document.body.appendChild(this.fileInput);

    // Bind Modal
    this.modalOverlay = document.getElementById('modal-overlay')!;
    this.modalTitle = document.getElementById('modal-title')!;
    this.modalInput = document.getElementById('modal-input') as HTMLInputElement;
    this.modalConfirmBtn = document.getElementById('modal-confirm')!;
    this.modalCancelBtn = document.getElementById('modal-cancel')!;
    this.modalCloseBtn = document.getElementById('modal-close')!;

    this.modalCancelBtn.addEventListener('click', () => this.closeModal());
    this.modalCloseBtn.addEventListener('click', () => this.closeModal());
    this.modalConfirmBtn.addEventListener('click', () => {
       if(this.currentAction) this.currentAction();
       this.closeModal();
    });

    // Close modal on enter
    this.modalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            if(this.currentAction) this.currentAction();
            this.closeModal();
        }
    });

    this.state.subscribe(() => this.render());
    this.render();
  }

  private openModal(title: string, initialValue: string = '', onConfirm: (val: string) => void) {
      this.modalTitle.textContent = title;
      this.modalInput.value = initialValue;
      this.currentAction = () => onConfirm(this.modalInput.value);
      this.modalOverlay.classList.remove('hidden');
      this.modalInput.focus();
      this.modalInput.select();
  }

  private closeModal() {
      this.modalOverlay.classList.add('hidden');
      this.currentAction = null;
  }

  private handleUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const targetFolder = this.state.getActiveFolderId();
      this.state.addFile(targetFolder, file.name, content);
      input.value = ''; // Reset to allow uploading same file again
    };
    reader.readAsText(file);
  }

  render() {
    this.container.innerHTML = '';

    const btnBase = "flex items-center gap-1.5 text-sm px-3 py-1.5 rounded transition-colors border border-transparent ";
    const btnDefault = btnBase + "text-gray-700 hover:bg-gray-200 hover:border-gray-300";
    const btnDanger = btnBase + "text-red-600 hover:bg-red-50 hover:border-red-200";
    const separator = `<div class="h-6 w-px bg-gray-300 mx-1"></div>`;

    const sel = this.state.selectedItem;
    const hasSelection = !!sel;
    const isFile = sel?.type === EntityType.FILE;
    const isFolder = sel?.type === EntityType.FOLDER;

    // --- Folder Operations ---
    const addFolderBtn = this.createBtn("Создать Папку", Icons.Folder, btnDefault, () => {
        this.openModal("Имя папки", "Новая папка", (name) => {
            if(name) this.state.addFolder(this.state.getActiveFolderId(), name);
        });
    });

    const delFolderBtn = this.createBtn("Удалить Папку", Icons.Trash, btnDanger, () => {
         if(sel && isFolder) {
            if(confirm(`Удалить папку "${this.state.folders.find(f=>f.id===sel.id)?.name}" и всё содержимое?`)) {
                this.state.deleteItem(sel.id, EntityType.FOLDER);
            }
         }
    });
    if (!isFolder) delFolderBtn.disabled = true;
    delFolderBtn.classList.toggle('opacity-50', !isFolder);

    // --- File Operations ---
    const uploadBtn = this.createBtn("Загрузить файл", Icons.Upload, btnDefault, () => {
        this.fileInput.click();
    });

    const downloadBtn = this.createBtn("Скачать файл", Icons.Download, btnDefault, () => {
        if (!isFile || !sel) return;
        const file = this.state.files.find(f => f.id === sel.id);
        if (file) {
            const blob = new Blob([file.content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name;
            a.click();
            URL.revokeObjectURL(url);
        }
    });
    if (!isFile) downloadBtn.disabled = true;
    downloadBtn.classList.toggle('opacity-50', !isFile);

    const delFileBtn = this.createBtn("Удалить файл", Icons.Trash, btnDanger, () => {
         if(sel && isFile) {
             const fName = this.state.files.find(f => f.id === sel.id)?.name;
             if(confirm(`Удалить файл "${fName}"?`)) {
                 this.state.deleteItem(sel.id, EntityType.FILE);
             }
         }
    });
    if (!isFile) delFileBtn.disabled = true;
    delFileBtn.classList.toggle('opacity-50', !isFile);

    // --- Common ---
    const renameBtn = this.createBtn("Переименовать", Icons.Edit, btnDefault, () => {
        if(!sel) return;
        let currentName = '';
        if(isFile) currentName = this.state.files.find(f => f.id === sel.id)?.name || '';
        else currentName = this.state.folders.find(f => f.id === sel.id)?.name || '';

        this.openModal("Переименовать", currentName, (name) => {
            if(name) this.state.renameItem(sel.id, sel.type, name);
        });
    });
    if (!hasSelection) renameBtn.disabled = true;
    renameBtn.classList.toggle('opacity-50', !hasSelection);


    // Assemble
    this.container.appendChild(addFolderBtn);
    this.container.appendChild(delFolderBtn);
    this.container.appendChild(this.createSeparator());
    this.container.appendChild(uploadBtn);
    this.container.appendChild(downloadBtn);
    this.container.appendChild(delFileBtn);
    this.container.appendChild(this.createSeparator());
    this.container.appendChild(renameBtn);
  }

  private createBtn(text: string, iconFn: (c: string) => string, className: string, onClick: () => void): HTMLButtonElement {
      const btn = document.createElement('button');
      btn.className = className;
      btn.innerHTML = `${iconFn('w-4 h-4')} <span class="hidden lg:inline">${text}</span>`; // Hide text on very small screens if needed
      btn.title = text;
      btn.onclick = onClick;
      return btn;
  }

  private createSeparator() {
      const d = document.createElement('div');
      d.className = "h-6 w-px bg-gray-300 mx-1";
      return d;
  }
}