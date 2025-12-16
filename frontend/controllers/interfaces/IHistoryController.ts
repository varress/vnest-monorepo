import { CorrectAnswer } from "@/database/schemas";
import { IBaseController } from "./IBaseController";

export interface IHistoryController extends IBaseController<CorrectAnswer> {
    setCorrectAnswer(trioId: number, groupId: number): Promise<void>;
    getAllCorrectAnswersByGroupId(groupId: number): Promise<CorrectAnswer[]>
}