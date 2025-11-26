// Generated using ClaudeCode. Code has been rechecked and altered.

const mockFindById = jest.fn();
const mockQuery =    jest.fn();
const mockInsert =   jest.fn();

export const databaseMock = {
    findById: mockFindById,
    query:    mockQuery,
    insert:   mockInsert
};

jest.mock('@/database', () => ({
    database: {
        findById: mockFindById,
        query:    mockQuery,
        insert:   mockInsert
    }
}));