import type {Command} from './types.js';
export function createCommands<T>(maximum = 100) {
  if (!Number.isInteger(maximum) || maximum < 1) throw new RangeError('Invalid queue bound');
  const pending = new Map<string, Command<T>>();
  let revision = 0;
  return {
    add(key: string, value: T, replace = false) {
      if (!key) throw new Error('Invalid command key');
      const old = pending.get(key);
      if (old && !replace) return;
      if (!old && pending.size >= maximum) throw new Error('Command capacity reached');
      pending.set(key, {key, value: structuredClone(value), revision: ++revision});
    },
    acknowledge(command: Command<T>) {
      if (pending.get(command.key)?.revision === command.revision) pending.delete(command.key);
    },
    snapshot: () => structuredClone([...pending.values()]),
    clear: () => pending.clear(),
  };
}
