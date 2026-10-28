import {createSession, type PollingSession, type SessionOptions} from '../../src/index.js';

type Options = SessionOptions<{id: string}, {cursor: number}, {done: boolean}, number, {kind: 'refresh'}>;
const options: Options = {
  scope: {id: 'sample'}, cursor: 0,
  protocol: {
    select: state => state.complete ? undefined : {request: {cursor: state.cursor}},
    advance: (cursor, response) => ({cursor: cursor + 1, complete: response.done}),
  },
  operation: async () => ({done: true}),
  onResponse: () => {},
};
const session: PollingSession<number, {kind: 'refresh'}> = createSession(options);
session.enqueue('refresh', {kind: 'refresh'});
const cursor: number = session.snapshot().cursor;
void cursor;
// @ts-expect-error Commands must match the declared command type.
session.enqueue('refresh', {kind: 'different'});
// @ts-expect-error The public cursor is not a string.
const wrongCursor: string = session.snapshot().cursor;
void wrongCursor;
