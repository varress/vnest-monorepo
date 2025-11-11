import { IAVPTrioController } from "@/controllers/interfaces/IAVPTrioController";
import { ISubjectObjectController } from "@/controllers/interfaces/ISubjectObjectController";
import { IVerbController } from "@/controllers/interfaces/IVerbController";
import { Agent, Patient, Verb } from "@/database/schemas";
import { WordBundle } from "./wordBundle";

// Dynamic imports, to make sure that Realm is never imported, when the web version is being used.

let agentController:   ISubjectObjectController<Agent>;
let patientController: ISubjectObjectController<Patient>;
let verbController:    IVerbController;
let avpTrioController: IAVPTrioController;

// Use realm controllers for all platforms (web will use WebStorageAdapter automatically)
({ agentController_realm:   agentController } =   require("@/controllers/realm_controllers/AgentController"));
({ patientController_realm: patientController } = require("@/controllers/realm_controllers/PatientController"));
({ verbController_realm:    verbController } =    require("@/controllers/realm_controllers/VerbController"));
({ avpTrioController_realm: avpTrioController } = require("@/controllers/realm_controllers/AVPTrioController"));

export const avpService = {
    getWordBundleByVerbId: async (id: number | null): Promise<WordBundle | null> => {
        if (id === null) return null;
        const verb = await verbController.getById(id);
        if (!verb) return null;
        
        // Filter out undefined values
        const trios = await avpTrioController.GetRandomByVerbId(id)
        
        if (trios.length === 0) {
            console.warn(`No AVP trio data found for verbId: ${id}`);
            return null;
        }

        const agents: Agent[] = await Promise.all(
            trios.map(async trio => {
                const agent = await agentController.getById(trio.agentId);
                return agent!;
            })
        )

        const patients: Patient[] = await Promise.all(
            trios.map(async trio => {
                const patient = await patientController.getById(trio.patientId);
                return patient!;
            })
        )

        return { verb: verb, subjects: agents, objects: patients, pairings: trios };
    },

    isCorrectCombination: async (agent: Agent, verb: Verb, patient: Patient): Promise<boolean> => {
        if (agent === null || verb === null || patient === null) return false;
        return avpTrioController.IsCorrentCombination(agent.id, verb.id, patient.id);
    }
};