let fileIdCounter = 1;
export class FileItem {
    constructor(opts) {
        var _a, _b, _c, _d;
        this.id = `file_${fileIdCounter++}`;
        this.name = opts.name;
        this.type = (_a = opts.type) !== null && _a !== void 0 ? _a : '';
        this.size = (_b = opts.size) !== null && _b !== void 0 ? _b : 0;
        this.content = (_c = opts.content) !== null && _c !== void 0 ? _c : null;
        this.description = (_d = opts.description) !== null && _d !== void 0 ? _d : 'Нет описания';
        this.createdAt = Date.now();
    }
}
