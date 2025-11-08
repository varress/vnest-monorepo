import { Verb } from "@/database/schemas";
import { IBaseController } from "./IBaseController";

export interface IVerbController extends IBaseController<Verb> {
    getRandomVerb(): Promise<Verb>;
    getAllVerbsByGroupId(groupId: number): Promise<Verb[]>
}