// Generated using ClaudeCode. Code has been rechecked and altered.

import { ApiResponse, ApiWord, ApiCombination } from "@/database/schemas";

export const createMockWord = (id: number, text: string, type: string, group_id?: number): ApiWord => ({
    id,
    text,
    type,
    group_id,
    created_at: "2024-01-01T00:00:00Z"
});

export const mockWordResponse = (words: ApiWord[]): ApiResponse<ApiWord> => ({
    success: true,
    data:    words
});

export const createMockCombination = (
    id:        number,
    subjectId: number,
    verbId:    number = 5,
    objectId?: number
): ApiCombination => {
    const finalObjectId = objectId ?? id * 10;
    return {
        id,
        subject:  { id: subjectId,     text: `Subject ${subjectId}` },
        verb:     { id: verbId,        text: `Verb ${verbId}` },
        object:   { id: finalObjectId, text: `Object ${finalObjectId}` },
        sentence: `Subject ${subjectId} Verb ${verbId} Object ${finalObjectId}`
    };
};

export const createMockAgent = (id: number): ApiResponse<ApiWord> => ({
    success: true,
    data:    [createMockWord(id, `Subject ${id}`, "SUBJECT")]
});

export const createMockPatient = (id: number): ApiResponse<ApiWord> => ({
    success: true,
    data:    [createMockWord(id, `Object ${id}`, "OBJECT")]
});

export const createMockVerb = (id: number, text: string, groupId: number = 0): ApiWord =>
    createMockWord(id, text, "VERB", groupId);
