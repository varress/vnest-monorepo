// Generated using ClaudeCode. Code has been rechecked and altered.

import { databaseMock } from   "@/testing/__mocks__/databaseMock";
import { VerbController } from "@/controllers/realm_controllers/VerbController";
import { Verb } from           "@/database/schemas";

describe('VerbController', () => {
    let controller: VerbController;

    beforeEach(() => {
        controller = new VerbController();
        jest.clearAllMocks();
    });

    describe('getRandomVerb', () => {
        it('should return a single random verb from all verbs', async () => {
            const mockVerbs: Verb[] = [
                { id: 1, value: "run",  groupId: 1, groupName: "Group 1", type: "Verb" },
                { id: 2, value: "jump", groupId: 1, groupName: "Group 1", type: "Verb" },
                { id: 3, value: "walk", groupId: 2, groupName: "Group 2", type: "Verb" }
            ];
            databaseMock.query.mockResolvedValue(mockVerbs);

            const result = await controller.getRandomVerb();

            expect(databaseMock.query).toHaveBeenCalledWith('Verb');
            expect(result).toBeDefined();
            expect(mockVerbs).toContainEqual(result);
            expect(result.type).toBe("Verb");
        });

        it('should return the only verb when only one exists', async () => {
            const mockVerbs: Verb[] = [
                { id: 1, value: "run", groupId: 1, groupName: "Group 1", type: "Verb" }
            ];
            databaseMock.query.mockResolvedValue(mockVerbs);

            const result = await controller.getRandomVerb();

            expect(result).toEqual(mockVerbs[0]);
        });
    });

    describe('getAllVerbsByGroupId', () => {
        it('should return verbs filtered by groupId and sorted by id', async () => {
            const mockVerbs: Verb[] = [
                { id: 5, value: "eat",   groupId: 2, groupName: "Group 2", type: "Verb" },
                { id: 1, value: "run",   groupId: 1, groupName: "Group 1", type: "Verb" },
                { id: 3, value: "walk",  groupId: 1, groupName: "Group 1", type: "Verb" },
                { id: 2, value: "jump",  groupId: 1, groupName: "Group 1", type: "Verb" },
                { id: 4, value: "sleep", groupId: 2, groupName: "Group 2", type: "Verb" }
            ];
            databaseMock.query.mockResolvedValue(mockVerbs);

            const result = await controller.getAllVerbsByGroupId(1);

            expect(databaseMock.query).toHaveBeenCalledWith('Verb');
            expect(result).toHaveLength(3);
            expect(result).toEqual([
                { id: 1, value: "run",  groupId: 1, groupName: "Group 1", type: "Verb" },
                { id: 2, value: "jump", groupId: 1, groupName: "Group 1", type: "Verb" },
                { id: 3, value: "walk", groupId: 1, groupName: "Group 1", type: "Verb" }
            ]);
        });

        it('should return empty array when no verbs match groupId', async () => {
            const mockVerbs: Verb[] = [
                { id: 1, value: "run",  groupId: 1, groupName: "Group 1", type: "Verb" },
                { id: 2, value: "jump", groupId: 1, groupName: "Group 1", type: "Verb" }
            ];
            databaseMock.query.mockResolvedValue(mockVerbs);

            const result = await controller.getAllVerbsByGroupId(999);

            expect(result).toEqual([]);
        });

        it('should return verbs in ascending order by id', async () => {
            const mockVerbs: Verb[] = [
                { id: 10, value: "verb10", groupId: 5, groupName: "Group 5", type: "Verb" },
                { id: 3,  value: "verb3",  groupId: 5, groupName: "Group 5", type: "Verb" },
                { id: 7,  value: "verb7",  groupId: 5, groupName: "Group 5", type: "Verb" },
                { id: 1,  value: "verb1",  groupId: 5, groupName: "Group 5", type: "Verb" }
            ];
            databaseMock.query.mockResolvedValue(mockVerbs);

            const result = await controller.getAllVerbsByGroupId(5);

            expect(result.map(v => v.id)).toEqual([1, 3, 7, 10]);
        });

        it('should handle groupId with single verb', async () => {
            const mockVerbs: Verb[] = [
                { id: 1, value: "run",    groupId: 1,  groupName: "Group 1",  type: "Verb" },
                { id: 2, value: "unique", groupId: 99, groupName: "Group 99", type: "Verb" }
            ];
            databaseMock.query.mockResolvedValue(mockVerbs);

            const result = await controller.getAllVerbsByGroupId(99);

            expect(result).toHaveLength(1);
            expect(result[0]).toEqual({ id: 2, value: "unique", groupId: 99, groupName: "Group 99", type: "Verb" });
        });

        it('should handle groupId 0', async () => {
            const mockVerbs: Verb[] = [
                { id: 1, value: "verb1", groupId: 0, groupName: "Group 0", type: "Verb" },
                { id: 2, value: "verb2", groupId: 1, groupName: "Group 1", type: "Verb" }
            ];
            databaseMock.query.mockResolvedValue(mockVerbs);

            const result = await controller.getAllVerbsByGroupId(0);

            expect(result).toHaveLength(1);
            expect(result[0].groupId).toBe(0);
        });
    });

    describe('schemaName and jsonFileName', () => {
        it('should have correct schemaName', () => {
            expect(controller.schemaName).toBe('Verb');
        });

        it('should have correct jsonFileName', () => {
            expect(controller.jsonFileName).toBe('verbs');
        });
    });
});
