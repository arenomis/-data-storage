import { FolderItem } from '../models/FolderItem.js';
import { FileItem } from '../models/FileItem.js';
export class DataStore {
    constructor() {
        this.listeners = new Set();
        this.root = new FolderItem({ name: 'root' });
        this.loadDemoData();
    }
    loadDemoData() {
        // Create demo folder structure
        const documents = new FolderItem({ name: 'Документы' });
        const images = new FolderItem({ name: 'Изображения' });
        const projects = new FolderItem({ name: 'Проекты' });
        // Add files to folders
        documents.files.push(new FileItem({
            name: 'readme.txt',
            type: 'text/plain',
            size: 156,
            content: 'Это демонстрационный файл readme.txt\nВы можете его редактировать, переименовывать и удалять.',
            description: 'Основной файл документации'
        }), new FileItem({
            name: 'todo.txt',
            type: 'text/plain',
            size: 89,
            content: '1. Завершить проект\n2. Написать документацию\n3. Провести тестирование',
            description: 'Список дел'
        }));
        // Add nested folders to projects
        const frontend = new FolderItem({ name: 'Frontend' });
        const backend = new FolderItem({ name: 'Backend' });
        frontend.files.push(new FileItem({
            name: 'styles.css',
            type: 'text/css',
            size: 1024,
            content: '/* Демонстрационный CSS файл */\nbody { font-family: Arial; color: #333; }',
            description: 'Стили приложения'
        }));
        backend.files.push(new FileItem({
            name: 'api.ts',
            type: 'text/plain',
            size: 2048,
            content: '// Демонстрационный TypeScript файл\nexport interface User { id: string; name: string; }',
            description: 'API интерфейсы'
        }));
        projects.folders.push(frontend, backend);
        // Add root-level folders
        this.root.folders.push(documents, images, projects);
        // Mark root as loaded
        this.root.loaded = true;
    }
    // Find folder by id
    findFolderById(id, folder = this.root) {
        if (folder.id === id)
            return folder;
        for (const f of folder.folders) {
            const found = this.findFolderById(id, f);
            if (found)
                return found;
        }
        return null;
    }
    // Find file by id
    findFileById(id, folder = this.root) {
        for (const file of folder.files) {
            if (file.id === id)
                return { file, parent: folder };
        }
        for (const f of folder.folders) {
            const res = this.findFileById(id, f);
            if (res)
                return res;
        }
        return null;
    }
    // Get path to folder
    getPath(folderId) {
        const walk = (folder, target) => {
            if (folder.id === target)
                return [folder.name];
            for (const f of folder.folders) {
                const sub = walk(f, target);
                if (sub)
                    return [folder.name, ...sub];
            }
            return null;
        };
        const parts = walk(this.root, folderId) || ['root'];
        return '/' + parts.join('/');
    }
    // Create folder
    createFolder(parentId, name) {
        const folder = new FolderItem({ name });
        const parent = parentId ? this.findFolderById(parentId) : this.root;
        if (parent) {
            parent.folders.push(folder);
            this.notifyListeners();
        }
        return folder;
    }
    // Rename folder
    renameFolder(id, name) {
        const folder = this.findFolderById(id);
        if (folder) {
            folder.name = name;
            this.notifyListeners();
            return true;
        }
        return false;
    }
    // Delete folder recursively
    deleteFolder(id, parent = this.root) {
        for (let i = 0; i < parent.folders.length; i++) {
            if (parent.folders[i].id === id) {
                parent.folders.splice(i, 1);
                this.notifyListeners();
                return true;
            }
            if (this.deleteFolder(id, parent.folders[i]))
                return true;
        }
        return false;
    }
    // Add file to folder
    addFileToFolder(folderId, fileItem) {
        const folder = folderId ? this.findFolderById(folderId) : this.root;
        if (folder) {
            folder.files.push(fileItem);
            this.notifyListeners();
        }
        return fileItem;
    }
    // Rename file
    renameFile(id, name) {
        const res = this.findFileById(id);
        if (res) {
            res.file.name = name;
            this.notifyListeners();
            return true;
        }
        return false;
    }
    // Delete file
    deleteFile(id) {
        const res = this.findFileById(id);
        if (res) {
            const idx = res.parent.files.findIndex(f => f.id === id);
            if (idx >= 0) {
                res.parent.files.splice(idx, 1);
                this.notifyListeners();
                return true;
            }
        }
        return false;
    }
    // Simulate async load (for UX)
    async loadChildren(folderId) {
        const folder = folderId ? this.findFolderById(folderId) : this.root;
        return new Promise(resolve => {
            if (!folder)
                return resolve({ folders: [], files: [] });
            if (folder.loaded)
                return resolve({ folders: folder.folders, files: folder.files });
            setTimeout(() => {
                folder.loaded = true;
                resolve({ folders: folder.folders, files: folder.files });
            }, 250);
        });
    }
    // Search files and folders
    search(query) {
        const q = query.trim().toLowerCase();
        if (!q)
            return [];
        const results = [];
        const walk = (folder, path) => {
            if (folder.name.toLowerCase().includes(q)) {
                results.push({ type: 'folder', item: folder, path });
            }
            for (const file of folder.files) {
                if (file.name.toLowerCase().includes(q)) {
                    results.push({ type: 'file', item: file, path });
                }
            }
            for (const f of folder.folders) {
                walk(f, path + '/' + f.name);
            }
        };
        walk(this.root, '/root');
        return results;
    }
    // Observer pattern for reactivity
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    notifyListeners() {
        this.listeners.forEach(listener => listener());
    }
}
// Export singleton instance
export const dataStore = new DataStore();
