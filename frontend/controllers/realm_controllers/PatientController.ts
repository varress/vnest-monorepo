import { getRealm } from '@/database/realm';
import { AgentVerbPatient_Trio, Patient } from '../../database/schemas';
import { BaseController } from './BaseController';

export class PatientController extends BaseController<Patient> {
    schemaName =   'Patient';
    jsonFileName = 'patients';

    async getByVerbId(verbId: number, count: number = 3): Promise<Patient[]> {
            const realm = await getRealm();
            const trios = realm.objects<AgentVerbPatient_Trio>("AgentVerbPatient_Trio").filter(t => t.verbId === verbId);
            const patientIds = [...new Set(trios.map(t => t.agentId))];
            const patients = realm.objects<Patient>(this.schemaName)
                .filtered('id IN $0', patientIds)
                .map(a => ({ ...a }));
            return this.getRandomElements(patients, count);
        }
}

export const patientController = new PatientController();