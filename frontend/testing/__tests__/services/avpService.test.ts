// This test suite is generated with Claude Sonnet 4.5
// All test cases are checked and verified by @trnvanh to ensure the functionality validity

import { avpService } from '@/services/avpService';
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

jest.mock('@/services/historyService', () => ({
  historyService: {
    set: jest.fn(),
    getAll: jest.fn(),
  }
}));

describe('avpService', () => {
  let agentController: any;
  let patientController: any;
  let verbController: any;
  let avpTrioController: any;
  let historyService: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    agentController = require('@/controllers/realm_controllers/AgentController').agentController_realm;
    patientController = require('@/controllers/realm_controllers/PatientController').patientController_realm;
    verbController = require('@/controllers/realm_controllers/VerbController').verbController_realm;
    avpTrioController = require('@/controllers/realm_controllers/AVPTrioController').avpTrioController_realm;
    historyService = require('@/services/historyService').historyService;
  });

  describe('getWordBundleByVerbId', () => {
    it('should return null when verbId is null', async () => {
      const result = await avpService.getWordBundleByVerbId(null);
      expect(result).toBeNull();
    });

    it('should return null when verb is not found', async () => {
      verbController.getById.mockResolvedValue(null);
      
      const result = await avpService.getWordBundleByVerbId(1);
      
      expect(verbController.getById).toHaveBeenCalledWith(1);
      expect(result).toBeNull();
    });

    it('should return null when no trios are found', async () => {
      const mockVerb: Verb = {
        id: 1,
        value: 'syödä',
        type: 'Verb',
        groupId: 0,
        groupName: 'Group 1'
      };
      
      verbController.getById.mockResolvedValue(mockVerb);
      avpTrioController.GetRandomByVerbId.mockResolvedValue([]);
      
      const result = await avpService.getWordBundleByVerbId(1);
      
      expect(result).toBeNull();
    });

    it('should return complete word bundle with verb, agents, and patients', async () => {
      const mockVerb: Verb = {
        id: 1,
        value: 'syödä',
        type: 'Verb',
        groupId: 0,
        groupName: 'Group 1'
      };

      const mockAgent1: Agent = {
        id: 1,
        value: 'minä',
        type: 'Agent'
      };

      const mockAgent2: Agent = {
        id: 2,
        value: 'sinä',
        type: 'Agent'
      };

      const mockPatient1: Patient = {
        id: 10,
        value: 'ruokaa',
        type: 'Patient'
      };

      const mockPatient2: Patient = {
        id: 11,
        value: 'leipää',
        type: 'Patient'
      };

      const mockTrios: AgentVerbPatient_Trio[] = [
        {
          id: 100,
          agentId: 1,
          verbId: 1,
          patientId: 10,
          groupId: 0,
          type: 'AgentVerbPatient_Trio'
        },
        {
          id: 101,
          agentId: 2,
          verbId: 1,
          patientId: 11,
          groupId: 0,
          type: 'AgentVerbPatient_Trio'
        }
      ];

      verbController.getById.mockResolvedValue(mockVerb);
      avpTrioController.GetRandomByVerbId.mockResolvedValue(mockTrios);
      agentController.getById
        .mockResolvedValueOnce(mockAgent1)
        .mockResolvedValueOnce(mockAgent2);
      patientController.getById
        .mockResolvedValueOnce(mockPatient1)
        .mockResolvedValueOnce(mockPatient2);

      const result = await avpService.getWordBundleByVerbId(1);

      expect(result).not.toBeNull();
      expect(result?.verb).toEqual(mockVerb);
      expect(result?.subjects).toHaveLength(2);
      expect(result?.subjects).toContainEqual(mockAgent1);
      expect(result?.subjects).toContainEqual(mockAgent2);
      expect(result?.objects).toHaveLength(2);
      expect(result?.objects).toContainEqual(mockPatient1);
      expect(result?.objects).toContainEqual(mockPatient2);
      expect(result?.pairings).toEqual(mockTrios);
    });
  });

  describe('isCorrectCombination', () => {
    const mockAgent: Agent = { id: 1, value: 'minä', type: 'Agent' };
    const mockVerb: Verb = { id: 1, value: 'syödä', type: 'Verb', groupId: 0, groupName: 'Group 1' };
    const mockPatient: Patient = { id: 10, value: 'ruokaa', type: 'Patient' };

    it('should return false when agent is null', async () => {
      const result = await avpService.isCorrectCombination(null as any, mockVerb, mockPatient);
      expect(result).toBe(false);
    });

    it('should return false when verb is null', async () => {
      const result = await avpService.isCorrectCombination(mockAgent, null as any, mockPatient);
      expect(result).toBe(false);
    });

    it('should return false when patient is null', async () => {
      const result = await avpService.isCorrectCombination(mockAgent, mockVerb, null as any);
      expect(result).toBe(false);
    });

    it('should return true for correct combination', async () => {
      avpTrioController.IsCorrectCombination.mockResolvedValue(true);
      avpTrioController.GetIdByAgentVerbPatient.mockResolvedValue(100);

      const result = await avpService.isCorrectCombination(mockAgent, mockVerb, mockPatient);

      expect(avpTrioController.IsCorrectCombination).toHaveBeenCalledWith(1, 1, 10);
      expect(result).toBe(true);
    });

    it('should return false for incorrect combination', async () => {
      avpTrioController.IsCorrectCombination.mockResolvedValue(false);

      const result = await avpService.isCorrectCombination(mockAgent, mockVerb, mockPatient);

      expect(avpTrioController.IsCorrectCombination).toHaveBeenCalledWith(1, 1, 10);
      expect(result).toBe(false);
    });

    it('should record history when combination is correct on native platform', async () => {
      // Mock Platform.OS to not be 'web'
      jest.doMock('react-native', () => ({
        Platform: { OS: 'android' }
      }));

      avpTrioController.IsCorrectCombination.mockResolvedValue(true);
      avpTrioController.GetIdByAgentVerbPatient.mockResolvedValue(100);

      await avpService.isCorrectCombination(mockAgent, mockVerb, mockPatient);

      expect(avpTrioController.GetIdByAgentVerbPatient).toHaveBeenCalledWith(1, 1, 10);
      expect(historyService.set).toHaveBeenCalledWith(100);
    });
  });
});
