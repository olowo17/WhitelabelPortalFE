import appReducer, { setUser, AppSliceState } from './appSlice';

describe('app reducer', () => {
  const initialState: AppSliceState = {
    user: undefined,
    status: 'idle',
  };

  it('should handle initial state', () => {
    expect(appReducer(undefined, { type: 'unknown' })).toEqual({
      user: undefined,
      status: 'idle',
    });
  });

  it('should handle setUser', () => {
    const actual = appReducer(initialState, setUser({ name: 'Mary', email: 'mary@example.com', lastSeen: 123456 }));
    expect(actual.user).toEqual({
      name: 'Mary',
      email: 'mary@example.com',
      lastSeen: 123456,
    });

    const changed = appReducer(initialState, setUser(undefined));
    expect(changed.user).toEqual(undefined);
  });
});
