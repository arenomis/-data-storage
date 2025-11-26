export function generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
export function debounce(func, delay) {
    let timeoutId = null;
    return function (...args) {
        if (timeoutId !== null)
            clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => func(...args), delay);
    };
}
export function formatFileSize(bytes) {
    if (bytes === 0)
        return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
