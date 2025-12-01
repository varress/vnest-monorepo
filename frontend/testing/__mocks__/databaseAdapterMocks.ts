// Generated using ClaudeCode. Code has been rechecked and altered.

const mockRealmAdapterInitialize = jest.fn();
const mockRealmAdapterQuery =      jest.fn();
const mockRealmAdapterFindById =   jest.fn();
const mockRealmAdapterInsert =     jest.fn();
const mockRealmAdapterUpdate =     jest.fn();
const mockRealmAdapterDelete =     jest.fn();

export class MockRealmAdapter {
    initialize = mockRealmAdapterInitialize;
    query =      mockRealmAdapterQuery;
    findById =   mockRealmAdapterFindById;
    insert =     mockRealmAdapterInsert;
    update =     mockRealmAdapterUpdate;
    delete =     mockRealmAdapterDelete;
}

jest.mock('@/database/realmAdapter', () => ({
    RealmAdapter: MockRealmAdapter
}));

export const realmAdapterMock = {
    initialize: mockRealmAdapterInitialize,
    query:      mockRealmAdapterQuery,
    findById:   mockRealmAdapterFindById,
    insert:     mockRealmAdapterInsert,
    update:     mockRealmAdapterUpdate,
    delete:     mockRealmAdapterDelete
};
