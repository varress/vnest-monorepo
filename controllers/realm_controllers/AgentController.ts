import { getRealm } from '@/database/realm';
import { Agent, AgentVerbPatient_Trio } from '../../database/schemas';
import { BaseController } from './BaseController';

export class AgentController extends BaseController<Agent> {
    schemaName =   'Agent';
    jsonFileName = 'agents';

    async getByVerbId(verbId: number, count: number = 3): Promise<Agent[]> {
        const realm = await getRealm();
        const trios = realm.objects<AgentVerbPatient_Trio>("AgentVerbPatient_Trio").filter(t => t.verbId === verbId);
        const agentIds = [...new Set(trios.map(t => t.agentId))];
        const agents = realm.objects<Agent>(this.schemaName)
            .filtered('id IN $0', agentIds)
            .map(a => ({ ...a }));
        return this.getRandomElements(agents, count);
    }
}

export const agentController = new AgentController();