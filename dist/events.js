export function emit(observer, event) {
    try {
        observer?.(Object.freeze({ ...event }));
    }
    catch { /* Observer isolation. */ }
}
