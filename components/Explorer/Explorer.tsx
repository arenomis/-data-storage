import { FileSystemState } from '../../services/fileSystem';
import { EntityType, IFolder, IFile } from '../../types';
import { Icons } from '../ui/Icons';

export class Explorer {
  private container: HTMLElement;
  private state: FileSystemState;

  constructor(container: HTMLElement, state: FileSystemState) {
    this.container = container;
    this.state = state;
    
    this.state.subscribe(() => this.render());
    
    this.container.addEventListener('click', this.handleClick.bind(this));
    this.setupTooltips();
  }

  private setupTooltips() {
    const tooltipEl = document.getElementById('tooltip');
    if (!tooltipEl) return;

    this.container.addEventListener('mouseover', (e) => {
      const target = (e.target as HTMLElement).closest('[data-type="FILE"]') as HTMLElement;
      if (target) {
        const id = target.dataset.id;
        const file = this.state.files.find(f => f.id === id);
        if (file && file.description) {
          tooltipEl.innerHTML = `<strong>${file.name}</strong><br/>${file.description}`;
          tooltipEl.style.display = 'block';
          tooltipEl.style.top = `${e.clientY + 10}px`;
          tooltipEl.style.left = `${e.clientX + 10}px`;
        }
      }
    });

    this.container.addEventListener('mouseout', () => {
      tooltipEl.style.display = 'none';
    });
  }

  private handleClick(e: MouseEvent) {
    // Check if clicked on toggle arrow specifically
    const arrow = (e.target as HTMLElement).closest('.toggle-arrow');
    if (arrow) {
        const row = arrow.closest('.tree-item-row') as HTMLElement;
        if (row) {
            const id = row.dataset.id!;
            this.state.toggleFolder(id);
            e.stopPropagation();
            return;
        }
    }

    // Otherwise handle row selection
    const target = (e.target as HTMLElement).closest('.tree-item-row');
    if (!target) return;

    const el = target as HTMLElement;
    const id = el.dataset.id!;
    const type = el.dataset.type as EntityType;

    this.state.selectItem(id, type);
  }

  render() {
    this.container.innerHTML = '';
    
    const rootFolders = this.state.folders.filter(f => f.parentId === null);
    const rootFiles = this.state.files.filter(f => f.folderId === 'root'); // Fallback

    if (rootFolders.length === 0 && rootFiles.length === 0 && this.state.files.length === 0) {
        this.container.innerHTML = '<div class="p-4 text-gray-400 text-sm">Нет файлов</div>';
        return;
    }

    const fragment = document.createDocumentFragment();
    
    rootFolders.forEach(folder => {
      this.renderItem(fragment, folder, EntityType.FOLDER, 0);
    });
    
    // If we have root files not in any folder
    this.state.files.filter(f => !this.state.folders.find(folder => folder.id === f.folderId)).forEach(file => {
        // This handles files at root if any
        // In our mock data, everything is in project_1
    });

    this.container.appendChild(fragment);
  }

  private renderItem(container: DocumentFragment | HTMLElement, item: IFolder | IFile, type: EntityType, level: number) {
    const isFolder = type === EntityType.FOLDER;
    const isExpanded = isFolder && this.state.expandedFolderIds.has(item.id);
    const isSelected = this.state.selectedItem?.id === item.id;

    const row = document.createElement('div');
    
    const paddingLeft = level * 16 + 4; // Adjusted padding
    let className = `tree-item-row cursor-pointer flex items-center py-1 text-sm select-none relative `;
    if (isSelected) {
      className += `bg-[#007ACC] text-white `;
    } else {
      className += `hover:bg-[#e5e7eb] text-gray-700 `;
    }
    
    row.className = className;
    row.style.paddingLeft = `${paddingLeft}px`;
    row.dataset.id = item.id;
    row.dataset.type = type;
    if (!isFolder) row.setAttribute('data-type', 'FILE');

    // Toggle Arrow (only for folders)
    const arrow = document.createElement('span');
    arrow.className = `toggle-arrow mr-1 w-4 h-4 flex items-center justify-center rounded hover:bg-white/20 ${isFolder ? '' : 'invisible'}`;
    if (isFolder) {
        arrow.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
    }
    row.appendChild(arrow);

    // Icon
    const iconWrapper = document.createElement('span');
    iconWrapper.className = `mr-2 ${isSelected ? 'text-white' : 'text-blue-500'}`;
    
    if (isFolder) {
      iconWrapper.innerHTML = isExpanded ? Icons.FolderOpen('w-4 h-4') : Icons.Folder('w-4 h-4');
    } else {
      iconWrapper.innerHTML = Icons.File('w-4 h-4 text-gray-500');
    }
    row.appendChild(iconWrapper);

    // Label
    const label = document.createElement('span');
    label.textContent = item.name;
    label.className = 'truncate';
    row.appendChild(label);

    container.appendChild(row);

    // Render Children
    if (isFolder && isExpanded) {
       const childFolders = this.state.folders.filter(f => f.parentId === item.id);
       const childFiles = this.state.files.filter(f => f.folderId === item.id);
       
       childFolders.forEach(child => this.renderItem(container, child, EntityType.FOLDER, level + 1));
       childFiles.forEach(child => this.renderItem(container, child, EntityType.FILE, level + 1));
    }
  }
}