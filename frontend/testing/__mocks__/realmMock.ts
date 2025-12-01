// Generated using ClaudeCode. Code has been rechecked and altered.

const mockWrite = jest.fn((callback: () => void) => {
    callback();
});

const mockFiltered =            jest.fn();
const mockObjects =             jest.fn();
const mockObjectForPrimaryKey = jest.fn();
const mockCreate =              jest.fn();
const mockDelete =              jest.fn();

export const mockRealm = {
    write:               mockWrite,
    objects:             mockObjects,
    objectForPrimaryKey: mockObjectForPrimaryKey,
    create:              mockCreate,
    delete:              mockDelete
};

export const mockRealmInstance = {
    write:               mockWrite,
    objects:             mockObjects,
    objectForPrimaryKey: mockObjectForPrimaryKey,
    create:              mockCreate,
    delete:              mockDelete
};

export const mockRealmOpen = jest.fn().mockResolvedValue(mockRealmInstance);

export const mockRealmResults = (items: any[]) => {
    const results =    items as any;
    results.filtered = mockFiltered;
    mockFiltered.mockReturnValue(items);
    return results;
};

jest.mock('@/database/realm.native', () => ({
    realmConfig: {
        schema:        [],
        schemaVersion: 1
    }
}));

jest.mock('@/database/seedRealm', () => ({
    seedRealm: jest.fn().mockResolvedValue(undefined)
}));

export const realmMock = {
    open:                mockRealmOpen,
    instance:            mockRealmInstance,
    write:               mockWrite,
    objects:             mockObjects,
    objectForPrimaryKey: mockObjectForPrimaryKey,
    create:              mockCreate,
    delete:              mockDelete,
    filtered:            mockFiltered,
    createResults:       mockRealmResults
};
