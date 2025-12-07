import { IAVPTrioController } from "@/controllers/interfaces/IAVPTrioController";
import { ISubjectObjectController } from "@/controllers/interfaces/ISubjectObjectController";
import { IVerbController } from "@/controllers/interfaces/IVerbController";
import { Agent, Patient, Verb } from "@/database/schemas";
import { WordBundle } from "./wordBundle";
import { historyService } from "./historyService";
import { Platform } from "react-native";

// Dynamic imports, to make sure that Realm is never imported, when the web version is being used.

let agentController:   ISubjectObjectController<Agent> | undefined;
let patientController: ISubjectObjectController<Patient> | undefined;
let verbController:    IVerbController | undefined;
let avpTrioController: IAVPTrioController | undefined;

// Initialize with default (realm) controllers
let currentDataSource: 'local' | 'api' = 'local';
let controllersInitialized = false;

function loadAVPControllers(dataSource: 'local' | 'api') {
  if (currentDataSource === dataSource && controllersInitialized) {
    console.log(`⏭️ AVP Controllers already loaded for ${dataSource} mode, skipping reload`);
    return;
  }
  
  currentDataSource = dataSource;
  
  try {
    if (dataSource === 'api') {
      // Load API controllers
      const agentModule = require("@/controllers/api_controllers/AgentController");
      const patientModule = require("@/controllers/api_controllers/PatientController");
      const verbModule = require("@/controllers/api_controllers/VerbController");
      const avpTrioModule = require("@/controllers/api_controllers/AVPTrioController");
      
      agentController = agentModule.agentController_api;
      patientController = patientModule.patientController_api;
      verbController = verbModule.verbController_api;
      avpTrioController = avpTrioModule.avpTrioController_api;
      console.log('🌐 AVPService: Switched to API controllers (Backend mode)');
    } else {
      // Load realm controllers (which use WebStorageAdapter on web for JSON data)
      const agentModule = require("@/controllers/realm_controllers/AgentController");
      const patientModule = require("@/controllers/realm_controllers/PatientController");
      const verbModule = require("@/controllers/realm_controllers/VerbController");
      const avpTrioModule = require("@/controllers/realm_controllers/AVPTrioController");
      
      agentController = agentModule.agentController_realm;
      patientController = patientModule.patientController_realm;
      verbController = verbModule.verbController_realm;
      avpTrioController = avpTrioModule.avpTrioController_realm;
      console.log('💾 AVPService: Switched to Local controllers (JSON data on web, Realm on native)');
    }
    
    // Verify controllers are properly loaded
    if (!agentController || !patientController || !verbController || !avpTrioController) {
      throw new Error(`Failed to load AVP controllers for ${dataSource} mode`);
    }
    
    controllersInitialized = true;
  } catch (error) {
    console.error(`❌ Error loading ${dataSource} AVP controllers:`, error);
    controllersInitialized = false;
    throw error;
  }
}

// Validate controllers are loaded
function ensureAVPControllersLoaded() {
  if (!controllersInitialized || !agentController || !patientController || !verbController || !avpTrioController) {
    console.log('🔄 AVP Controllers not initialized, loading defaults...');
    loadAVPControllers('local');
  }
  
  if (!agentController || !patientController || !verbController || !avpTrioController) {
    throw new Error('AVP Controllers failed to initialize properly');
  }
}

// Ensure controllers are loaded on module initialization
try {
  loadAVPControllers('local');
} catch (error) {
  console.error('❌ Failed to initialize AVP controllers on module load:', error);
}

// Export function to allow switching data sources
export { loadAVPControllers };

export const avpService = {
    getWordBundleByVerbId: async (id: number | null): Promise<WordBundle | null> => {
        if (id === null) return null;
        ensureAVPControllersLoaded();
        const verb = await verbController!.getById(id);
        if (!verb) return null;
        
        // Filter out undefined values
        const trios = await avpTrioController!.GetRandomByVerbId(id)
        
        if (trios.length === 0) {
            console.warn(`No AVP trio data found for verbId: ${id}`);
            return null;
        }

        const agents: Agent[] = await Promise.all(
            trios.map(async trio => {
                const agent = await agentController!.getById(trio.agentId);
                return agent!;
            })
        )

        const patients: Patient[] = await Promise.all(
            trios.map(async trio => {
                const patient = await patientController!.getById(trio.patientId);
                return patient!;
            })
        )

        return { verb: verb, subjects: agents, objects: patients, pairings: trios };
    },

    isCorrectCombination: async (agent: Agent, verb: Verb, patient: Patient): Promise<boolean> => {
        if (agent === null || verb === null || patient === null) return false;
        ensureAVPControllersLoaded();
        const answer = await avpTrioController!.IsCorrectCombination(agent.id, verb.id, patient.id);
        if (answer && Platform.OS !== "web") { 
            const trioId = await avpTrioController!.GetIdByAgentVerbPatient(agent.id, verb.id, patient.id);
            historyService.set(trioId);
        }
        return answer;
    }
};