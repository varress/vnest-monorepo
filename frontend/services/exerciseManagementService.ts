/**
 * Database Service for VN-EST App
 * 
 * This service provides a unified interface for managing data.
 * It handles verbs, agents (subjects), patients (objects), and their combinations
 * to create meaningful Finnish sentence exercises.
 * 
 * Key Features:
 * - Set management: Maps learning sets to specific verbs
 * - Word combination validation: Checks if agent-verb-patient combinations are grammatically correct
 * - Data aggregation: Combines data from multiple controllers into structured learning content
 * 
 * Data Structure:
 * - Agents: Finnish pronouns and nouns (minä, sinä, hän, opettaja, etc.)
 * - Verbs: Common Finnish verbs in first person form (luen, kirjoitan, syön, etc.)
 * - Patients: Objects in correct Finnish case forms (kirjan, ruokaa, vettä, etc.)
 * - AVP Trios: Valid combinations of Agent-Verb-Patient for sentence construction
 */

import { ISubjectObjectController } from '@/controllers/interfaces/ISubjectObjectController';
import { IVerbController } from '@/controllers/interfaces/IVerbController';
import { Agent, AgentVerbPatient_Trio, Patient, Verb } from '@/database/schemas';
import { Platform } from 'react-native';
import { avpService } from './avpService';

let agentController:   ISubjectObjectController<Agent>;
let patientController: ISubjectObjectController<Patient>;
let verbController:    IVerbController;

if (Platform.OS === "web") {
    ({ agentController_api:     agentController } =   require("@/controllers/api_controllers/AgentController"));
    ({ patientController_api:   patientController } = require("@/controllers/api_controllers/PatientController"));
    ({ verbController_api:      verbController } =    require("@/controllers/api_controllers/VerbController"));
}
else {
    ({ agentController_realm:   agentController } =   require("@/controllers/realm_controllers/AgentController"));
    ({ patientController_realm: patientController } = require("@/controllers/realm_controllers/PatientController"));
    ({ verbController_realm:    verbController } =    require("@/controllers/realm_controllers/VerbController"));
}

export interface DatabaseWordData {
  verbs: Verb[];              // All available Finnish verbs
  subjects: Agent[];          // All available subjects/agents (pronouns, nouns)
  objects: Patient[];         // All available objects/patients (in correct case forms)
  currentVerb: Verb | null;   // The verb currently being practiced
  pairings: AgentVerbPatient_Trio[] | null;  // Pre-calculated correct and incorrect combinations
}

class DatabaseService {
  private currentVerbId: number = -1; // Start with verbId 0
  private currentGroupId: number = 0;  // Current learning group, e.g. 4 groups, thematically differentiated
  private verbsInGroup: Verb[] = [];

  private initialized: Promise<void>;

  constructor() {
    this.initialized = this.initialize(0).catch(err => 
      console.error("DatabaseService auto-init failed:", err)
    );
  }

  async ensureInitialized(): Promise<void> {
    await this.initialized;
  }

  async initialize(groupId: number): Promise<void> {
    console.log('Initializing database service...');
    this.currentGroupId = groupId;
    await this.setCurrentGroup(groupId);
    await this.getNextVerb();
  }

  async getWordDataForCurrentVerb(): Promise<DatabaseWordData> {
    await this.ensureInitialized();
    const wordBundle = await avpService.getWordBundleByVerbId(this.currentVerbId)
    return {
      verbs: this.verbsInGroup,
      subjects: await agentController.getByVerbId(this.currentVerbId),
      objects: await patientController.getByVerbId(this.currentVerbId),
      currentVerb: await this.getCurrentVerb(),
      pairings: wordBundle?.pairings || null
    }
  }

  async setCurrentVerb(verbId: number): Promise<void> {
    await this.ensureInitialized();
    this.currentVerbId = verbId;
  }

  async getCurrentVerb(): Promise<Verb | null> {
    await this.ensureInitialized();
    if (this.currentVerbId === null) return null;
    return await verbController.getById(this.currentVerbId);
  }

  async setCurrentGroup(groupId: number): Promise<void> {
    this.currentGroupId = groupId;
    this.verbsInGroup   = await verbController.getAllVerbsByGroupId(this.currentGroupId);
  }

  async getNextVerb(): Promise<Verb | null> {
    if (!this.verbsInGroup || this.verbsInGroup.length === 0) { return null; }
    const nextVerb = this.verbsInGroup.find(v => v.id > (this.currentVerbId ?? -1)) || null;
    if(!nextVerb) return null;
    this.currentVerbId = nextVerb.id;
    return nextVerb;
  }
}

export const databaseService = new DatabaseService();