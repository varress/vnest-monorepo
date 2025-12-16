import { AgentVerbPatient_Trio, CorrectAnswer, Verb } from "@/database/schemas";
import { IHistoryController } from "../interfaces/IHistoryController";
import { BaseController } from "./BaseController";
import { database } from "@/database";

export class HistoryController extends BaseController<CorrectAnswer> implements IHistoryController {
    schemaName =   'CorrectAnswer';

    async setCorrectAnswer(trioId: number, groupId: number): Promise<void> {
        const all = await this.getAll();
        const id =  all.length > 0
            ? Math.max(...all.map(ca => ca.id)) + 1
            : 0;

        const answer: CorrectAnswer = {
            id: id, trioId, groupId, type: "Correct Answer"};
        await database.insert<CorrectAnswer>(this.schemaName, answer);
    }

    async getAllCorrectAnswersByGroupId(groupId: number): Promise<CorrectAnswer[]> {
        const allCorrectAnswers = await database.query<CorrectAnswer>(this.schemaName, { groupId });
        return allCorrectAnswers;
    }
}

export const historyController_realm = new HistoryController();