import { IBaseController } from "./IBaseController";

export interface ISubjectObjectController<T> extends IBaseController<T> {
    getByVerbId(verbId: number, count?: number): Promise<T[]>
}