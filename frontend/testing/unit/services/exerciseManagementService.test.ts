// This test suite is generated with Claude Sonnet 4.5
// All test cases are checked and verified by @trnvanh to ensure the functionality validity

import { databaseService } from '@/services/exerciseManagementService';
import { Agent, Patient, Verb, AgentVerbPatient_Trio } from '@/database/schemas';

// Mock the controllers
jest.mock('@/controllers/realm_controllers/AgentController', () => ({
  agentController_realm: {
    getById: jest.fn(),
    getAll: jest.fn(),
    getByVerbId: jest.fn(),
  }
}));

jest.mock('@/controllers/realm_controllers/PatientController', () => ({
  patientController_realm: {
    getById: jest.fn(),
    getAll: jest.fn(),
    getByVerbId: jest.fn(),
  }
}));

jest.mock('@/controllers/realm_controllers/VerbController', () => ({
  verbController_realm: {
    getById: jest.fn(),
    getAll: jest.fn(),
    getAllVerbsByGroupId: jest.fn(),
  }
}));

jest.mock('@/controllers/realm_controllers/AVPTrioController', () => ({
  avpTrioController_realm: {
    GetRandomByVerbId: jest.fn(),
    IsCorrectCombination: jest.fn(),
    GetIdByAgentVerbPatient: jest.fn(),
    getAll: jest.fn(),
  }
}));

jest.mock('@/services/avpService');

