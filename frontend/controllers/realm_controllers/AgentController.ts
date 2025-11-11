import { database } from '@/database';
import { Agent, AgentVerbPatient_Trio } from '../../database/schemas';
import { ISubjectObjectController } from '../interfaces/ISubjectObjectController';
import { BaseController } from './BaseController';

export class AgentController extends BaseController<Agent> implements ISubjectObjectController<Agent> {
    schemaName =   'Agent';
    jsonFileName = 'agents';

    async getByVerbId(verbId: number, count: number = 3): Promise<Agent[]> {
        const trios = await database.query<AgentVerbPatient_Trio>("AgentVerbPatient_Trio", { verbId });
        const agentIds = Array.from(new Set(trios.map(t => t.agentId)));
        const allAgents = await database.query<Agent>(this.schemaName);
        const agents = allAgents.filter(a => agentIds.includes(a.id));
        return this.getRandomElements(agents, count);
    }
}

export const agentController_realm = new AgentController();