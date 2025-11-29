import { ApiCombination, ApiResponse, mapAVP_ApiToTrio, Patient } from "@/database/schemas";
import { ISubjectObjectController } from "../interfaces/ISubjectObjectController";
import { avpTrioController_api } from "./AVPTrioController";
import { BaseController } from "./BaseController";
import { API_URL } from "@/config";

export class PatientController extends BaseController<Patient> implements ISubjectObjectController<Patient> {
    constructor() {
        super("Patient", "OBJECT");
    }

    async getByVerbId(verbId: number, count: number = 3): Promise<Patient[]> {
        const res = await fetch(`${API_URL}/api/combinations?verb_id=${verbId}`, { method: 'GET'});
        if (!res.ok) return [];

        const apiResult: ApiResponse<ApiCombination> = await res.json();
        const matchingTrios = mapAVP_ApiToTrio(apiResult);
        
        const allPatientIds =    matchingTrios.map(trio => trio.patientId);
        const uniquePatientIds = [...new Set(allPatientIds)];
        const randomPatientIds = this.getRandomElements(uniquePatientIds, count);
        
        const patients = await Promise.all(randomPatientIds.map(id => this.getById(id)));
        
        return patients.filter((patient): patient is Patient => patient !== null);
    }
}

export const patientController_api = new PatientController();