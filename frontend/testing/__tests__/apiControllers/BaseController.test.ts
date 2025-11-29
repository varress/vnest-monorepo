// Generated using ClaudeCode. Code has been rechecked and altered.

import { BaseController } from                                "@/controllers/api_controllers/BaseController";
import { Agent, Verb, Patient } from                          "@/database/schemas";
import { mockAPI, createAPIResponse, setupAPIMock } from      "@/testing/__mocks__/apiMock";
import { createMockWord, mockWordResponse } from              "@/testing/__helpers__/apiTestHelpers";
import { API_URL } from                                       "@/config";

class TestController extends BaseController<Agent> {
    constructor() {
        super("Agent", "SUBJECT");
    }
}

setupAPIMock();

describe('BaseController', () => {
    let controller: TestController;

    beforeEach(() => {
        controller = new TestController();
        jest.clearAllMocks();
    });

    describe('getById', () => {
        it('should fetch word by id and return mapped UI word', async () => {
            mockAPI.mockResolvedValue(createAPIResponse(mockWordResponse([createMockWord(1, "Test Agent", "SUBJECT")])));

            const result = await controller.getById(1);

            expect(mockAPI).toHaveBeenCalledWith(`${API_URL}/api/words/1`, { method: 'GET' });
            expect(result).toEqual({ id: 1, value: "Test Agent", type: "Agent" });
        });

        it('should return null when fetch fails', async () => {
            mockAPI.mockResolvedValue(createAPIResponse(null, false, 404));

            const result = await controller.getById(999);

            expect(result).toBeNull();
        });

        it('should return null when API returns empty data array', async () => {
            mockAPI.mockResolvedValue(createAPIResponse(mockWordResponse([])));

            const result = await controller.getById(1);

            expect(result).toBeNull();
        });

        it('should handle Verb type correctly', async () => {
            const verbController = new (class extends BaseController<Verb> {
                constructor() { super("Verb", "VERB"); }
            })();
            mockAPI.mockResolvedValue(createAPIResponse(mockWordResponse([createMockWord(5, "run", "VERB", 2)])));

            const result = await verbController.getById(5);

            expect(result).toEqual({ id: 5, value: "run", groupId: 2, groupName: "", type: "Verb" });
        });

        it('should handle Patient type correctly', async () => {
            const patientController = new (class extends BaseController<Patient> {
                constructor() { super("Patient", "OBJECT"); }
            })();
            mockAPI.mockResolvedValue(createAPIResponse(mockWordResponse([createMockWord(10, "ball", "OBJECT")])));

            const result = await patientController.getById(10);

            expect(result).toEqual({ id: 10, value: "ball", type: "Patient" });
        });
    });

    describe('getAll', () => {
        it('should fetch all words of the specified type and filter correctly', async () => {
            mockAPI.mockResolvedValue(createAPIResponse(mockWordResponse([
                createMockWord(1, "Agent 1", "SUBJECT"),
                createMockWord(2, "Agent 2", "SUBJECT"),
                createMockWord(3, "Agent 3", "SUBJECT")
            ])));

            const result = await controller.getAll();

            expect(mockAPI).toHaveBeenCalledWith(`${API_URL}/api/words?type=SUBJECT`, { method: 'GET' });
            expect(result).toHaveLength(3);
            expect(result.every(w => w.type === "Agent")).toBe(true);
        });

        it('should return empty array when fetch fails', async () => {
            mockAPI.mockResolvedValue(createAPIResponse(null, false, 500));

            const result = await controller.getAll();

            expect(result).toEqual([]);
        });

        it('should return empty array when API returns empty data', async () => {
            mockAPI.mockResolvedValue(createAPIResponse(mockWordResponse([])));

            const result = await controller.getAll();

            expect(result).toEqual([]);
        });

        it('should filter out words that do not match the controller type', async () => {
            mockAPI.mockResolvedValue(createAPIResponse(mockWordResponse([
                createMockWord(1, "Agent 1", "SUBJECT"),
                createMockWord(2, "Verb 1",  "VERB"),
                createMockWord(3, "Agent 2", "SUBJECT")
            ])));

            const result = await controller.getAll();

            expect(result).toHaveLength(2);
            expect(result.every(w => w.type === "Agent")).toBe(true);
            expect(result.map(w => w.id)).toEqual([1, 3]);
        });

        it('should use correct API_type for Verb controller', async () => {
            const verbController = new (class extends BaseController<Verb> {
                constructor() { super("Verb", "VERB"); }
            })();
            mockAPI.mockResolvedValue(createAPIResponse(mockWordResponse([])));

            await verbController.getAll();

            expect(mockAPI).toHaveBeenCalledWith(`${API_URL}/api/words?type=VERB`, { method: 'GET' });
        });

        it('should use correct API_type for Patient controller', async () => {
            const patientController = new (class extends BaseController<Patient> {
                constructor() { super("Patient", "OBJECT"); }
            })();
            mockAPI.mockResolvedValue(createAPIResponse(mockWordResponse([])));

            await patientController.getAll();

            expect(mockAPI).toHaveBeenCalledWith(`${API_URL}/api/words?type=OBJECT`, { method: 'GET' });
        });
    });

    describe('getRandomElements', () => {
        it('should return requested number of random elements', () => {
            const result = (controller as any).getRandomElements([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3);

            expect(result).toHaveLength(3);
            expect(result.every((item: number) => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].includes(item))).toBe(true);
        });

        it('should return all elements when count exceeds array length', () => {
            const result = (controller as any).getRandomElements([1, 2, 3], 10);

            expect(result).toHaveLength(3);
        });

        it('should return empty array when input array is empty', () => {
            const result = (controller as any).getRandomElements([], 5);

            expect(result).toEqual([]);
        });

        it('should not modify original array', () => {
            const array =         [1, 2, 3, 4, 5];
            const originalArray = [...array];

            (controller as any).getRandomElements(array, 3);

            expect(array).toEqual(originalArray);
        });
    });
});
