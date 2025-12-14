import { IAVPTrioController } from "@/controllers/interfaces/IAVPTrioController";
import { IHistoryController } from "@/controllers/interfaces/IHistoryController";
import { IVerbController } from "@/controllers/interfaces/IVerbController";
import { CorrectAnswer } from "@/database/schemas";
import { Platform } from "react-native";

let historyController: IHistoryController;
let verbController:    IVerbController;
let avpTrioController: IAVPTrioController;

export interface GroupPerformance {
    groupId:       number;
    groupName:     string;
    total_trios:   number;
    correct_trios: number;
    percentage:    number;
};

Platform.OS === "web" 
    ? ({ historyController_api: historyController } =   require("@/controllers/api_controllers/HistoryController"))
    : ({ historyController_realm: historyController } = require("@/controllers/realm_controllers/HistoryController"));

({ verbController_realm:    verbController } =    require("@/controllers/realm_controllers/VerbController"));
({ avpTrioController_realm: avpTrioController } = require("@/controllers/realm_controllers/AVPTrioController"));

class HistoryService {
    async getAll(): Promise<CorrectAnswer[]> {
        return historyController.getAll();
    }

    async getById(id: number): Promise<CorrectAnswer | null> {
        return historyController.getById(id);
    }

    async getAllByGroupId(id: number): Promise<CorrectAnswer[]> {
        return historyController.getAllCorrectAnswersByGroupId(id);
    }

    async set(trioId: number, groupId: number): Promise<void> {
        return historyController.setCorrectAnswer(trioId, groupId);
    }

    async getGroupPerformance(): Promise<GroupPerformance[]> {
        const verbs =          await verbController.getAll();
        const trios =          await avpTrioController.getAll();
        const correctAnswers = await historyController.getAll();

        const map = new Map<number, {
            name:          string;
            total_trios:   number;
            correct_trios: number;
        }>();

        for (const v of verbs) {
            if (!map.has(v.groupId)) {
                map.set(v.groupId, {
                    name:          v.groupName,
                    total_trios:   0,
                    correct_trios: 0
                });
            }
        }

        for (const trio of trios) {
            const group = map.get(trio.groupId);
            if(group) group.total_trios++;
        }

        for (const ca of correctAnswers) {
            const trio = trios.find(t => t.id === ca.trioId);
            if (!trio) continue;

            const group = map.get(trio.groupId);
            if (group) group.correct_trios++;
        }

        return Array.from(map.entries()).map(([groupId, group]) => ({
            groupId,
            groupName: group.name,
            total_trios: group.total_trios,
            correct_trios: group.correct_trios,
            percentage: group.total_trios > 0 ? (group.correct_trios / group.total_trios) * 100 : 0
        }));
    }
};

export const historyService = new HistoryService();