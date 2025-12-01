// Generated using ClaudeCode. Code has been rechecked and altered.

import { AVPTrioController } from                        "@/controllers/api_controllers/AVPTrioController";
import { ApiResponse, ApiCombination } from              "@/database/schemas";
import { mockAPI, createAPIResponse, setupAPIMock } from "@/testing/__mocks__/apiMock";
import { createMockCombination } from                    "@/testing/__helpers__/apiTestHelpers";
import { API_URL } from                                  "@/config";

setupAPIMock();

describe('AVPTrioController', () => {
    let controller: AVPTrioController;

    const mockCombinationResponse = (combinations: ApiCombination[]): ApiResponse<ApiCombination> => ({
        success: true,
        data:    combinations
    });

    beforeEach(() => {
        controller = new AVPTrioController();
        jest.clearAllMocks();
    });

    describe('getById', () => {
        it('should fetch combination by id and return mapped trio', async () => {
            mockAPI.mockResolvedValue(createAPIResponse(mockCombinationResponse([
                createMockCombination(1, 10, 5, 20)
            ])));

            const result = await controller.getById(1);

            expect(mockAPI).toHaveBeenCalledWith(`${API_URL}/api/combinations/1`, { method: 'GET' });
            expect(result).toEqual({
                id:        1,
                agentId:   10,
                verbId:    5,
                patientId: 20,
                groupId:   0,
                type:      "AgentVerbPatient_Trio"
            });
        });

        it('should return null when fetch fails', async () => {
            mockAPI.mockResolvedValue(createAPIResponse(null, false, 404));

            const result = await controller.getById(999);

            expect(result).toBeNull();
        });

        it('should return null when API returns empty data', async () => {
            mockAPI.mockResolvedValue(createAPIResponse(mockCombinationResponse([])));

            const result = await controller.getById(1);

            expect(result).toBeNull();
        });
    });

    describe('getAll', () => {
        it('should fetch all combinations and return mapped trios', async () => {
            mockAPI.mockResolvedValue(createAPIResponse(mockCombinationResponse([
                createMockCombination(1, 10, 5, 20),
                createMockCombination(2, 11, 6, 21),
                createMockCombination(3, 12, 7, 22)
            ])));

            const result = await controller.getAll();

            expect(mockAPI).toHaveBeenCalledWith(`${API_URL}/api/combinations`, { method: 'GET' });
            expect(result).toHaveLength(3);
            expect(result.every(trio => trio.type === "AgentVerbPatient_Trio")).toBe(true);
        });

        it('should return empty array when fetch fails', async () => {
            mockAPI.mockResolvedValue(createAPIResponse(null, false, 500));

            const result = await controller.getAll();

            expect(result).toEqual([]);
        });
    });

    describe('GetRandomByVerbId', () => {
        it('should fetch combinations by verbId and return random subset', async () => {
            mockAPI.mockResolvedValue(createAPIResponse(mockCombinationResponse([
                createMockCombination(1, 10, 5, 20),
                createMockCombination(2, 11, 5, 21),
                createMockCombination(3, 12, 5, 22),
                createMockCombination(4, 13, 5, 23),
                createMockCombination(5, 14, 5, 24)
            ])));

            const result = await controller.GetRandomByVerbId(5, 3);

            expect(mockAPI).toHaveBeenCalledWith(`${API_URL}/api/combinations?verb_id=5`, { method: 'GET' });
            expect(result).toHaveLength(3);
            expect(result.every(trio => trio.verbId === 5)).toBe(true);
        });

        it('should return all combinations when count is undefined', async () => {
            mockAPI.mockResolvedValue(createAPIResponse(mockCombinationResponse([
                createMockCombination(1, 10, 5, 20),
                createMockCombination(2, 11, 5, 21)
            ])));

            const result = await controller.GetRandomByVerbId(5);

            expect(result).toHaveLength(2);
        });

        it('should return empty array when fetch fails', async () => {
            mockAPI.mockResolvedValue(createAPIResponse(null, false, 500));

            const result = await controller.GetRandomByVerbId(5, 3);

            expect(result).toEqual([]);
        });
    });

    describe('IsCorrectCombination', () => {
        it('should validate correct combination and return true', async () => {
            mockAPI.mockResolvedValue(createAPIResponse({
                success: true,
                data:    [{ valid: true, sentence: "Subject runs Object", message: "Correct!" }]
            }));

            const result = await controller.IsCorrectCombination(10, 5, 20);

            expect(mockAPI).toHaveBeenCalledWith(
                `${API_URL}/api/suggestions/validate`,
                {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify({ agentId: 10, verbId: 5, patientId: 20 })
                }
            );
            expect(result).toBe(true);
        });

        it('should validate incorrect combination and return false', async () => {
            mockAPI.mockResolvedValue(createAPIResponse({
                success: true,
                data:    [{ valid: false, sentence: "", message: "Invalid combination" }]
            }));

            const result = await controller.IsCorrectCombination(10, 5, 99);

            expect(result).toBe(false);
        });

        it('should return false when fetch fails', async () => {
            mockAPI.mockResolvedValue(createAPIResponse(null, false, 500));

            const result = await controller.IsCorrectCombination(10, 5, 20);

            expect(result).toBe(false);
        });
    });

    describe('GetIdByAgentVerbPatient', () => {
        it('should find trio id by agent, verb, and patient ids', async () => {
            mockAPI.mockResolvedValue(createAPIResponse(mockCombinationResponse([
                createMockCombination(1, 10, 5, 20),
                createMockCombination(2, 11, 5, 21),
                createMockCombination(3, 12, 5, 22)
            ])));

            const result = await controller.GetIdByAgentVerbPatient(11, 5, 21);

            expect(mockAPI).toHaveBeenCalledWith(`${API_URL}/api/combinations?verb_id=5`, { method: 'GET' });
            expect(result).toBe(2);
        });

        it('should return -1 when combination not found', async () => {
            mockAPI.mockResolvedValue(createAPIResponse(mockCombinationResponse([
                createMockCombination(1, 10, 5, 20)
            ])));

            const result = await controller.GetIdByAgentVerbPatient(99, 5, 99);

            expect(result).toBe(-1);
        });

        it('should return -1 when fetch fails', async () => {
            mockAPI.mockResolvedValue(createAPIResponse(null, false, 500));

            const result = await controller.GetIdByAgentVerbPatient(10, 5, 20);

            expect(result).toBe(-1);
        });

        it('should match only when both agentId and patientId match', async () => {
            mockAPI.mockResolvedValue(createAPIResponse(mockCombinationResponse([
                createMockCombination(1, 10, 5, 20),
                createMockCombination(2, 10, 5, 21),
                createMockCombination(3, 11, 5, 20)
            ])));

            const result = await controller.GetIdByAgentVerbPatient(10, 5, 21);

            expect(result).toBe(2);
        });
    });
});
