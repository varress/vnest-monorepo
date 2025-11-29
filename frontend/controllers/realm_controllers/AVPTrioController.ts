import { AgentVerbPatient_Trio } from '../../database/schemas';
import { IAVPTrioController } from '../interfaces/IAVPTrioController';
import { BaseController } from './BaseController';

export class AVPTrioController extends BaseController<AgentVerbPatient_Trio> implements IAVPTrioController {
    schemaName =   'AgentVerbPatient_Trio';
    jsonFileName = 'avp_trios';

    private async getAllByVerbId(verbId: number): Promise<AgentVerbPatient_Trio[]> {
        const all = await this.getAll();
        return all.filter(e => e.verbId == verbId);
    }

    /**
     * Retrieves random Agent-Verb-Patient combinations for a specific verb
     * 
     * @param verbId - The ID of the verb to get combinations for
     * @param isFitting - Whether to get correct (true) or incorrect (false) combinations
     * @param count - Number of combinations to return (default: 1)
     * @returns Promise<AgentVerbPatient_Trio[]> - Array of matching combinations
     */
    async GetRandomByVerbId(
        verbId:    number,
        count:     number = 3
    ): Promise<AgentVerbPatient_Trio[]> {
        const all = await this.getAllByVerbId(verbId);
        return this.getRandomElements(all, count)
    }

    async IsCorrectCombination(
        agentId:   number,
        verbId:    number,
        patientId: number
    ): Promise<boolean> {
        const all = await this.getAllByVerbId(verbId);
        const filtered = all.filter(e => e.agentId === agentId && e.patientId === patientId);
        return filtered.length >= 1;
    }

    async GetIdByAgentVerbPatient(agentId: number, verbId: number, patientId: number): Promise<number> {
        const all =   await this.getAllByVerbId(verbId);
        const match = all.find(e => e.agentId === agentId && e.patientId === patientId);
        return match ? match.id : -1;
    }
}

export const avpTrioController_realm = new AVPTrioController();