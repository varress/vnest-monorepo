// Generated using ClaudeCode. Code has been rechecked and altered.
export const mockAPI = jest.fn();

export const createAPIResponse = <T>(data: T, ok = true, status = 200) => ({
    ok,
    status,
    json:        async () => data,
    text:        async () => JSON.stringify(data),
    headers:     new Headers(),
    redirected:  false,
    statusText:  ok ? 'OK' : 'Error',
    type:        'basic' as ResponseType,
    url:         '',
    clone:       jest.fn(),
    body:        null,
    bodyUsed:    false,
    arrayBuffer: jest.fn(),
    blob:        jest.fn(),
    formData:    jest.fn(),
});

export const setupAPIMock = () => {
    global.fetch = mockAPI as any;
};

export const resetAPIMock = () => {
    mockAPI.mockReset();
};

export const clearAPIMock = () => {
    mockAPI.mockClear();
};
