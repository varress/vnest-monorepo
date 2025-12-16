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
import { avpService } from './avpService';

let agentController:   ISubjectObjectController<Agent> | undefined;
let patientController: ISubjectObjectController<Patient> | undefined;
let verbController:    IVerbController | undefined;

// Initialize with default (realm) controllers
let currentDataSource: 'local' | 'api' = 'api';
let controllersInitialized = false;

function loadControllers(dataSource: 'local' | 'api') {
  if (currentDataSource === dataSource && controllersInitialized) {
    console.log(`⏭️ Controllers already loaded for ${dataSource} mode, skipping reload`);
    return;
  }
  
  currentDataSource = dataSource;
  
  try {
    if (dataSource === 'api') {
      // Load API controllers
      const agentModule = require("@/controllers/api_controllers/AgentController");
      const patientModule = require("@/controllers/api_controllers/PatientController");
      const verbModule = require("@/controllers/api_controllers/VerbController");
      
      agentController = agentModule.agentController_api;
      patientController = patientModule.patientController_api;
      verbController = verbModule.verbController_api;
      console.log('🌐 ExerciseManagementService: Switched to API controllers (Backend mode)');
    } else {
      // Load realm controllers (which use WebStorageAdapter on web for JSON data)
      const agentModule = require("@/controllers/realm_controllers/AgentController");
      const patientModule = require("@/controllers/realm_controllers/PatientController");
      const verbModule = require("@/controllers/realm_controllers/VerbController");
      
      agentController = agentModule.agentController_realm;
      patientController = patientModule.patientController_realm;
      verbController = verbModule.verbController_realm;
      console.log('💾 ExerciseManagementService: Switched to Local controllers (JSON data on web, Realm on native)');
    }
    
    // Verify controllers are properly loaded
    if (!agentController || !patientController || !verbController) {
      throw new Error(`Failed to load controllers for ${dataSource} mode`);
    }
    
    controllersInitialized = true;
  } catch (error) {
    console.error(`❌ Error loading ${dataSource} controllers:`, error);
    controllersInitialized = false;
    throw error;
  }
}

// Ensure controllers are loaded on module initialization
try {
  loadControllers('local');
} catch (error) {
  console.error('❌ Failed to initialize controllers on module load:', error);
}

// Validate controllers are loaded
function ensureControllersLoaded() {
  if (!controllersInitialized || !agentController || !patientController || !verbController) {
    console.log('🔄 Controllers not initialized, loading defaults...');
    loadControllers('local');
  }
  
  if (!agentController || !patientController || !verbController) {
    throw new Error('Controllers failed to initialize properly');
  }
}

// Export function to allow switching data sources
export { loadControllers };

export interface DatabaseWordData {
  verbs: Verb[];              // All available Finnish verbs
  subjects: Agent[];          // All available subjects/agents (pronouns, nouns)
  objects: Patient[];         // All available objects/patients (in correct case forms)
  currentVerb: Verb | null;   // The verb currently being practiced
  pairings: AgentVerbPatient_Trio[] | null;  // Pre-calculated correct and incorrect combinations
}

class DatabaseService {
  private currentVerbId: number = -1; // Start with verbId -1 (no verb selected)
  private currentGroupId: number = 2;  // Default to group 2 (backend's first group)
  private verbsInGroup: Verb[] = [];

  private initialized: Promise<void> | null = null;

  constructor() {
    // Don't auto-initialize - wait for explicit call
  }

  async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      this.initialized = this.initialize(2).catch(err => {
        console.error("DatabaseService auto-init failed:", err);
        throw err;
      });
    }
    await this.initialized;
  }

  async initialize(groupId: number): Promise<void> {
    console.log('Initializing database service with groupId:', groupId);
    this.currentGroupId = groupId;
    await this.setCurrentGroup(groupId);
    await this.getNextVerb();
  }

  async getWordDataForCurrentVerb(): Promise<DatabaseWordData> {
    await this.ensureInitialized();
    ensureControllersLoaded();
    const wordBundle = await avpService.getWordBundleByVerbId(this.currentVerbId)
    return {
      verbs: this.verbsInGroup,
      subjects: await agentController!.getByVerbId(this.currentVerbId, 100),
      objects: await patientController!.getByVerbId(this.currentVerbId, 100),
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
    ensureControllersLoaded();
    if (this.currentVerbId === -1) return null;
    return await verbController!.getById(this.currentVerbId);
  }

  async setCurrentGroup(groupId: number): Promise<void> {
    console.log(`📚 Setting current group to: ${groupId}`);
    ensureControllersLoaded();
    this.currentGroupId = groupId;
    this.verbsInGroup = await verbController!.getAllVerbsByGroupId(this.currentGroupId);
    // Set currentVerbId to the first verb in this group, not 0
    this.currentVerbId = this.verbsInGroup.length > 0 ? this.verbsInGroup[0].id : -1;
    console.log(`📖 Loaded ${this.verbsInGroup.length} verbs for group ${groupId}:`, this.verbsInGroup.map(v => v.value));
    console.log(`🎯 Set current verb to ID: ${this.currentVerbId}`);
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