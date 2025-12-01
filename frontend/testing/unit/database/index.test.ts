// Generated using ClaudeCode. Code has been rechecked and altered.

import { realmAdapterMock } from "@/testing/__mocks__/databaseAdapterMocks";
import { database } from         "@/database";

describe('DatabaseManager', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (database as any).adapter = null;
    });

    describe('initialize', () => {
        it('should initialize the selected adapter', async () => {
            realmAdapterMock.initialize.mockResolvedValue(undefined);

            await database.initialize();

            expect(realmAdapterMock.initialize).toHaveBeenCalled();
        });
    });

    describe('query', () => {
        it('should delegate query to the selected adapter', async () => {
            const mockData = [{ id: 1, value: 'test' }];
            realmAdapterMock.query.mockResolvedValue(mockData);

            const result = await database.query('Agent');

            expect(realmAdapterMock.query).toHaveBeenCalledWith('Agent', undefined);
            expect(result).toEqual(mockData);
        });

        it('should pass filter to adapter', async () => {
            const filter = { groupId: 1 };
            realmAdapterMock.query.mockResolvedValue([]);

            await database.query('Verb', filter);

            expect(realmAdapterMock.query).toHaveBeenCalledWith('Verb', filter);
        });
    });

    describe('findById', () => {
        it('should delegate findById to the selected adapter', async () => {
            const mockItem = { id: 1, value: 'test' };
            realmAdapterMock.findById.mockResolvedValue(mockItem);

            const result = await database.findById('Agent', 1);

            expect(realmAdapterMock.findById).toHaveBeenCalledWith('Agent', 1);
            expect(result).toEqual(mockItem);
        });

        it('should return null when item not found', async () => {
            realmAdapterMock.findById.mockResolvedValue(null);

            const result = await database.findById('Agent', 999);

            expect(result).toBeNull();
        });
    });

    describe('insert', () => {
        it('should delegate insert to the selected adapter', async () => {
            const newItem = { id: 1, value: 'new agent', type: 'Agent' as const };
            realmAdapterMock.insert.mockResolvedValue(newItem);

            const result = await database.insert('Agent', newItem);

            expect(realmAdapterMock.insert).toHaveBeenCalledWith('Agent', newItem);
            expect(result).toEqual(newItem);
        });
    });

    describe('update', () => {
        it('should delegate update to the selected adapter', async () => {
            const updateData = { value: 'updated' };
            const updatedItem = { id: 1, value: 'updated', type: 'Agent' as const };
            realmAdapterMock.update.mockResolvedValue(updatedItem);

            const result = await database.update('Agent', 1, updateData);

            expect(realmAdapterMock.update).toHaveBeenCalledWith('Agent', 1, updateData);
            expect(result).toEqual(updatedItem);
        });
    });

    describe('delete', () => {
        it('should delegate delete to the selected adapter', async () => {
            realmAdapterMock.delete.mockResolvedValue(true);

            const result = await database.delete('Agent', 1);

            expect(realmAdapterMock.delete).toHaveBeenCalledWith('Agent', 1);
            expect(result).toBe(true);
        });

        it('should return false when item not found', async () => {
            realmAdapterMock.delete.mockResolvedValue(false);

            const result = await database.delete('Agent', 999);

            expect(result).toBe(false);
        });
    });
});
