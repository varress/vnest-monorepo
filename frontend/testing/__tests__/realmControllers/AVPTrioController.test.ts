// Generated using ClaudeCode. Code has been rechecked and altered.

import { databaseMock } from          "@/testing/__mocks__/databaseMock";
import { AVPTrioController } from     "@/controllers/realm_controllers/AVPTrioController";
import { AgentVerbPatient_Trio } from "@/database/schemas";

describe('AVPTrioController', () => {
    let controller: AVPTrioController;

    beforeEach(() => {
        controller = new AVPTrioController();
        jest.clearAllMocks();
    });

    describe('GetRandomByVerbId', () => {
        it('should return random trios for a specific verbId', async () => {
            const mockTrios: AgentVerbPatient_Trio[] = [
                { id: 1, verbId: 5, agentId: 10, patientId: 20, groupId: 1, type: "AgentVerbPatient_Trio" },
                { id: 2, verbId: 5, agentId: 11, patientId: 21, groupId: 1, type: "AgentVerbPatient_Trio" },
                { id: 3, verbId: 5, agentId: 12, patientId: 22, groupId: 1, type: "AgentVerbPatient_Trio" },
                { id: 4, verbId: 5, agentId: 13, patientId: 23, groupId: 1, type: "AgentVerbPatient_Trio" },
                { id: 5, verbId: 7, agentId: 14, patientId: 24, groupId: 1, type: "AgentVerbPatient_Trio" }
            ];
            databaseMock.query.mockResolvedValue(mockTrios);

            const result = await controller.GetRandomByVerbId(5, 2);

            expect(databaseMock.query).toHaveBeenCalledWith('AgentVerbPatient_Trio');
            expect(result).toHaveLength(2);
            expect(result.every(trio => trio.verbId === 5)).toBe(true);
        });

        it('should return default count of 3 trios when count not specified', async () => {
            const mockTrios: AgentVerbPatient_Trio[] = [
                { id: 1, verbId: 5, agentId: 10, patientId: 20, groupId: 1, type: "AgentVerbPatient_Trio" },
                { id: 2, verbId: 5, agentId: 11, patientId: 21, groupId: 1, type: "AgentVerbPatient_Trio" },
                { id: 3, verbId: 5, agentId: 12, patientId: 22, groupId: 1, type: "AgentVerbPatient_Trio" },
                { id: 4, verbId: 5, agentId: 13, patientId: 23, groupId: 1, type: "AgentVerbPatient_Trio" },
                { id: 5, verbId: 5, agentId: 14, patientId: 24, groupId: 1, type: "AgentVerbPatient_Trio" }
            ];
            databaseMock.query.mockResolvedValue(mockTrios);

            const result = await controller.GetRandomByVerbId(5);

            expect(result).toHaveLength(3);
        });

        it('should filter out trios with different verbId', async () => {
            const mockTrios: AgentVerbPatient_Trio[] = [
                { id: 1, verbId: 5, agentId: 10, patientId: 20, groupId: 1, type: "AgentVerbPatient_Trio" },
                { id: 2, verbId: 7, agentId: 11, patientId: 21, groupId: 1, type: "AgentVerbPatient_Trio" },
                { id: 3, verbId: 5, agentId: 12, patientId: 22, groupId: 1, type: "AgentVerbPatient_Trio" }
            ];
            databaseMock.query.mockResolvedValue(mockTrios);

            const result = await controller.GetRandomByVerbId(5, 10);

            expect(result.every(trio => trio.verbId === 5)).toBe(true);
            expect(result.length).toBeLessThanOrEqual(2);
        });

        it('should return empty array when no trios match verbId', async () => {
            const mockTrios: AgentVerbPatient_Trio[] = [
                { id: 1, verbId: 5, agentId: 10, patientId: 20, groupId: 1, type: "AgentVerbPatient_Trio" },
                { id: 2, verbId: 5, agentId: 11, patientId: 21, groupId: 1, type: "AgentVerbPatient_Trio" }
            ];
            databaseMock.query.mockResolvedValue(mockTrios);

            const result = await controller.GetRandomByVerbId(999, 3);

            expect(result).toEqual([]);
        });
    });

    describe('IsCorrentCombination', () => {
        it('should return true when combination exists', async () => {
            const mockTrios: AgentVerbPatient_Trio[] = [
                { id: 1, verbId: 5, agentId: 10, patientId: 20, groupId: 1, type: "AgentVerbPatient_Trio" },
                { id: 2, verbId: 5, agentId: 11, patientId: 21, groupId: 1, type: "AgentVerbPatient_Trio" },
                { id: 3, verbId: 7, agentId: 10, patientId: 20, groupId: 1, type: "AgentVerbPatient_Trio" }
            ];
            databaseMock.query.mockResolvedValue(mockTrios);

            const result = await controller.IsCorrentCombination(10, 5, 20);

            expect(databaseMock.query).toHaveBeenCalledWith('AgentVerbPatient_Trio');
            expect(result).toBe(true);
        });

        it('should return false when combination does not exist', async () => {
            const mockTrios: AgentVerbPatient_Trio[] = [
                { id: 1, verbId: 5, agentId: 10, patientId: 20, groupId: 1, type: "AgentVerbPatient_Trio" },
                { id: 2, verbId: 5, agentId: 11, patientId: 21, groupId: 1, type: "AgentVerbPatient_Trio" }
            ];
            databaseMock.query.mockResolvedValue(mockTrios);

            const result = await controller.IsCorrentCombination(10, 5, 99);

            expect(result).toBe(false);
        });

        it('should return false when verbId does not match', async () => {
            const mockTrios: AgentVerbPatient_Trio[] = [
                { id: 1, verbId: 5, agentId: 10, patientId: 20, groupId: 1, type: "AgentVerbPatient_Trio" }
            ];
            databaseMock.query.mockResolvedValue(mockTrios);

            const result = await controller.IsCorrentCombination(10, 999, 20);

            expect(result).toBe(false);
        });

        it('should return false when agentId matches but patientId does not', async () => {
            const mockTrios: AgentVerbPatient_Trio[] = [
                { id: 1, verbId: 5, agentId: 10, patientId: 20, groupId: 1, type: "AgentVerbPatient_Trio" }
            ];
            databaseMock.query.mockResolvedValue(mockTrios);

            const result = await controller.IsCorrentCombination(10, 5, 999);

            expect(result).toBe(false);
        });

        it('should return false when patientId matches but agentId does not', async () => {
            const mockTrios: AgentVerbPatient_Trio[] = [
                { id: 1, verbId: 5, agentId: 10, patientId: 20, groupId: 1, type: "AgentVerbPatient_Trio" }
            ];
            databaseMock.query.mockResolvedValue(mockTrios);

            const result = await controller.IsCorrentCombination(999, 5, 20);

            expect(result).toBe(false);
        });

        it('should return true when multiple matching combinations exist', async () => {
            const mockTrios: AgentVerbPatient_Trio[] = [
                { id: 1, verbId: 5, agentId: 10, patientId: 20, groupId: 1, type: "AgentVerbPatient_Trio" },
                { id: 2, verbId: 5, agentId: 10, patientId: 20, groupId: 2, type: "AgentVerbPatient_Trio" }
            ];
            databaseMock.query.mockResolvedValue(mockTrios);

            const result = await controller.IsCorrentCombination(10, 5, 20);

            expect(result).toBe(true);
        });
    });

    describe('GetIdByAgentVerbPatient', () => {
        it('should return the trio id when combination exists', async () => {
            const mockTrios: AgentVerbPatient_Trio[] = [
                { id: 42, verbId: 5, agentId: 10, patientId: 20, groupId: 1, type: "AgentVerbPatient_Trio" },
                { id: 43, verbId: 5, agentId: 11, patientId: 21, groupId: 1, type: "AgentVerbPatient_Trio" }
            ];
            databaseMock.query.mockResolvedValue(mockTrios);

            const result = await controller.GetIdByAgentVerbPatient(10, 5, 20);

            expect(databaseMock.query).toHaveBeenCalledWith('AgentVerbPatient_Trio');
            expect(result).toBe(42);
        });

        it('should return -1 when combination does not exist', async () => {
            const mockTrios: AgentVerbPatient_Trio[] = [
                { id: 42, verbId: 5, agentId: 10, patientId: 20, groupId: 1, type: "AgentVerbPatient_Trio" }
            ];
            databaseMock.query.mockResolvedValue(mockTrios);

            const result = await controller.GetIdByAgentVerbPatient(999, 5, 20);

            expect(result).toBe(-1);
        });

        it('should return -1 when verbId does not match', async () => {
            const mockTrios: AgentVerbPatient_Trio[] = [
                { id: 42, verbId: 5, agentId: 10, patientId: 20, groupId: 1, type: "AgentVerbPatient_Trio" }
            ];
            databaseMock.query.mockResolvedValue(mockTrios);

            const result = await controller.GetIdByAgentVerbPatient(10, 999, 20);

            expect(result).toBe(-1);
        });

        it('should return -1 when only agentId and verbId match but patientId does not', async () => {
            const mockTrios: AgentVerbPatient_Trio[] = [
                { id: 42, verbId: 5, agentId: 10, patientId: 20, groupId: 1, type: "AgentVerbPatient_Trio" }
            ];
            databaseMock.query.mockResolvedValue(mockTrios);

            const result = await controller.GetIdByAgentVerbPatient(10, 5, 999);

            expect(result).toBe(-1);
        });
    });

    describe('schemaName and jsonFileName', () => {
        it('should have correct schemaName', () => {
            expect(controller.schemaName).toBe('AgentVerbPatient_Trio');
        });

        it('should have correct jsonFileName', () => {
            expect(controller.jsonFileName).toBe('avp_trios');
        });
    });
});
