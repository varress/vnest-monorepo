export interface IBaseController<T> {
    getById(id: number): Promise<T | null>;
    getAll(): Promise<T[]>;
}