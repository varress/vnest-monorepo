import { CorrectAnswer } from      "@/database/schemas";
import { IHistoryController } from "../interfaces/IHistoryController";

const STORAGE_KEY = 'vnest_history';

export class HistoryController implements IHistoryController {
    private getStoredHistory(): CorrectAnswer[] {
        try {
            const stored = sessionStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error reading history from sessionStorage:', error);
            return [];
        }
    }

    private saveHistory(history: CorrectAnswer[]): void {
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history));
        } catch (error) {
            console.error('Error saving history to sessionStorage:', error);
        }
    }

    private getNextId(): number {
        const history = this.getStoredHistory();
        return history.length > 0 ? Math.max(...history.map(h => h.id)) + 1 : 1;
    }

    async getAll(): Promise<CorrectAnswer[]> {
        return this.getStoredHistory();
    }

    async getById(id: number): Promise<CorrectAnswer | null> {
        const history = this.getStoredHistory();
        return history.find(h => h.id === id) || null;
    }

    async setCorrectAnswer(trioId: number, groupId: number): Promise<void> {
        const history = this.getStoredHistory();
        const newAnswer: CorrectAnswer = {
            id: this.getNextId(),
            trioId,
            groupId,
            type: "Correct Answer"
        };
        history.push(newAnswer);
        this.saveHistory(history);
    }

    async getAllCorrectAnswersByGroupId(groupId: number): Promise<CorrectAnswer[]> {
        const history = this.getStoredHistory();
        return history.filter(h => h.groupId === groupId);
    }
}

export const historyController_api = new HistoryController();