describe('DatabaseService', () => {
  let agentController: any;
  let patientController: any;
  let verbController: any;
  let avpTrioController: any;
  let avpService: any;

  const mockVerbs: Verb[] = [
    { id: 1, value: 'syödä', type: 'Verb', groupId: 0, groupName: 'Group 1' },
    { id: 2, value: 'juoda', type: 'Verb', groupId: 0, groupName: 'Group 1' },
    { id: 3, value: 'lukea', type: 'Verb', groupId: 0, groupName: 'Group 1' },
    { id: 4, value: 'kirjoittaa', type: 'Verb', groupId: 1, groupName: 'Group 2' },
  ];

  const mockAgents: Agent[] = [
    { id: 1, value: 'minä', type: 'Agent' },
    { id: 2, value: 'sinä', type: 'Agent' },
  ];

  const mockPatients: Patient[] = [
    { id: 10, value: 'ruokaa', type: 'Patient' },
    { id: 11, value: 'vettä', type: 'Patient' },
  ];

  const mockTrios: AgentVerbPatient_Trio[] = [
    {
      id: 100,
      agentId: 1,
      verbId: 1,
      patientId: 10,
      groupId: 0,
      type: 'AgentVerbPatient_Trio'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset the singleton state
    (databaseService as any).initialized = null;
    (databaseService as any).currentVerbId = -1;
    (databaseService as any).currentGroupId = 0;
    (databaseService as any).verbsInGroup = [];
    
    agentController = require('@/controllers/realm_controllers/AgentController').agentController_realm;
    patientController = require('@/controllers/realm_controllers/PatientController').patientController_realm;
    verbController = require('@/controllers/realm_controllers/VerbController').verbController_realm;
    avpTrioController = require('@/controllers/realm_controllers/AVPTrioController').avpTrioController_realm;
    avpService = require('@/services/avpService').avpService;

    // Default mock implementations
    verbController.getAllVerbsByGroupId.mockResolvedValue(mockVerbs.filter(v => v.groupId === 0));
    verbController.getById.mockImplementation((id: number) => 
      Promise.resolve(mockVerbs.find(v => v.id === id) || null)
    );
    agentController.getByVerbId.mockResolvedValue(mockAgents);
    patientController.getByVerbId.mockResolvedValue(mockPatients);
    avpService.getWordBundleByVerbId.mockResolvedValue({
      verb: mockVerbs[0],
      subjects: mockAgents,
      objects: mockPatients,
      pairings: mockTrios
    });
  });

  describe('initialize', () => {
    it('should initialize with group 0 and set first verb', async () => {
      await databaseService.initialize(0);

      expect(verbController.getAllVerbsByGroupId).toHaveBeenCalledWith(0);
      
      const currentVerb = await databaseService.getCurrentVerb();
      expect(currentVerb).toEqual(mockVerbs[0]);
    });

    it('should initialize with specified group id', async () => {
      const group1Verbs = mockVerbs.filter(v => v.groupId === 1);
      verbController.getAllVerbsByGroupId.mockResolvedValue(group1Verbs);

      await databaseService.initialize(1);

      expect(verbController.getAllVerbsByGroupId).toHaveBeenCalledWith(1);
    });
  });

  describe('getWordDataForCurrentVerb', () => {
    it('should return complete word data for current verb', async () => {
      await databaseService.initialize(0);

      const wordData = await databaseService.getWordDataForCurrentVerb();

      expect(wordData).toBeDefined();
      expect(wordData.currentVerb).toEqual(mockVerbs[0]);
      expect(wordData.subjects).toEqual(mockAgents);
      expect(wordData.objects).toEqual(mockPatients);
      expect(wordData.verbs.length).toBeGreaterThan(0);
      expect(wordData.pairings).toEqual(mockTrios);
    });

    it('should call ensureInitialized before returning data', async () => {
      // Don't initialize manually
      verbController.getAllVerbsByGroupId.mockResolvedValue([mockVerbs[0]]);
      
      const wordData = await databaseService.getWordDataForCurrentVerb();

      expect(verbController.getAllVerbsByGroupId).toHaveBeenCalled();
      expect(wordData).toBeDefined();
    });
  });

  describe('setCurrentVerb', () => {
    it('should set the current verb by id', async () => {
      await databaseService.initialize(0);
      await databaseService.setCurrentVerb(2);

      const currentVerb = await databaseService.getCurrentVerb();
      expect(currentVerb).toEqual(mockVerbs[1]);
    });
  });

  describe('getCurrentVerb', () => {
    it('should return current verb', async () => {
      await databaseService.initialize(0);

      const verb = await databaseService.getCurrentVerb();
      
      expect(verb).toBeDefined();
      expect(verb?.id).toBe(1);
    });

    it('should return null when no verb is set', async () => {
      verbController.getAllVerbsByGroupId.mockResolvedValue([]);
      await databaseService.initialize(0);

      const verb = await databaseService.getCurrentVerb();
      expect(verb).toBeNull();
    });
  });

  describe('setCurrentGroup', () => {
    it('should change to different group and reset verb', async () => {
      await databaseService.initialize(0);
      
      const group1Verbs = mockVerbs.filter(v => v.groupId === 1);
      verbController.getAllVerbsByGroupId.mockResolvedValue(group1Verbs);

      await databaseService.setCurrentGroup(1);

      expect(verbController.getAllVerbsByGroupId).toHaveBeenCalledWith(1);
      
      // After setting group, we need to call getNextVerb to advance
      await databaseService.getNextVerb();
      
      // Should start with first verb of new group
      const currentVerb = await databaseService.getCurrentVerb();
      expect(currentVerb?.groupId).toBe(1);
    });

    it('should load all verbs for the specified group', async () => {
      const group0Verbs = mockVerbs.filter(v => v.groupId === 0);
      verbController.getAllVerbsByGroupId.mockResolvedValue(group0Verbs);

      await databaseService.setCurrentGroup(0);

      expect(verbController.getAllVerbsByGroupId).toHaveBeenCalledWith(0);
      
      const wordData = await databaseService.getWordDataForCurrentVerb();
      expect(wordData.verbs).toEqual(group0Verbs);
    });
  });

  describe('getNextVerb', () => {
    it('should return next verb in sequence', async () => {
      await databaseService.initialize(0);

      const nextVerb = await databaseService.getNextVerb();
      
      expect(nextVerb).toBeDefined();
      expect(nextVerb?.id).toBe(2); // Second verb in group 0
    });

    it('should return null when at last verb', async () => {
      await databaseService.initialize(0);
      
      // Move through all verbs
      await databaseService.setCurrentVerb(3); // Last verb in group 0
      
      const nextVerb = await databaseService.getNextVerb();
      expect(nextVerb).toBeNull();
    });

    it('should return null when no verbs in group', async () => {
      verbController.getAllVerbsByGroupId.mockResolvedValue([]);
      await databaseService.initialize(0);

      const nextVerb = await databaseService.getNextVerb();
      expect(nextVerb).toBeNull();
    });

    it('should increment through all verbs in order', async () => {
      const group0Verbs = mockVerbs.filter(v => v.groupId === 0);
      verbController.getAllVerbsByGroupId.mockResolvedValue(group0Verbs);
      
      await databaseService.initialize(0);

      const verb1 = await databaseService.getCurrentVerb();
      expect(verb1?.id).toBe(1);

      const verb2 = await databaseService.getNextVerb();
      expect(verb2?.id).toBe(2);

      const verb3 = await databaseService.getNextVerb();
      expect(verb3?.id).toBe(3);

      const verb4 = await databaseService.getNextVerb();
      expect(verb4).toBeNull(); // No more verbs in group 0
    });
  });

  describe('ensureInitialized', () => {
    it('should only initialize once even when called multiple times', async () => {
      await databaseService.ensureInitialized();
      await databaseService.ensureInitialized();
      await databaseService.ensureInitialized();

      // Should only call getAllVerbsByGroupId once during initialization
      expect(verbController.getAllVerbsByGroupId).toHaveBeenCalledTimes(1);
    });
  });
});
