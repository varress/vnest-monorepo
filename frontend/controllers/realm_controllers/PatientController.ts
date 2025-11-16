import { database } from '@/database';
import { AgentVerbPatient_Trio, Patient } from '../../database/schemas';
import { ISubjectObjectController } from '../interfaces/ISubjectObjectController';
import { BaseController } from './BaseController';

export class PatientController extends BaseController<Patient> implements ISubjectObjectController<Patient> {
    schemaName =   'Patient';
    jsonFileName = 'patients';

    async getByVerbId(verbId: number, count: number = 3): Promise<Patient[]> {
        const trios = await database.query<AgentVerbPatient_Trio>("AgentVerbPatient_Trio", { verbId });
        const patientIds = Array.from(new Set(trios.map(t => t.patientId)));
        const allPatients = await database.query<Patient>(this.schemaName);
        const patients = allPatients.filter(p => patientIds.includes(p.id));
        return this.getRandomElements(patients, count);
    }
}

export const patientController_realm = new PatientController();