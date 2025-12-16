// This test suite is generated with Claude Sonnet 4.5
// All test cases are checked and verified by @trnvanh to ensure the functionality validity

import { historyService } from '@/services/historyService';
import { CorrectAnswer, Verb, AgentVerbPatient_Trio } from '@/database/schemas';

// Mock the controllers
jest.mock('@/controllers/realm_controllers/HistoryController', () => ({
  historyController_realm: {
    getAll: jest.fn(),
    getById: jest.fn(),
    getAllCorrectAnswersByGroupId: jest.fn(),
    setCorrectAnswer: jest.fn(),
  }
}));

jest.mock('@/controllers/realm_controllers/VerbController', () => ({
  verbController_realm: {
    getAll: jest.fn(),
    getById: jest.fn(),
    getAllVerbsByGroupId: jest.fn(),
  }
}));

jest.mock('@/controllers/realm_controllers/AVPTrioController', () => ({
  avpTrioController_realm: {
    getAll: jest.fn(),
    GetRandomByVerbId: jest.fn(),
    IsCorrectCombination: jest.fn(),
  }
}));

describe('HistoryService', () => {
  let historyController: any;
  let verbController: any;
  let avpTrioController: any;

  const mockVerbs: Verb[] = [
    { id: 1, value: 'syödä', type: 'Verb', groupId: 0, groupName: 'Eating' },
    { id: 2, value: 'juoda', type: 'Verb', groupId: 0, groupName: 'Eating' },
    { id: 3, value: 'lukea', type: 'Verb', groupId: 1, groupName: 'Learning' },
  ];

  const mockTrios: AgentVerbPatient_Trio[] = [
    { id: 100, agentId: 1, verbId: 1, patientId: 10, groupId: 0, type: 'AgentVerbPatient_Trio' },
    { id: 101, agentId: 2, verbId: 1, patientId: 11, groupId: 0, type: 'AgentVerbPatient_Trio' },
    { id: 102, agentId: 1, verbId: 2, patientId: 10, groupId: 0, type: 'AgentVerbPatient_Trio' },
    { id: 103, agentId: 1, verbId: 3, patientId: 12, groupId: 1, type: 'AgentVerbPatient_Trio' },
  ];

  const mockCorrectAnswers: CorrectAnswer[] = [
    { id: 1, trioId: 100, createdAt: new Date('2025-01-01'), type: 'Correct Answer' },
    { id: 2, trioId: 101, createdAt: new Date('2025-01-02'), type: 'Correct Answer' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    historyController = require('@/controllers/realm_controllers/HistoryController').historyController_realm;
    verbController = require('@/controllers/realm_controllers/VerbController').verbController_realm;
    avpTrioController = require('@/controllers/realm_controllers/AVPTrioController').avpTrioController_realm;

    // Default mock implementations
    historyController.getAll.mockResolvedValue(mockCorrectAnswers);
    verbController.getAll.mockResolvedValue(mockVerbs);
    avpTrioController.getAll.mockResolvedValue(mockTrios);
  });

  describe('getAll', () => {
    it('should return all correct answers', async () => {
      const result = await historyService.getAll();

      expect(historyController.getAll).toHaveBeenCalled();
      expect(result).toEqual(mockCorrectAnswers);
    });
  });

  describe('getById', () => {
    it('should return correct answer by id', async () => {
      historyController.getById.mockResolvedValue(mockCorrectAnswers[0]);

      const result = await historyService.getById(1);

      expect(historyController.getById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockCorrectAnswers[0]);
    });

    it('should return null when id not found', async () => {
      historyController.getById.mockResolvedValue(null);

      const result = await historyService.getById(999);

      expect(result).toBeNull();
    });
  });

  describe('getAllByGroupId', () => {
    it('should return correct answers for specific group', async () => {
      const group0Answers = [mockCorrectAnswers[0]];
      historyController.getAllCorrectAnswersByGroupId.mockResolvedValue(group0Answers);

      const result = await historyService.getAllByGroupId(0);

      expect(historyController.getAllCorrectAnswersByGroupId).toHaveBeenCalledWith(0);
      expect(result).toEqual(group0Answers);
    });
  });

  describe('set', () => {
    it('should record correct answer for trio', async () => {
      await historyService.set(100);

      expect(historyController.setCorrectAnswer).toHaveBeenCalledWith(100);
    });
  });

  describe('getGroupPerformance', () => {
    it('should calculate performance statistics for each group', async () => {
      const result = await historyService.getGroupPerformance();

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      
      // Check structure
      result.forEach(group => {
        expect(group).toHaveProperty('groupId');
        expect(group).toHaveProperty('groupName');
        expect(group).toHaveProperty('total_trios');
        expect(group).toHaveProperty('correct_trios');
        expect(group).toHaveProperty('percentage');
      });
    });

    it('should calculate correct statistics for group 0', async () => {
      const result = await historyService.getGroupPerformance();
      
      const group0 = result.find(g => g.groupId === 0);
      
      expect(group0).toBeDefined();
      expect(group0?.groupName).toBe('Eating');
      expect(group0?.total_trios).toBe(3); // 3 trios in group 0
      expect(group0?.correct_trios).toBe(2); // 2 correct answers for group 0
      expect(group0?.percentage).toBeCloseTo(66.67, 1);
    });

    it('should calculate correct statistics for group 1', async () => {
      const result = await historyService.getGroupPerformance();
      
      const group1 = result.find(g => g.groupId === 1);
      
      expect(group1).toBeDefined();
      expect(group1?.groupName).toBe('Learning');
      expect(group1?.total_trios).toBe(1); // 1 trio in group 1
      expect(group1?.correct_trios).toBe(0); // No correct answers for group 1
      expect(group1?.percentage).toBe(0);
    });

    it('should handle groups with no trios', async () => {
      const verbsWithEmptyGroup: Verb[] = [
        ...mockVerbs,
        { id: 4, value: 'test', type: 'Verb', groupId: 2, groupName: 'Empty Group' }
      ];
      
      verbController.getAll.mockResolvedValue(verbsWithEmptyGroup);

      const result = await historyService.getGroupPerformance();
      
      const emptyGroup = result.find(g => g.groupId === 2);
      
      expect(emptyGroup).toBeDefined();
      expect(emptyGroup?.total_trios).toBe(0);
      expect(emptyGroup?.correct_trios).toBe(0);
      expect(emptyGroup?.percentage).toBe(0);
    });

    it('should aggregate data correctly from all controllers', async () => {
      await historyService.getGroupPerformance();

      expect(verbController.getAll).toHaveBeenCalled();
      expect(avpTrioController.getAll).toHaveBeenCalled();
      expect(historyController.getAll).toHaveBeenCalled();
    });

    it('should handle 100% completion', async () => {
      const allCorrect: CorrectAnswer[] = [
        { id: 1, trioId: 100, createdAt: new Date(), type: 'Correct Answer' },
        { id: 2, trioId: 101, createdAt: new Date(), type: 'Correct Answer' },
        { id: 3, trioId: 102, createdAt: new Date(), type: 'Correct Answer' },
      ];
      
      historyController.getAll.mockResolvedValue(allCorrect);

      const result = await historyService.getGroupPerformance();
      const group0 = result.find(g => g.groupId === 0);
      
      expect(group0?.percentage).toBe(100);
    });

    it('should ignore correct answers for non-existent trios', async () => {
      const answersWithInvalid: CorrectAnswer[] = [
        ...mockCorrectAnswers,
        { id: 3, trioId: 999, createdAt: new Date(), type: 'Correct Answer' }, // Invalid trio
      ];
      
      historyController.getAll.mockResolvedValue(answersWithInvalid);

      const result = await historyService.getGroupPerformance();
      const group0 = result.find(g => g.groupId === 0);
      
      // Should only count 2 correct answers, ignoring the invalid one
      expect(group0?.correct_trios).toBe(2);
    });
  });
});
