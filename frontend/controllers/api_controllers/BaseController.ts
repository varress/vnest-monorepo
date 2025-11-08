import { API_URL } from "@/config";
import { ApiResponse, ApiWord, mapAPIWord_UIWord, Word } from "@/database/schemas";
import { IBaseController } from "../interfaces/IBaseController";

export abstract class BaseController<T extends Word> implements IBaseController<T> {
    constructor(private type: "Agent" | "Verb" | "Patient", private API_type: "SUBJECT" | "VERB" | "OBJECT") {}

    protected getRandomElements<T>(array: T[], count: number): T[] {
        const shuffled = [...array].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    async getById(id: number): Promise<T | null> {
        const all = await this.getAll();
        return all.find(e => e.id === id) ?? null;
    }

    async getAll(): Promise<T[]> {
        const res = await fetch(`${API_URL}/api/words?type=${this.API_type}`, {
             method: 'GET'
        });
        if (!res.ok) return [];
        const apiResult: ApiResponse<ApiWord> = await res.json();
        const words = mapAPIWord_UIWord(apiResult);
        return words.filter((w): w is T => w.type === this.type);
    }
}