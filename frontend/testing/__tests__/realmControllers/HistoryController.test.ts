// Generated using ClaudeCode. Code has been rechecked and altered.

import { databaseMock } from                               "@/testing/__mocks__/databaseMock";
import { HistoryController } from                          "@/controllers/realm_controllers/HistoryController";
import { CorrectAnswer, AgentVerbPatient_Trio, Verb } from "@/database/schemas";

describe('HistoryController', () => {
    let controller: HistoryController;

    beforeEach(() => {
        controller = new HistoryController();
        jest.clearAllMocks();
    });

    describe('setCorrectAnswer', () => {
        it('should insert a new correct answer with id 0 when no answers exist', async () => {
            const trioId = 42;
            databaseMock.query.mockResolvedValue([]);
            databaseMock.insert.mockResolvedValue(undefined);

            await controller.setCorrectAnswer(trioId);

            expect(databaseMock.query).toHaveBeenCalledWith('CorrectAnswer');
            expect(databaseMock.insert).toHaveBeenCalledWith(
                'CorrectAnswer',
                expect.objectContaining({
                    id:     0,
                    trioId: 42,
                    type:   "Correct Answer"
                })
            );
        });

        it('should insert a new correct answer with incremented id when answers exist', async () => {
            const trioId = 42;
            const existingAnswers: CorrectAnswer[] = [
                { id: 1, trioId: 10, createdAt: new Date(), type: "Correct Answer" },
                { id: 5, trioId: 20, createdAt: new Date(), type: "Correct Answer" },
                { id: 3, trioId: 30, createdAt: new Date(), type: "Correct Answer" }
            ];
            databaseMock.query.mockResolvedValue(existingAnswers);
            databaseMock.insert.mockResolvedValue(undefined);

            await controller.setCorrectAnswer(trioId);

            expect(databaseMock.query).toHaveBeenCalledWith('CorrectAnswer');
            expect(databaseMock.insert).toHaveBeenCalledWith(
                'CorrectAnswer',
                expect.objectContaining({
                    id:     6, // Max id (5) + 1
                    trioId: 42,
                    type:   "Correct Answer"
                })
            );
        });

        it('should include createdAt timestamp in the correct answer', async () => {
            const trioId = 42;
            databaseMock.query.mockResolvedValue([]);
            databaseMock.insert.mockResolvedValue(undefined);

            const beforeTime = new Date();
            await controller.setCorrectAnswer(trioId);
            const afterTime =  new Date();

            const insertedAnswer = databaseMock.insert.mock.calls[0][1] as CorrectAnswer;
            expect(insertedAnswer.createdAt).toBeInstanceOf(Date);
            expect(insertedAnswer.createdAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
            expect(insertedAnswer.createdAt.getTime()).toBeLessThanOrEqual(afterTime.getTime());
        });
    });

    describe('getAllCorrectAnswersByGroupId', () => {
        it('should return correct answers filtered by groupId', async () => {
            const groupId = 1;
            const mockVerbs: Verb[] = [
                { id: 10, value: "verb1", groupId: 1, groupName: "Group 1", type: "Verb" },
                { id: 11, value: "verb2", groupId: 1, groupName: "Group 1", type: "Verb" }
            ];
            const mockTrios: AgentVerbPatient_Trio[] = [
                { id: 100, verbId: 10, agentId: 1, patientId: 2, groupId: 1, type: "AgentVerbPatient_Trio" },
                { id: 101, verbId: 11, agentId: 3, patientId: 4, groupId: 1, type: "AgentVerbPatient_Trio" },
                { id: 102, verbId: 20, agentId: 5, patientId: 6, groupId: 2, type: "AgentVerbPatient_Trio" }
            ];
            const mockCorrectAnswers: CorrectAnswer[] = [
                { id: 1, trioId: 100, createdAt: new Date(), type: "Correct Answer" },
                { id: 2, trioId: 101, createdAt: new Date(), type: "Correct Answer" },
                { id: 3, trioId: 102, createdAt: new Date(), type: "Correct Answer" }
            ];

            databaseMock.query
                .mockResolvedValueOnce(mockVerbs)
                .mockResolvedValueOnce(mockTrios)
                .mockResolvedValueOnce(mockCorrectAnswers);

            const result = await controller.getAllCorrectAnswersByGroupId(groupId);

            expect(databaseMock.query).toHaveBeenCalledWith('Verb', { groupId: 1 });
            expect(databaseMock.query).toHaveBeenCalledWith('AgentVerbPatient_Trio');
            expect(databaseMock.query).toHaveBeenCalledWith('CorrectAnswer');
            expect(result).toHaveLength(2);
            expect(result).toEqual([
                { id: 1, trioId: 100, createdAt: expect.any(Date), type: "Correct Answer" },
                { id: 2, trioId: 101, createdAt: expect.any(Date), type: "Correct Answer" }
            ]);
        });

        it('should return empty array when no verbs match groupId', async () => {
            const groupId = 999;
            const mockVerbs: Verb[] = [];
            const mockTrios: AgentVerbPatient_Trio[] = [
                { id: 100, verbId: 10, agentId: 1, patientId: 2, groupId: 1, type: "AgentVerbPatient_Trio" }
            ];
            const mockCorrectAnswers: CorrectAnswer[] = [
                { id: 1, trioId: 100, createdAt: new Date(), type: "Correct Answer" }
            ];

            databaseMock.query
                .mockResolvedValueOnce(mockVerbs)
                .mockResolvedValueOnce(mockTrios)
                .mockResolvedValueOnce(mockCorrectAnswers);

            const result = await controller.getAllCorrectAnswersByGroupId(groupId);

            expect(result).toEqual([]);
        });

        it('should return empty array when no trios match the verb IDs', async () => {
            const groupId = 1;
            const mockVerbs: Verb[] = [
                { id: 10, value: "verb1", groupId: 1, groupName: "Group 1", type: "Verb" }
            ];
            const mockTrios: AgentVerbPatient_Trio[] = [
                { id: 100, verbId: 99, agentId: 1, patientId: 2, groupId: 2, type: "AgentVerbPatient_Trio" }
            ];
            const mockCorrectAnswers: CorrectAnswer[] = [
                { id: 1, trioId: 100, createdAt: new Date(), type: "Correct Answer" }
            ];

            databaseMock.query
                .mockResolvedValueOnce(mockVerbs)
                .mockResolvedValueOnce(mockTrios)
                .mockResolvedValueOnce(mockCorrectAnswers);

            const result = await controller.getAllCorrectAnswersByGroupId(groupId);

            expect(result).toEqual([]);
        });

        it('should return empty array when no correct answers exist for the trios', async () => {
            const groupId = 1;
            const mockVerbs: Verb[] = [
                { id: 10, value: "verb1", groupId: 1, groupName: "Group 1", type: "Verb" }
            ];
            const mockTrios: AgentVerbPatient_Trio[] = [
                { id: 100, verbId: 10, agentId: 1, patientId: 2, groupId: 1, type: "AgentVerbPatient_Trio" }
            ];
            const mockCorrectAnswers: CorrectAnswer[] = [
                { id: 1, trioId: 999, createdAt: new Date(), type: "Correct Answer" }
            ];

            databaseMock.query
                .mockResolvedValueOnce(mockVerbs)
                .mockResolvedValueOnce(mockTrios)
                .mockResolvedValueOnce(mockCorrectAnswers);

            const result = await controller.getAllCorrectAnswersByGroupId(groupId);

            expect(result).toEqual([]);
        });

        it('should handle multiple verbs and multiple correct answers', async () => {
            const groupId = 1;
            const mockVerbs: Verb[] = [
                { id: 10, value: "verb1", groupId: 1, groupName: "Group 1", type: "Verb" },
                { id: 11, value: "verb2", groupId: 1, groupName: "Group 1", type: "Verb" },
                { id: 12, value: "verb3", groupId: 1, groupName: "Group 1", type: "Verb" }
            ];
            const mockTrios: AgentVerbPatient_Trio[] = [
                { id: 100, verbId: 10, agentId: 1, patientId: 2, groupId: 1, type: "AgentVerbPatient_Trio" },
                { id: 101, verbId: 10, agentId: 3, patientId: 4, groupId: 1, type: "AgentVerbPatient_Trio" },
                { id: 102, verbId: 11, agentId: 5, patientId: 6, groupId: 1, type: "AgentVerbPatient_Trio" }
            ];
            const mockCorrectAnswers: CorrectAnswer[] = [
                { id: 1, trioId: 100, createdAt: new Date(), type: "Correct Answer" },
                { id: 2, trioId: 100, createdAt: new Date(), type: "Correct Answer" },
                { id: 3, trioId: 101, createdAt: new Date(), type: "Correct Answer" },
                { id: 4, trioId: 102, createdAt: new Date(), type: "Correct Answer" }
            ];

            databaseMock.query
                .mockResolvedValueOnce(mockVerbs)
                .mockResolvedValueOnce(mockTrios)
                .mockResolvedValueOnce(mockCorrectAnswers);

            const result = await controller.getAllCorrectAnswersByGroupId(groupId);

            expect(result).toHaveLength(4);
        });
    });

    describe('schemaName', () => {
        it('should have correct schemaName', () => {
            expect(controller.schemaName).toBe('CorrectAnswer');
        });
    });
});
