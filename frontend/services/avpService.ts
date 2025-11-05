import { avpTrioController_api } from "@/controllers/api_controllers/AVPTrioController";
import { IAVPTrioController } from "@/controllers/interfaces/IAVPTrioController";
import { agentController } from "@/controllers/realm_controllers/AgentController";
import { avpTrioController_realm } from "@/controllers/realm_controllers/AVPTrioController";
import { patientController } from "@/controllers/realm_controllers/PatientController";
import { verbController } from "@/controllers/realm_controllers/VerbController";
import { Agent, Patient, Verb } from "@/database/schemas";
import { Platform } from 'react-native';
import { WordBundle } from "./wordBundle";

const avpTrioController: IAVPTrioController = 
    Platform.OS === 'web' ? avpTrioController_api : avpTrioController_realm;

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