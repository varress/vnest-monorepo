// Generated using ClaudeCode. Code has been rechecked and altered.

import { WebStorageAdapter } from "@/database/webAdapter";

describe('WebStorageAdapter', () => {
    let adapter: WebStorageAdapter;

    beforeEach(() => {
        adapter = new WebStorageAdapter();
        jest.clearAllMocks();

        // Manually seed adapter with test data instead of relying on dynamic import
        (adapter as any).data = {
            Agent: [
                { id: 0, value: 'minä', type: 'Agent' },
                { id: 1, value: 'sinä', type: 'Agent' }
            ],
            Patient: [
                { id: 0, value: 'kirjan', type: 'Patient' },
                { id: 1, value: 'lehden', type: 'Patient' }
            ],
            Verb: [
                { id: 0, value: 'lukea', groupId: 0, groupName: 'Taso 1', type: 'Verb' },
                { id: 1, value: 'syödä', groupId: 1, groupName: 'Taso 2', type: 'Verb' }
            ],
            AgentVerbPatient_Trio: [
                { id: 0, verbId: 0, agentId: 0, patientId: 0, groupId: 0, type: 'AgentVerbPatient_Trio' }
            ]
        };
    });

    describe('query', () => {
        it('should query all items without filter', async () => {
            const result = await adapter.query('Agent');

            expect(result.length).toBe(2);
            expect(result[0]).toHaveProperty('type', 'Agent');
        });

        it('should query with filter', async () => {
            const result = await adapter.query('Verb', { groupId: 0 });

            expect(result.length).toBe(1);
            expect((result[0] as any).groupId).toBe(0);
        });

        it('should return empty array for non-matching filter', async () => {
            const result = await adapter.query('Verb', { groupId: 999 });

            expect(result).toEqual([]);
        });
    });

    describe('findById', () => {
        it('should find item by id', async () => {
            const result = await adapter.findById('Verb', 0);

            expect(result).not.toBeNull();
            expect(result).toHaveProperty('id', 0);
            expect(result).toHaveProperty('value', 'lukea');
        });

        it('should return null when item not found', async () => {
            const result = await adapter.findById('Agent', 999);

            expect(result).toBeNull();
        });
    });

    describe('insert', () => {
        it('should insert new item', async () => {
            const newAgent = { id: 100, value: 'New Agent', type: 'Agent' as const };

            const result = await adapter.insert('Agent', newAgent);

            expect(result).toEqual(newAgent);
        });

        it('should persist inserted item', async () => {
            const newAgent = { id: 100, value: 'New Agent', type: 'Agent' as const };

            await adapter.insert('Agent', newAgent);
            const found = await adapter.findById('Agent', 100);

            expect(found).toEqual(newAgent);
        });
    });

    describe('update', () => {
        it('should update existing item', async () => {
            const updateData = { value: 'Updated Verb' };

            const result = await adapter.update('Verb', 0, updateData);

            expect(result).not.toBeNull();
            expect(result).toHaveProperty('value', 'Updated Verb');
        });

        it('should return null when item not found', async () => {
            const result = await adapter.update('Agent', 999, { value: 'test' });

            expect(result).toBeNull();
        });
    });

    describe('delete', () => {
        it('should delete existing item', async () => {
            const result = await adapter.delete('Verb', 0);

            expect(result).toBe(true);

            const found = await adapter.findById('Verb', 0);
            expect(found).toBeNull();
        });

        it('should return false when item not found', async () => {
            const result = await adapter.delete('Agent', 999);

            expect(result).toBe(false);
        });
    });
});
