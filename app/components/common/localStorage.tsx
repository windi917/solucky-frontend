export function saveToLocalStorage(key, value) {
    if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value));
    }
}
export function getFromLocalStorage(key) {
    if (typeof window !== 'undefined') {
        const item = localStorage.getItem(key);

        if (!item) {
            return null;
        }

        return JSON.parse(item);
    }

    return null;
}