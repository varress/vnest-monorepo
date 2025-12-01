// Generated using ClaudeCode. Code has been rechecked and altered.

import { AgentController } from                          "@/controllers/api_controllers/AgentController";
import { mockAPI, createAPIResponse, setupAPIMock } from "@/testing/__mocks__/apiMock";
import { createMockCombination, createMockAgent } from   "@/testing/__helpers__/apiTestHelpers";
import { API_URL } from                                  "@/config";

setupAPIMock();

describe('AgentController', () => {
    let controller: AgentController;

    beforeEach(() => {
        controller = new AgentController();
        jest.clearAllMocks();
    });

    describe('getByVerbId', () => {

        it('should fetch combinations and return random agents for verbId', async () => {
            const verbId = 5;
            mockAPI.mockResolvedValueOnce(createAPIResponse({
                success: true,
                data:    [createMockCombination(1, 10), createMockCombination(2, 11), createMockCombination(3, 12)]
            }));
            mockAPI.mockResolvedValueOnce(createAPIResponse(createMockAgent(10)));
            mockAPI.mockResolvedValueOnce(createAPIResponse(createMockAgent(11)));

            const result = await controller.getByVerbId(verbId, 2);

            expect(mockAPI).toHaveBeenCalledWith(`${API_URL}/api/combinations?verb_id=${verbId}`, { method: 'GET' });
            expect(result).toHaveLength(2);
            expect(result.every(agent => agent.type === "Agent")).toBe(true);
        });

        it('should use default count of 3 when count not specified', async () => {
            mockAPI.mockResolvedValueOnce(createAPIResponse({
                success: true,
                data:    [1, 2, 3, 4, 5].map(i => createMockCombination(i, 10 + i))
            }));
            [10, 11, 12].forEach(id => mockAPI.mockResolvedValueOnce(createAPIResponse(createMockAgent(id))));

            const result = await controller.getByVerbId(5);

            expect(result).toHaveLength(3);
        });

        it('should filter out duplicate subject IDs', async () => {
            mockAPI.mockResolvedValueOnce(createAPIResponse({
                success: true,
                data:    [createMockCombination(1, 10), createMockCombination(2, 10), createMockCombination(3, 11)]
            }));
            mockAPI.mockResolvedValueOnce(createAPIResponse(createMockAgent(10)));
            mockAPI.mockResolvedValueOnce(createAPIResponse(createMockAgent(11)));

            const result = await controller.getByVerbId(5, 2);

            expect(result).toHaveLength(2);
            const agentIds = result.map(a => a.id);
            expect(agentIds.filter(id => id === 10).length).toBeLessThanOrEqual(1);
        });

        it('should return empty array when no combinations found', async () => {
            mockAPI.mockResolvedValueOnce(createAPIResponse({ success: true, data: [] }));

            const result = await controller.getByVerbId(999, 3);

            expect(result).toEqual([]);
        });

        it('should return empty array when fetch fails', async () => {
            mockAPI.mockResolvedValueOnce(createAPIResponse(null, false, 500));

            const result = await controller.getByVerbId(5, 3);

            expect(result).toEqual([]);
        });

        it('should filter out null agents when getById fails', async () => {
            mockAPI.mockResolvedValueOnce(createAPIResponse({
                success: true,
                data:    [createMockCombination(1, 10), createMockCombination(2, 11)]
            }));
            mockAPI.mockResolvedValueOnce(createAPIResponse(createMockAgent(10)));
            mockAPI.mockResolvedValueOnce(createAPIResponse(null, false, 404));

            const result = await controller.getByVerbId(5, 2);

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe(10);
        });

        it('should map API response to Agent type correctly', async () => {
            mockAPI.mockResolvedValueOnce(createAPIResponse({
                success: true,
                data:    [createMockCombination(1, 50, 7)]
            }));
            mockAPI.mockResolvedValueOnce(createAPIResponse(createMockAgent(50)));

            const result = await controller.getByVerbId(7, 1);

            expect(result[0]).toEqual({ id: 50, value: "Subject 50", type: "Agent" });
        });
    });
});
