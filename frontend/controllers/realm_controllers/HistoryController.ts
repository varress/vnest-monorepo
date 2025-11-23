import { AgentVerbPatient_Trio, CorrectAnswer, Verb } from "@/database/schemas";
import { IHistoryController } from "../interfaces/IHistoryController";
import { BaseController } from "./BaseController";
import { database } from "@/database";

export class HistoryController extends BaseController<CorrectAnswer> implements IHistoryController {
    schemaName =   'CorrectAnswer';

    async setCorrectAnswer(trioId: number): Promise<void> {
        const all = await this.getAll();
        const id =  all.length > 0
            ? Math.max(...all.map(ca => ca.id)) + 1
            : 0;

        const answer: CorrectAnswer = {
            id: id, trioId, createdAt: new Date(), type: "Correct Answer"};
        await database.insert<CorrectAnswer>(this.schemaName, answer);
    }

    async getAllCorrectAnswersByGroupId(groupId: number): Promise<CorrectAnswer[]> {
        const verbs =   await database.query<Verb>("Verb", { groupId });
        const verbIds = new Set(verbs.map(v => v.id));

        const allTrios =      await database.query<AgentVerbPatient_Trio>("AgentVerbPatient_Trio");
        const matchingTrios = allTrios.filter(t => verbIds.has(t.verbId));
        const trioIds =       new Set(matchingTrios.map(t => t.id));

        const  allCorrectAnswers = await database.query<CorrectAnswer>(this.schemaName);
        console.log(allCorrectAnswers.filter(ca => trioIds.has(ca.trioId)));
        return allCorrectAnswers.filter(ca => trioIds.has(ca.trioId));
    }
}

export const historyController_realm = new HistoryController();