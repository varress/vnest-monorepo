import { API_URL } from "@/config";
import { AgentVerbPatient_Trio, ApiResponse, mapAVP_ApiToTrio } from "@/database/schemas";
import { IAVPTrioController } from "../interfaces/IAVPTrioController";

export class AVPTrioController implements IAVPTrioController {
    async getById(id: number): Promise<AgentVerbPatient_Trio | null> {
        const allTrios = await this.getAll();
        return allTrios.find(trio => trio.id === id) ?? null;
    }

    async getAll(): Promise<AgentVerbPatient_Trio[]> {
        const res = await fetch(`${API_URL}/api/combinations`, {
            method: 'GET'
        });
        if (!res.ok) return [];
        const apiResult: ApiResponse = await res.json();
        return mapAVP_ApiToTrio(apiResult);
    }

    async GetRandomByVerbId(verbId: number, count?: number): Promise<AgentVerbPatient_Trio[]> {
        const allTrios =     await this.getAll();
        const allVerbTrios = allTrios.filter(trio => trio.verbId === verbId);
        const shuffled =     [...allVerbTrios].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    async IsCorrentCombination(agentId: number, verbId: number, patientId: number): Promise<boolean> {
        const allTrios = await this.getAll();
        return allTrios.some(trio =>
            trio.agentId   === agentId &&
            trio.patientId === patientId &&
            trio.verbId    === verbId);
    }
}

export const avpTrioController_api = new AVPTrioController();