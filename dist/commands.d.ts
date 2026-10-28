import type { Command } from './types.js';
export declare function createCommands<T>(maximum?: number): {
    add(key: string, value: T, replace?: boolean): void;
    acknowledge(command: Command<T>): void;
    snapshot: () => Command<T>[];
    clear: () => void;
};
