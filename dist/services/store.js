import { FolderItem } from '../models/FolderItem.js';
import { FileItem } from '../models/FileItem.js';
import { FolderItem as FolderItemClass } from '../models/FolderItem.js';
import { FileItem as FileItemClass } from '../models/FileItem.js';
// Хранилище данных: папки, файлы и простая персистенция в localStorage
export class DataStore {
    constructor() {
        this.listeners = new Set();
        this.root = new FolderItem({ name: 'root' });
        if (!this.loadState())
            this.loadDemoData();
    }
    loadDemoData() {
        const documents = new FolderItem({ name: 'Документы' });
        const projects = new FolderItem({ name: 'Проекты' });
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
        this.root.folders.push(documents, projects);
        this.root.loaded = true;
    }
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
    findFileById(id, folder = this.root) {
        for (const file of folder.files)
            if (file.id === id)
                return { file, parent: folder };
        for (const f of folder.folders) {
            const res = this.findFileById(id, f);
            if (res)
                return res;
        }
        return null;
    }
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
    findParentFolder(folderId, parent = this.root) {
        if (folderId === this.root.id)
            return null;
        for (const folder of parent.folders) {
            if (folder.id === folderId)
                return parent;
            const found = this.findParentFolder(folderId, folder);
            if (found)
                return found;
        }
        return null;
    }
    createFolder(parentId, name) {
        const folder = new FolderItem({ name });
        const parent = parentId ? this.findFolderById(parentId) : this.root;
        if (parent) {
            parent.folders.push(folder);
            this.saveState();
            this.notifyListeners();
        }
        return folder;
    }
    renameFolder(id, name) {
        const folder = this.findFolderById(id);
        if (folder) {
            folder.name = name;
            this.saveState();
            this.notifyListeners();
            return true;
        }
        return false;
    }
    deleteFolder(id, parent = this.root) {
        for (let i = 0; i < parent.folders.length; i++) {
            if (parent.folders[i].id === id) {
                parent.folders.splice(i, 1);
                this.saveState();
                this.notifyListeners();
                return true;
            }
            if (this.deleteFolder(id, parent.folders[i]))
                return true;
        }
        return false;
    }
    addFileToFolder(folderId, fileItem) {
        const folder = folderId ? this.findFolderById(folderId) : this.root;
        if (folder) {
            folder.files.push(fileItem);
            this.saveState();
            this.notifyListeners();
        }
        return fileItem;
    }
    renameFile(id, name) {
        const res = this.findFileById(id);
        if (res) {
            res.file.name = name;
            this.saveState();
            this.notifyListeners();
            return true;
        }
        return false;
    }
    deleteFile(id) {
        const res = this.findFileById(id);
        if (res) {
            const idx = res.parent.files.findIndex(f => f.id === id);
            if (idx >= 0) {
                res.parent.files.splice(idx, 1);
                this.saveState();
                this.notifyListeners();
                return true;
            }
        }
        return false;
    }
    saveState() {
        try {
            const serialized = JSON.stringify(this.serializeFolder(this.root));
            localStorage.setItem('data-storage-state-v1', serialized);
        }
        catch (e) {
            console.warn('Failed to save state', e);
        }
    }
    loadState() {
        try {
            const raw = localStorage.getItem('data-storage-state-v1');
            if (!raw)
                return false;
            const parsed = JSON.parse(raw);
            const { root, maxFileId, maxFolderId } = this.reconstructFromObject(parsed);
            this.root = root;
            FileItemClass.setCounter(maxFileId + 1);
            FolderItemClass.setCounter(maxFolderId + 1);
            return true;
        }
        catch (e) {
            console.warn('Failed to load state', e);
            return false;
        }
    }
    serializeFolder(folder) {
        return {
            id: folder.id,
            name: folder.name,
            loaded: folder.loaded,
            folders: folder.folders.map(f => this.serializeFolder(f)),
            files: folder.files.map(file => ({
                id: file.id,
                name: file.name,
                type: file.type,
                size: file.size,
                content: file.content,
                description: file.description,
                createdAt: file.createdAt
            }))
        };
    }
    reconstructFromObject(obj) {
        let maxFileId = 0;
        let maxFolderId = 0;
        const walk = (o) => {
            const folder = new FolderItem({ name: o.name });
            folder.id = o.id;
            folder.loaded = !!o.loaded;
            const matchFolder = folder.id.match(/folder_(\d+)$/);
            if (matchFolder)
                maxFolderId = Math.max(maxFolderId, parseInt(matchFolder[1], 10));
            folder.folders = (o.folders || []).map((ch) => walk(ch));
            folder.files = (o.files || []).map((f) => {
                const file = new FileItem({ name: f.name, type: f.type, size: f.size, content: f.content, description: f.description });
                file.id = f.id;
                file.createdAt = f.createdAt || Date.now();
                const match = file.id.match(/file_(\d+)$/);
                if (match)
                    maxFileId = Math.max(maxFileId, parseInt(match[1], 10));
                return file;
            });
            return folder;
        };
        const root = walk(obj);
        return { root, maxFileId, maxFolderId };
    }
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
    search(query) {
        const q = query.trim().toLowerCase();
        if (!q)
            return [];
        const results = [];
        const walk = (folder, path) => {
            if (folder.name.toLowerCase().includes(q))
                results.push({ type: 'folder', item: folder, path });
            for (const file of folder.files)
                if (file.name.toLowerCase().includes(q))
                    results.push({ type: 'file', item: file, path });
            for (const f of folder.folders)
                walk(f, path + '/' + f.name);
        };
        walk(this.root, '/root');
        return results;
    }
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    notifyListeners() {
        this.listeners.forEach(listener => listener());
    }
}
export const dataStore = new DataStore();
