import { IHistoryController } from "@/controllers/interfaces/IHistoryController";
import { CorrectAnswer } from "@/database/schemas";
import { Platform } from "react-native";

let historyController: IHistoryController;

Platform.OS === "web" 
    ? ({ historyController_api: historyController } =   require("@/controllers/api_controllers/HistoryController"))
    : ({ historyController_realm: historyController } = require("@/controllers/realm_controllers/HistoryController"));

export const historyService = {
    getAll: async (): Promise<CorrectAnswer[]> => {
        return historyController.getAll();
    },

    getById: async (id: number): Promise<CorrectAnswer | null> => {
        return historyController.getById(id);
    },

    getAllByGroupId: async (id: number): Promise<CorrectAnswer[]> => {
        return historyController.getAllCorrectAnswersByGroupId(id);
    },

    set: async (trioId: number): Promise<void> => {
        return historyController.setCorrectAnswer(trioId);
    }
};