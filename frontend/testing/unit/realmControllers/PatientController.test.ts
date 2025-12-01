// Generated using ClaudeCode. Code has been rechecked and altered.

import { databaseMock } from                   "@/testing/__mocks__/databaseMock";
import { PatientController } from              "@/controllers/realm_controllers/PatientController";
import { Patient, AgentVerbPatient_Trio } from "@/database/schemas";

describe('PatientController', () => {
    let controller: PatientController;

    beforeEach(() => {
        controller = new PatientController();
        jest.clearAllMocks();
    });

    describe('getByVerbId', () => {
        it('should return random patients associated with a verb', async () => {
            const verbId = 5;
            const mockTrios: AgentVerbPatient_Trio[] = [
                { id: 1, verbId: 5, agentId: 10, patientId: 20, groupId: 1, type: "AgentVerbPatient_Trio" },
                { id: 2, verbId: 5, agentId: 11, patientId: 21, groupId: 1, type: "AgentVerbPatient_Trio" },
                { id: 3, verbId: 5, agentId: 12, patientId: 22, groupId: 1, type: "AgentVerbPatient_Trio" }
            ];
            const mockPatients: Patient[] = [
                { id: 20, value: "Patient 20", type: "Patient" },
                { id: 21, value: "Patient 21", type: "Patient" },
                { id: 22, value: "Patient 22", type: "Patient" },
                { id: 23, value: "Patient 23", type: "Patient" }
            ];

            databaseMock.query
                .mockResolvedValueOnce(mockTrios)
                .mockResolvedValueOnce(mockPatients);

            const result = await controller.getByVerbId(verbId, 2);

            expect(databaseMock.query).toHaveBeenCalledWith('AgentVerbPatient_Trio', { verbId: 5 });
            expect(databaseMock.query).toHaveBeenCalledWith('Patient');
            expect(result).toHaveLength(2);
            expect(result.every(patient => [20, 21, 22].includes(patient.id))).toBe(true);
        });

        it('should return default count of 3 patients when count not specified', async () => {
            const verbId = 5;
            const mockTrios: AgentVerbPatient_Trio[] = [
                { id: 1, verbId: 5, agentId: 10, patientId: 20, groupId: 1, type: "AgentVerbPatient_Trio" },
                { id: 2, verbId: 5, agentId: 11, patientId: 21, groupId: 1, type: "AgentVerbPatient_Trio" },
                { id: 3, verbId: 5, agentId: 12, patientId: 22, groupId: 1, type: "AgentVerbPatient_Trio" },
                { id: 4, verbId: 5, agentId: 13, patientId: 23, groupId: 1, type: "AgentVerbPatient_Trio" },
                { id: 5, verbId: 5, agentId: 14, patientId: 24, groupId: 1, type: "AgentVerbPatient_Trio" }
            ];
            const mockPatients: Patient[] = [
                { id: 20, value: "Patient 20", type: "Patient" },
                { id: 21, value: "Patient 21", type: "Patient" },
                { id: 22, value: "Patient 22", type: "Patient" },
                { id: 23, value: "Patient 23", type: "Patient" },
                { id: 24, value: "Patient 24", type: "Patient" }
            ];

            databaseMock.query
                .mockResolvedValueOnce(mockTrios)
                .mockResolvedValueOnce(mockPatients);

            const result = await controller.getByVerbId(verbId);

            expect(result).toHaveLength(3);
        });

        it('should filter out duplicate patient IDs from trios', async () => {
            const verbId = 5;
            const mockTrios: AgentVerbPatient_Trio[] = [
                { id: 1, verbId: 5, agentId: 10, patientId: 20, groupId: 1, type: "AgentVerbPatient_Trio" },
                { id: 2, verbId: 5, agentId: 11, patientId: 20, groupId: 1, type: "AgentVerbPatient_Trio" },
                { id: 3, verbId: 5, agentId: 12, patientId: 21, groupId: 1, type: "AgentVerbPatient_Trio" }
            ];
            const mockPatients: Patient[] = [
                { id: 20, value: "Patient 20", type: "Patient" },
                { id: 21, value: "Patient 21", type: "Patient" },
                { id: 22, value: "Patient 22", type: "Patient" }
            ];

            databaseMock.query
                .mockResolvedValueOnce(mockTrios)
                .mockResolvedValueOnce(mockPatients);

            const result = await controller.getByVerbId(verbId, 2);

            expect(result).toHaveLength(2);
            const patientIds = result.map(p => p.id);
            expect(patientIds.filter(id => id === 20).length).toBeLessThanOrEqual(1);
        });

        it('should return empty array when no trios found for verbId', async () => {
            const verbId = 999;
            const mockTrios: AgentVerbPatient_Trio[] = [];
            const mockPatients: Patient[] = [
                { id: 20, value: "Patient 20", type: "Patient" },
                { id: 21, value: "Patient 21", type: "Patient" }
            ];

            databaseMock.query
                .mockResolvedValueOnce(mockTrios)
                .mockResolvedValueOnce(mockPatients);

            const result = await controller.getByVerbId(verbId, 3);

            expect(result).toEqual([]);
        });

        it('should return all matching patients when count exceeds available patients', async () => {
            const verbId = 5;
            const mockTrios: AgentVerbPatient_Trio[] = [
                { id: 1, verbId: 5, agentId: 10, patientId: 20, groupId: 1, type: "AgentVerbPatient_Trio" },
                { id: 2, verbId: 5, agentId: 11, patientId: 21, groupId: 1, type: "AgentVerbPatient_Trio" }
            ];
            const mockPatients: Patient[] = [
                { id: 20, value: "Patient 20", type: "Patient" },
                { id: 21, value: "Patient 21", type: "Patient" }
            ];

            databaseMock.query
                .mockResolvedValueOnce(mockTrios)
                .mockResolvedValueOnce(mockPatients);

            const result = await controller.getByVerbId(verbId, 10);

            expect(result.length).toBeLessThanOrEqual(2);
        });
    });

    describe('schemaName and jsonFileName', () => {
        it('should have correct schemaName', () => {
            expect(controller.schemaName).toBe('Patient');
        });

        it('should have correct jsonFileName', () => {
            expect(controller.jsonFileName).toBe('patients');
        });
    });
});
