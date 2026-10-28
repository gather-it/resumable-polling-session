import {createSession, type PollingSession, type SessionOptions} from '../src/index.js';

type Scope = {taskId: string};
type Request = {taskId: string; cursor: number; refresh?: boolean};
type Response = {done: boolean};
type Command = {kind: 'refresh'};

const options: SessionOptions<Scope, Request, Response, number, Command> = {
  scope: {taskId: 'sample-task'},
  cursor: 0,
  protocol: {
    select: state => {
      const command = state.commands[0];
      if (command) return {
        request: {taskId: state.scope.taskId, cursor: state.cursor, refresh: true},
        command,
      };
      return state.complete ? undefined : {
        request: {taskId: state.scope.taskId, cursor: state.cursor},
        waitsForCadence: !state.initial,
        interruptible: true,
      };
    },
    advance: (cursor, response) => ({cursor: cursor + 1, complete: response.done}),
  },
  operation: async (_request, signal) => {
    signal.throwIfAborted();
    return {done: true};
  },
  onResponse: _response => {},
};

export const session: PollingSession<number, Command> = createSession(options);
// This example is typechecked during CI; importing it does not start work.
