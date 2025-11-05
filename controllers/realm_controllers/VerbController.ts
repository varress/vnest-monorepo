import { Verb } from '../../database/schemas';
import { BaseController } from './BaseController';

export class VerbController extends BaseController<Verb> {
    schemaName =   'Verb';
    jsonFileName = 'verbs';

    async getRandomVerb(): Promise<Verb> {
        const all = await this.getAll();
        return await this.getRandomElements(all, 1)[0]
    }

    async getAllVerbsByGroupId(groupId: number): Promise<Verb[]> {
        const all =      await this.getAll();
        const filtered = all.filter(v => v.groupId == groupId)
        const ordered =  filtered.sort((a, b) => a.id - b.id);
        return ordered;
    }
}

export const verbController = new VerbController();