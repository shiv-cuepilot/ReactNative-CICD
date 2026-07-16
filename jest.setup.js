/* eslint-env jest */

// The react-native preset exposes AppState as a getter, and Babel's ESM interop
// doesn't carry it through `import {AppState}`. Replace it with a plain data
// property so the update hook can subscribe on mount.
jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  Object.defineProperty(rn, 'AppState', {
    configurable: true,
    value: {
      currentState: 'active',
      addEventListener: jest.fn(() => ({ remove: jest.fn() })),
      removeEventListener: jest.fn(),
    },
  });
  return rn;
});
