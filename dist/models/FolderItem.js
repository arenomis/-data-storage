let folderIdCounter = 1;
export class FolderItem {
    constructor(opts = {}) {
        var _a;
        this.id = `folder_${folderIdCounter++}`;
        this.name = (_a = opts.name) !== null && _a !== void 0 ? _a : 'Новая папка';
        this.folders = [];
        this.files = [];
        this.loaded = false;
    }
    // For persistence: allow setting the next id counter
    static setCounter(next) {
        folderIdCounter = next;
    }
}
