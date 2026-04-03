export function cloneData(data) {
    return JSON.parse(JSON.stringify(data));
}

export function makeId(prefix = "ID") {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function unique(items) {
    return [...new Set(items)];
}

export function todayISO() {
    return new Date().toISOString().slice(0, 10);
}
