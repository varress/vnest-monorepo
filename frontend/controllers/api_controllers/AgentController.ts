import { Agent } from "@/database/schemas";
import { ISubjectObjectController } from "../interfaces/ISubjectObjectController";
import { avpTrioController_api } from "./AVPTrioController";
import { BaseController } from "./BaseController";

export class AgentController extends BaseController<Agent> implements ISubjectObjectController<Agent> {
    constructor() {
        super("Agent", "SUBJECT");
    }

    async getByVerbId(verbId: number, count: number = 3): Promise<Agent[]> {
        const allTrios =       await avpTrioController_api.getAll();
        const matchingTrios =  allTrios.filter(trio => trio.verbId === verbId);
        const allAgentIds =    matchingTrios.map(trio => trio.agentId);
        const randomAgentIds = this.getRandomElements(allAgentIds, count);
        const allAgents =      await this.getAll();
        return allAgents.filter(agent => randomAgentIds.includes(agent.id));
    }
}

export const agentController_api = new AgentController();