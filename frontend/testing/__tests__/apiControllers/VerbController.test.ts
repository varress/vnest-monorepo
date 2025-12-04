// Generated using ClaudeCode. Code has been rechecked and altered.

import { VerbController } from                           "@/controllers/api_controllers/VerbController";
import { mockAPI, createAPIResponse, setupAPIMock } from "@/testing/__mocks__/apiMock";
import { createMockVerb, mockWordResponse } from         "@/testing/__helpers__/apiTestHelpers";

setupAPIMock();

describe('VerbController', () => {
    let controller: VerbController;

    beforeEach(() => {
        controller = new VerbController();
        jest.clearAllMocks();
    });

    describe('getRandomVerb', () => {
        it('should return a random verb from all verbs', async () => {
            mockAPI.mockResolvedValue(createAPIResponse(mockWordResponse([
                createMockVerb(1, "run"),
                createMockVerb(2, "jump"),
                createMockVerb(3, "kick")
            ])));

            const result = await controller.getRandomVerb();

            expect(result.type).toBe("Verb");
            expect([1, 2, 3]).toContain(result.id);
        });

        it('should return the only verb when only one exists', async () => {
            mockAPI.mockResolvedValue(createAPIResponse(mockWordResponse([
                createMockVerb(5, "walk")
            ])));

            const result = await controller.getRandomVerb();

            expect(result).toEqual({ id: 5, value: "walk", groupId: 0, groupName: "", type: "Verb" });
        });
    });

    describe('getAllVerbsByGroupId', () => {
        it('should return verbs filtered by groupId and sorted by id', async () => {
            mockAPI.mockResolvedValue(createAPIResponse(mockWordResponse([
                createMockVerb(3, "jump", 1),
                createMockVerb(1, "run",  1),
                createMockVerb(2, "walk", 2),
                createMockVerb(4, "kick", 1)
            ])));

            const result = await controller.getAllVerbsByGroupId(1);

            expect(result).toHaveLength(3);
            expect(result.map(v => v.id)).toEqual([1, 3, 4]);
            expect(result.every(v => v.groupId === 1)).toBe(true);
        });

        it('should return empty array when no verbs match groupId', async () => {
            mockAPI.mockResolvedValue(createAPIResponse(mockWordResponse([
                createMockVerb(1, "run",  1),
                createMockVerb(2, "walk", 2)
            ])));

            const result = await controller.getAllVerbsByGroupId(999);

            expect(result).toEqual([]);
        });

        it('should handle groupId 0 correctly', async () => {
            mockAPI.mockResolvedValue(createAPIResponse(mockWordResponse([
                createMockVerb(1, "run",  0),
                createMockVerb(2, "walk", 1)
            ])));

            const result = await controller.getAllVerbsByGroupId(0);

            expect(result).toHaveLength(1);
            expect(result[0].groupId).toBe(0);
        });

        it('should sort verbs by id in ascending order', async () => {
            mockAPI.mockResolvedValue(createAPIResponse(mockWordResponse([
                createMockVerb(5, "fifth",  2),
                createMockVerb(2, "second", 2),
                createMockVerb(8, "eighth", 2),
                createMockVerb(1, "first",  2)
            ])));

            const result = await controller.getAllVerbsByGroupId(2);

            expect(result.map(v => v.id)).toEqual([1, 2, 5, 8]);
        });
    });
});
