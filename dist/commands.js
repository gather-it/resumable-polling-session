export function createCommands(maximum = 100) {
    if (!Number.isInteger(maximum) || maximum < 1)
        throw new RangeError('Invalid queue bound');
    const pending = new Map();
    let revision = 0;
    return {
        add(key, value, replace = false) {
            if (!key)
                throw new Error('Invalid command key');
            const old = pending.get(key);
            if (old && !replace)
                return;
            if (!old && pending.size >= maximum)
                throw new Error('Command capacity reached');
            pending.set(key, { key, value: structuredClone(value), revision: ++revision });
        },
        acknowledge(command) {
            if (pending.get(command.key)?.revision === command.revision)
                pending.delete(command.key);
        },
        snapshot: () => structuredClone([...pending.values()]),
        clear: () => pending.clear(),
    };
}
