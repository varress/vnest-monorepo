// Generated using ClaudeCode. Code has been rechecked and altered.

import { PatientController } from                        "@/controllers/api_controllers/PatientController";
import { mockAPI, createAPIResponse, setupAPIMock } from "@/testing/__mocks__/apiMock";
import { createMockCombination, createMockPatient } from "@/testing/__helpers__/apiTestHelpers";
import { API_URL } from                                  "@/config";

setupAPIMock();

describe('PatientController', () => {
    let controller: PatientController;

    beforeEach(() => {
        controller = new PatientController();
        jest.clearAllMocks();
    });

    describe('getByVerbId', () => {

        it('should fetch combinations and return random patients for verbId', async () => {
            const verbId = 5;
            mockAPI.mockResolvedValueOnce(createAPIResponse({
                success: true,
                data:    [createMockCombination(1, 100, 5, 20), createMockCombination(2, 200, 5, 21), createMockCombination(3, 300, 5, 22)]
            }));
            mockAPI.mockResolvedValueOnce(createAPIResponse(createMockPatient(20)));
            mockAPI.mockResolvedValueOnce(createAPIResponse(createMockPatient(21)));

            const result = await controller.getByVerbId(verbId, 2);

            expect(mockAPI).toHaveBeenCalledWith(`${API_URL}/api/combinations?verb_id=${verbId}`, { method: 'GET' });
            expect(result).toHaveLength(2);
            expect(result.every(patient => patient.type === "Patient")).toBe(true);
        });

        it('should use default count of 3 when count not specified', async () => {
            mockAPI.mockResolvedValueOnce(createAPIResponse({
                success: true,
                data:    [1, 2, 3, 4, 5].map(i => createMockCombination(i, i * 100, 5, 20 + i))
            }));
            [20, 21, 22].forEach(id => mockAPI.mockResolvedValueOnce(createAPIResponse(createMockPatient(id))));

            const result = await controller.getByVerbId(5);

            expect(result).toHaveLength(3);
        });

        it('should filter out duplicate object IDs', async () => {
            mockAPI.mockResolvedValueOnce(createAPIResponse({
                success: true,
                data:    [createMockCombination(1, 100, 5, 20), createMockCombination(2, 200, 5, 20), createMockCombination(3, 300, 5, 21)]
            }));
            mockAPI.mockResolvedValueOnce(createAPIResponse(createMockPatient(20)));
            mockAPI.mockResolvedValueOnce(createAPIResponse(createMockPatient(21)));

            const result = await controller.getByVerbId(5, 2);

            expect(result).toHaveLength(2);
            const patientIds = result.map(p => p.id);
            expect(patientIds.filter(id => id === 20).length).toBeLessThanOrEqual(1);
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

        it('should filter out null patients when getById fails', async () => {
            mockAPI.mockResolvedValueOnce(createAPIResponse({
                success: true,
                data:    [createMockCombination(1, 100, 5, 20), createMockCombination(2, 200, 5, 21)]
            }));
            mockAPI.mockResolvedValueOnce(createAPIResponse(createMockPatient(20)));
            mockAPI.mockResolvedValueOnce(createAPIResponse(null, false, 404));

            const result = await controller.getByVerbId(5, 2);

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe(20);
        });

        it('should map API response to Patient type correctly', async () => {
            mockAPI.mockResolvedValueOnce(createAPIResponse({
                success: true,
                data:    [createMockCombination(1, 100, 7, 30)]
            }));
            mockAPI.mockResolvedValueOnce(createAPIResponse(createMockPatient(30)));

            const result = await controller.getByVerbId(7, 1);

            expect(result[0]).toEqual({ id: 30, value: "Object 30", type: "Patient" });
        });
    });
});
