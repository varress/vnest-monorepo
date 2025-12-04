// Not tested, because it is a placeholder file, that might very well be changed in the future.

import { CorrectAnswer } from "@/database/schemas";
import { IHistoryController } from "../interfaces/IHistoryController";

export class HistoryController implements IHistoryController {
    async getAll(): Promise<CorrectAnswer[]> {
        throw new Error("History Controller should not be reached in the Web Version.")
    }

    async getById(id: number): Promise<CorrectAnswer | null> {
        throw new Error("History Controller should not be reached in the Web Version.")
    }

    async setCorrectAnswer(trioId: number): Promise<void> {
        throw new Error("History Controller should not be reached in the Web Version.")
    }

    async getAllCorrectAnswersByGroupId(groupId: number): Promise<CorrectAnswer[]> {
        throw new Error("History Controller should not be reached in the Web Version.")
    }
}

export const historyController_api = new HistoryController();