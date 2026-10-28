export type Mode = 'idle' | 'active' | 'paused' | 'failed' | 'disposed';
export interface Command<T> {key: string; value: T; revision: number}
export interface Work<Request, Value> {request: Request; command?: Command<Value>; waitsForCadence?: boolean; interruptible?: boolean}
export interface Selection<Scope, Cursor, Value> {
  scope: Scope; cursor: Cursor; initial: boolean; complete: boolean; commands: readonly Command<Value>[];
}
export interface Protocol<Scope, Request, Response, Cursor, Value> {
  select: (state: Selection<Scope, Cursor, Value>) => Work<Request, Value> | undefined;
  advance: (cursor: Cursor, response: Response) => {cursor: Cursor; complete: boolean; pollAfterMs?: number};
}
export interface PollEvent {type: 'started' | 'retry' | 'delivered'; requestId: number; attempt?: number; delayMs?: number}
export interface SessionSnapshot<Cursor, Value> {
  mode: Mode;
  cursor: Cursor;
  complete: boolean;
  pending: Command<Value>[];
}
export interface PollingSession<Cursor, Value> {
  resume(): void;
  pause(): void;
  dispose(): void;
  enqueue(key: string, value: Value, replace?: boolean): void;
  snapshot(): SessionSnapshot<Cursor, Value>;
}
export interface SessionOptions<Scope, Request, Response, Cursor, Value> {
  scope: Scope; cursor: Cursor; protocol: Protocol<Scope, Request, Response, Cursor, Value>;
  operation: (request: Request, signal: AbortSignal) => Promise<Response>;
  onResponse: (response: Response) => void | Promise<void>;
  onError?: (error: Error) => void; onEvent?: (event: PollEvent) => void;
  now?: () => number; delay?: (ms: number, signal: AbortSignal) => Promise<void>;
  retry?: {maxAttempts: number; shouldRetry: (error: unknown) => boolean; delayMs: (attempt: number) => number};
  maxPendingCommands?: number;
}
