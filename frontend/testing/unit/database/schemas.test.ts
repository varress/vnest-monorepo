// Generated using ClaudeCode. Code has been rechecked and altered.

import { mapAVP_ApiToTrio, mapAPIWord_UIWord, ApiResponse, ApiCombination, ApiWord } from "@/database/schemas";
import { createMockWord, createMockCombination } from                                     "@/testing/__helpers__/apiTestHelpers";

describe('Schema Mappers', () => {
    describe('mapAVP_ApiToTrio', () => {
        it('should map API combinations to AgentVerbPatient_Trio format', () => {
            const apiData: ApiResponse<ApiCombination> = {
                success: true,
                data: [
                    createMockCombination(1, 10, 5, 20),
                    createMockCombination(2, 11, 6, 21)
                ]
            };

            const result = mapAVP_ApiToTrio(apiData);

            expect(result).toEqual([
                { id: 1, agentId: 10, verbId: 5, patientId: 20, groupId: 0, type: "AgentVerbPatient_Trio" },
                { id: 2, agentId: 11, verbId: 6, patientId: 21, groupId: 0, type: "AgentVerbPatient_Trio" }
            ]);
        });

        it('should return empty array for empty data', () => {
            const apiData: ApiResponse<ApiCombination> = {
                success: true,
                data:    []
            };

            const result = mapAVP_ApiToTrio(apiData);

            expect(result).toEqual([]);
        });
    });

    describe('mapAPIWord_UIWord', () => {
        it('should map VERB type correctly', () => {
            const apiData: ApiResponse<ApiWord> = {
                success: true,
                data: [createMockWord(1, "juosta", "VERB", 2)]
            };

            const result = mapAPIWord_UIWord(apiData);

            expect(result).toEqual([
                { id: 1, value: "juosta", groupId: 2, groupName: "", type: "Verb" }
            ]);
        });

        it('should map SUBJECT type to Agent', () => {
            const apiData: ApiResponse<ApiWord> = {
                success: true,
                data: [createMockWord(10, "min�", "SUBJECT")]
            };

            const result = mapAPIWord_UIWord(apiData);

            expect(result).toEqual([
                { id: 10, value: "min�", type: "Agent" }
            ]);
        });

        it('should map OBJECT type to Patient', () => {
            const apiData: ApiResponse<ApiWord> = {
                success: true,
                data: [createMockWord(20, "kirjan", "OBJECT")]
            };

            const result = mapAPIWord_UIWord(apiData);

            expect(result).toEqual([
                { id: 20, value: "kirjan", type: "Patient" }
            ]);
        });

        it('should handle missing group_id for VERB', () => {
            const apiData: ApiResponse<ApiWord> = {
                success: true,
                data:    [createMockWord(1, "lukea", "VERB")]
            };

            const result = mapAPIWord_UIWord(apiData);

            expect(result[0]).toEqual(
                expect.objectContaining({ groupId: 0 })
            );
        });

        it('should throw error for invalid type', () => {
            const apiData: ApiResponse<ApiWord> = {
                success: true,
                data:    [{ id: 1, text: "invalid", type: "INVALID", created_at: "2024-01-01" }]
            };

            expect(() => mapAPIWord_UIWord(apiData)).toThrow();
        });

        it('should map multiple words of different types', () => {
            const apiData: ApiResponse<ApiWord> = {
                success: true,
                data: [
                    createMockWord(1, "sy�d�", "VERB", 1),
                    createMockWord(2, "sin�",   "SUBJECT"),
                    createMockWord(3, "ruokaa",  "OBJECT")
                ]
            };

            const result = mapAPIWord_UIWord(apiData);

            expect(result).toHaveLength(3);
            expect(result[0].type).toBe("Verb");
            expect(result[1].type).toBe("Agent");
            expect(result[2].type).toBe("Patient");
        });
    });
});
