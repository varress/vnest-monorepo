import { Agent, ApiCombination, ApiResponse, mapAVP_ApiToTrio } from "@/database/schemas";
import { ISubjectObjectController } from "../interfaces/ISubjectObjectController";
import { avpTrioController_api } from "./AVPTrioController";
import { BaseController } from "./BaseController";
import { API_URL } from "@/config";

export class AgentController extends BaseController<Agent> implements ISubjectObjectController<Agent> {
    constructor() {
        super("Agent", "SUBJECT");
    }

    async getByVerbId(verbId: number, count: number = 3): Promise<Agent[]> {
        const res = await fetch(`${API_URL}/api/combinations?verb_id=${verbId}`, { method: 'GET'});
        if (!res.ok) return [];

        const apiResult: ApiResponse<ApiCombination> = await res.json();
        const matchingTrios = mapAVP_ApiToTrio(apiResult);

        const allAgentIds =    matchingTrios.map(trio => trio.agentId);
        const uniqueAgentIds = [...new Set(allAgentIds)];
        const randomAgentIds = this.getRandomElements(uniqueAgentIds, count);

        const agents = await Promise.all(randomAgentIds.map(id => this.getById(id)));

        return agents.filter((agent): agent is Agent => agent !== null);
    }
}

export const agentController_api = new AgentController();