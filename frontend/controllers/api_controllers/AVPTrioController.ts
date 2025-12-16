import { API_URL } from "@/config";
import { AgentVerbPatient_Trio, ApiCombination, ApiResponse, mapAVP_ApiToTrio } from "@/database/schemas";
import { IAVPTrioController } from "../interfaces/IAVPTrioController";

export class AVPTrioController implements IAVPTrioController {
    async getById(id: number): Promise<AgentVerbPatient_Trio | null> {
        const res = await fetch(`${API_URL}/api/combinations/${id}`, { method: 'GET' });
        if (!res.ok) return null;
        
        const apiResult: ApiResponse<ApiCombination> = await res.json();
        const trios = mapAVP_ApiToTrio(apiResult);
        return trios[0] ?? null;
    }

    async getAll(): Promise<AgentVerbPatient_Trio[]> {
        const res = await fetch(`${API_URL}/api/combinations`, {
            method: 'GET'
        });
        if (!res.ok) return [];
        const apiResult: ApiResponse<ApiCombination> = await res.json();
        return mapAVP_ApiToTrio(apiResult);
    }

    async GetRandomByVerbId(verbId: number, count?: number): Promise<AgentVerbPatient_Trio[]> {
        const res = await fetch(`${API_URL}/api/combinations?verb_id=${verbId}`, { method: 'GET' });
        if (!res.ok) return [];
        
        const apiResult: ApiResponse<ApiCombination> = await res.json();
        const allVerbTrios = mapAVP_ApiToTrio(apiResult);
        
        const shuffled = [...allVerbTrios].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    async IsCorrectCombination(agentId: number, verbId: number, patientId: number): Promise<boolean> {
        console.log("Starting is correct")
        const res = await fetch(`${API_URL}/api/suggestions/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                subject_id: agentId,
                verb_id: verbId,
                object_id: patientId
            })
        });
        if (!res.ok) return false;

        const apiResult: ApiResponse<{ valid: boolean; sentence: string; message: string }> = await res.json();
        const data = Array.isArray(apiResult.data) ? apiResult.data[0] : apiResult.data;
        console.log("API response:", data)
        return data.valid;
    }

    async GetIdByAgentVerbPatient(agentId: number, verbId: number, patientId: number): Promise<number> {
        const res = await fetch(`${API_URL}/api/combinations?verb_id=${verbId}`, { method: 'GET' });
        if (!res.ok) return -1;
        
        const apiResult: ApiResponse<ApiCombination> = await res.json();
        const trios = mapAVP_ApiToTrio(apiResult);
        
        const trio = trios.find(t => t.agentId === agentId && t.patientId === patientId);
        return trio?.id ?? -1;
    }
}

export const avpTrioController_api = new AVPTrioController();