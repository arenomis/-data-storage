import { IFolder, IFile, EntityType, IFileExtension, ISelectedItem } from '../types';
import { INITIAL_FOLDERS, INITIAL_FILES, MOCK_EXTENSIONS } from '../constants';

type Listener = () => void;

export class FileSystemState {
  folders: IFolder[] = [];
  files: IFile[] = [];
  extensions: IFileExtension[] = MOCK_EXTENSIONS;
  selectedItem: ISelectedItem | null = null;
  expandedFolderIds: Set<string> = new Set(['project_1']);
  
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.loadData();
  }

  private async loadData() {
    // Sync load for simplicity and stability as per "remove extra features" hint, but requirement said async welcome.
    // We will simulate small tick.
    await new Promise(resolve => setTimeout(resolve, 100));
    this.folders = INITIAL_FOLDERS;
    this.files = INITIAL_FILES;
    this.notify();
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(l => l());
  }

  toggleFolder(id: string) {
    if (this.expandedFolderIds.has(id)) {
      this.expandedFolderIds.delete(id);
    } else {
      this.expandedFolderIds.add(id);
    }
    this.notify();
  }

  selectItem(id: string | null, type: EntityType) {
    if (!id) {
      this.selectedItem = null;
    } else {
      this.selectedItem = { id, type };
    }
    this.notify();
  }

  addFolder(parentId: string | null, name: string) {
    const newFolder: IFolder = {
      id: `folder-${Date.now()}`,
      name,
      parentId
    };
    this.folders.push(newFolder);
    if (parentId) this.expandedFolderIds.add(parentId);
    this.notify();
  }

  addFile(parentId: string, name: string, content: string = '') {
    const ext = name.split('.').pop()?.toLowerCase();
    const typeObj = this.extensions.find(e => e.type === ext) || this.extensions.find(e => e.type === 'txt')!;

    const newFile: IFile = {
      id: `file-${Date.now()}`,
      name,
      description: 'Новый файл',
      typeId: typeObj.id,
      folderId: parentId,
      content
    };
    this.files.push(newFile);
    this.expandedFolderIds.add(parentId);
    this.selectItem(newFile.id, EntityType.FILE);
    this.notify();
  }

  deleteItem(id: string, type: EntityType) {
    if (type === EntityType.FILE) {
      this.files = this.files.filter(f => f.id !== id);
      if (this.selectedItem?.id === id) this.selectedItem = null;
    } else {
      // Recursive delete
      const idsToDelete = new Set<string>([id]);
      
      const findChildren = (parentId: string) => {
        this.folders.forEach(f => {
          if (f.parentId === parentId) {
            idsToDelete.add(f.id);
            findChildren(f.id);
          }
        });
      };
      findChildren(id);

      this.folders = this.folders.filter(f => !idsToDelete.has(f.id));
      this.files = this.files.filter(f => !idsToDelete.has(f.folderId));
      
      if (this.selectedItem && idsToDelete.has(this.selectedItem.id)) {
        this.selectedItem = null;
      }
    }
    this.notify();
  }

  renameItem(id: string, type: EntityType, newName: string) {
    if (type === EntityType.FILE) {
      const file = this.files.find(f => f.id === id);
      if (file) file.name = newName;
    } else {
      const folder = this.folders.find(f => f.id === id);
      if (folder) folder.name = newName;
    }
    this.notify();
  }

  updateFileContent(id: string, content: string) {
    const file = this.files.find(f => f.id === id);
    if (file) {
      file.content = content;
    }
  }

  // Helper to determine where to insert new items based on selection
  getActiveFolderId(): string {
      if (this.selectedItem) {
          if (this.selectedItem.type === EntityType.FOLDER) {
              return this.selectedItem.id;
          } else {
              const file = this.files.find(f => f.id === this.selectedItem!.id);
              return file ? file.folderId : 'project_1';
          }
      }
      // Default to root folder if exists
      const root = this.folders.find(f => f.parentId === null);
      return root ? root.id : 'root';
  }
}