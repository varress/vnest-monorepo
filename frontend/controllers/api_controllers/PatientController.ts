import { Patient } from "@/database/schemas";
import { ISubjectObjectController } from "../interfaces/ISubjectObjectController";
import { avpTrioController_api } from "./AVPTrioController";
import { BaseController } from "./BaseController";

export class PatientController extends BaseController<Patient> implements ISubjectObjectController<Patient> {
    constructor() {
        super("Patient", "OBJECT");
    }

    async getByVerbId(verbId: number, count: number = 3): Promise<Patient[]> {
        const allTrios =         await avpTrioController_api.getAll();
        const matchingTrios =    allTrios.filter(trio => trio.verbId === verbId);
        const allPatientIds =    matchingTrios.map(trio => trio.patientId);
        const randomPatientIds = this.getRandomElements(allPatientIds, count);
        const allPatients =      await this.getAll();
        return allPatients.filter(agent => randomPatientIds.includes(agent.id));
    }
}

export const patientController_api = new PatientController();