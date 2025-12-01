// Generated using ClaudeCode. Code has been rechecked and altered.

const mockSetItem =    jest.fn();
const mockRemoveItem = jest.fn();

export const localStorageMock = {
    setItem:    mockSetItem,
    removeItem: mockRemoveItem
};

(global as any).localStorage = localStorageMock;