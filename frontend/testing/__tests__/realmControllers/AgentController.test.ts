// Generated using ClaudeCode. Code has been rechecked and altered.

import { databaseMock } from                 "@/testing/__mocks__/databaseMock";
import { AgentController } from              "@/controllers/realm_controllers/AgentController";
import { Agent, AgentVerbPatient_Trio } from "@/database/schemas";

describe('AgentController', () => {
    let controller: AgentController;

    beforeEach(() => {
        controller = new AgentController();
        jest.clearAllMocks();
    });

    describe('getByVerbId', () => {
        it('should return random agents associated with a verb', async () => {
            const verbId = 5;
            const mockTrios: AgentVerbPatient_Trio[] = [
                { id: 1, verbId: 5, agentId: 10, patientId: 20, groupId: 1, type: "AgentVerbPatient_Trio" },
                { id: 2, verbId: 5, agentId: 11, patientId: 21, groupId: 1, type: "AgentVerbPatient_Trio" },
                { id: 3, verbId: 5, agentId: 12, patientId: 22, groupId: 1, type: "AgentVerbPatient_Trio" }
            ];
            const mockAgents: Agent[] = [
                { id: 10, value: "Agent 10", type: "Agent" },
                { id: 11, value: "Agent 11", type: "Agent" },
                { id: 12, value: "Agent 12", type: "Agent" },
                { id: 13, value: "Agent 13", type: "Agent" }
            ];

            databaseMock.query
                .mockResolvedValueOnce(mockTrios)  // First call for trios
                .mockResolvedValueOnce(mockAgents); // Second call for agents

            const result = await controller.getByVerbId(verbId, 2);

            expect(databaseMock.query).toHaveBeenCalledWith('AgentVerbPatient_Trio', { verbId: 5 });
            expect(databaseMock.query).toHaveBeenCalledWith('Agent');
            expect(result).toHaveLength(2);
            expect(result.every(agent => [10, 11, 12].includes(agent.id))).toBe(true);
        });

        it('should return default count of 3 agents when count not specified', async () => {
            const verbId = 5;
            const mockTrios: AgentVerbPatient_Trio[] = [
                { id: 1, verbId: 5, agentId: 10, patientId: 20, groupId: 1, type: "AgentVerbPatient_Trio" },
                { id: 2, verbId: 5, agentId: 11, patientId: 21, groupId: 1, type: "AgentVerbPatient_Trio" },
                { id: 3, verbId: 5, agentId: 12, patientId: 22, groupId: 1, type: "AgentVerbPatient_Trio" },
                { id: 4, verbId: 5, agentId: 13, patientId: 23, groupId: 1, type: "AgentVerbPatient_Trio" },
                { id: 5, verbId: 5, agentId: 14, patientId: 24, groupId: 1, type: "AgentVerbPatient_Trio" }
            ];
            const mockAgents: Agent[] = [
                { id: 10, value: "Agent 10", type: "Agent" },
                { id: 11, value: "Agent 11", type: "Agent" },
                { id: 12, value: "Agent 12", type: "Agent" },
                { id: 13, value: "Agent 13", type: "Agent" },
                { id: 14, value: "Agent 14", type: "Agent" }
            ];

            databaseMock.query
                .mockResolvedValueOnce(mockTrios)
                .mockResolvedValueOnce(mockAgents);

            const result = await controller.getByVerbId(verbId);

            expect(result).toHaveLength(3);
        });

        it('should filter out duplicate agent IDs from trios', async () => {
            const verbId = 5;
            const mockTrios: AgentVerbPatient_Trio[] = [
                { id: 1, verbId: 5, agentId: 10, patientId: 20, groupId: 1, type: "AgentVerbPatient_Trio" },
                { id: 2, verbId: 5, agentId: 10, patientId: 21, groupId: 1, type: "AgentVerbPatient_Trio" }, // Duplicate agentId
                { id: 3, verbId: 5, agentId: 11, patientId: 22, groupId: 1, type: "AgentVerbPatient_Trio" }
            ];
            const mockAgents: Agent[] = [
                { id: 10, value: "Agent 10", type: "Agent" },
                { id: 11, value: "Agent 11", type: "Agent" },
                { id: 12, value: "Agent 12", type: "Agent" }
            ];

            databaseMock.query
                .mockResolvedValueOnce(mockTrios)
                .mockResolvedValueOnce(mockAgents);

            const result = await controller.getByVerbId(verbId, 2);

            expect(result).toHaveLength(2);
            // Should only include agents 10 and 11 (no duplicates)
            const agentIds = result.map(a => a.id);
            expect(agentIds.filter(id => id === 10).length).toBeLessThanOrEqual(1);
        });

        it('should return empty array when no trios found for verbId', async () => {
            const verbId = 999;
            const mockTrios: AgentVerbPatient_Trio[] = [];
            const mockAgents: Agent[] = [
                { id: 10, value: "Agent 10", type: "Agent" },
                { id: 11, value: "Agent 11", type: "Agent" }
            ];

            databaseMock.query
                .mockResolvedValueOnce(mockTrios)
                .mockResolvedValueOnce(mockAgents);

            const result = await controller.getByVerbId(verbId, 3);

            expect(result).toEqual([]);
        });

        it('should return all matching agents when count exceeds available agents', async () => {
            const verbId = 5;
            const mockTrios: AgentVerbPatient_Trio[] = [
                { id: 1, verbId: 5, agentId: 10, patientId: 20, groupId: 1, type: "AgentVerbPatient_Trio" },
                { id: 2, verbId: 5, agentId: 11, patientId: 21, groupId: 1, type: "AgentVerbPatient_Trio" }
            ];
            const mockAgents: Agent[] = [
                { id: 10, value: "Agent 10", type: "Agent" },
                { id: 11, value: "Agent 11", type: "Agent" }
            ];

            databaseMock.query
                .mockResolvedValueOnce(mockTrios)
                .mockResolvedValueOnce(mockAgents);

            const result = await controller.getByVerbId(verbId, 10);

            expect(result.length).toBeLessThanOrEqual(2);
        });
    });

    describe('schemaName and jsonFileName', () => {
        it('should have correct schemaName', () => {
            expect(controller.schemaName).toBe('Agent');
        });

        it('should have correct jsonFileName', () => {
            expect(controller.jsonFileName).toBe('agents');
        });
    });
});
