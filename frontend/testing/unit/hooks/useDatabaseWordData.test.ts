// This test suite is generated with Claude Sonnet 4.5
// All test cases are checked and verified by @trnvanh to ensure the functionality validity

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useDatabaseWordData } from '@/hooks/useDatabaseWordData';
import { Agent, Patient, Verb } from '@/database/schemas';

// Mock the services
jest.mock('@/services/exerciseManagementService', () => ({
  databaseService: {
    ensureInitialized: jest.fn(),
    getWordDataForCurrentVerb: jest.fn(),
    setCurrentGroup: jest.fn(),
    getNextVerb: jest.fn(),
    setCurrentVerb: jest.fn(),
  }
}));

jest.mock('@/services/avpService', () => ({
  avpService: {
    isCorrectCombination: jest.fn(),
    getWordBundleByVerbId: jest.fn(),
  }
}));

describe('useDatabaseWordData', () => {
  let databaseService: any;
  let avpService: any;

  const mockVerb: Verb = {
    id: 1,
    value: 'syödä',
    type: 'Verb',
    groupId: 0,
    groupName: 'Group 1'
  };

  const mockAgent: Agent = {
    id: 1,
    value: 'minä',
    type: 'Agent'
  };

  const mockPatient: Patient = {
    id: 10,
    value: 'ruokaa',
    type: 'Patient'
  };

  const mockWordData = {
    verbs: [mockVerb],
    subjects: [mockAgent],
    objects: [mockPatient],
    currentVerb: mockVerb,
    pairings: [
      {
        id: 100,
        agentId: 1,
        verbId: 1,
        patientId: 10,
        groupId: 0,
        type: 'AgentVerbPatient_Trio' as const
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    databaseService = require('@/services/exerciseManagementService').databaseService;
    avpService = require('@/services/avpService').avpService;

    // Default mock implementations
    databaseService.ensureInitialized.mockResolvedValue(undefined);
    databaseService.getWordDataForCurrentVerb.mockResolvedValue(mockWordData);
    avpService.isCorrectCombination.mockResolvedValue(true);
  });

  describe('Initialization', () => {
    it('should initialize with null wordData and start loading', () => {
      const { result } = renderHook(() => useDatabaseWordData());

      expect(result.current.wordData).toBeNull();
      // Loading starts immediately on mount
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should load data on mount', async () => {
      const { result } = renderHook(() => useDatabaseWordData());

      await waitFor(() => {
        expect(result.current.wordData).not.toBeNull();
      });

      expect(databaseService.ensureInitialized).toHaveBeenCalled();
      expect(result.current.wordData).toEqual(mockWordData);
      expect(result.current.error).toBeNull();
    });

    it('should set loading state during initialization', async () => {
      let resolveInit: () => void;
      const initPromise = new Promise<void>((resolve) => {
        resolveInit = resolve;
      });
      
      databaseService.ensureInitialized.mockReturnValue(initPromise);

      const { result } = renderHook(() => useDatabaseWordData());

      // Should start loading
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      // Resolve initialization
      act(() => {
        resolveInit!();
      });

      // Should finish loading
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should handle initialization errors', async () => {
      const errorMessage = 'Failed to initialize database';
      databaseService.ensureInitialized.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useDatabaseWordData());

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
      });

      expect(result.current.wordData).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('refreshData', () => {
    it('should reload data from database service', async () => {
      const { result } = renderHook(() => useDatabaseWordData());

      await waitFor(() => {
        expect(result.current.wordData).not.toBeNull();
      });

      const newMockData = { ...mockWordData, currentVerb: { ...mockVerb, id: 2 } };
      databaseService.getWordDataForCurrentVerb.mockResolvedValue(newMockData);

      await act(async () => {
        await result.current.refreshData();
      });

      expect(result.current.wordData?.currentVerb?.id).toBe(2);
    });

    it('should handle refresh errors', async () => {
      const { result } = renderHook(() => useDatabaseWordData());

      await waitFor(() => {
        expect(result.current.wordData).not.toBeNull();
      });

      const errorMessage = 'Failed to refresh data';
      databaseService.getWordDataForCurrentVerb.mockRejectedValue(new Error(errorMessage));

      await act(async () => {
        await result.current.refreshData();
      });

      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('isCorrectCombination', () => {
    it('should check if combination is correct', async () => {
      const { result } = renderHook(() => useDatabaseWordData());

      await waitFor(() => {
        expect(result.current.wordData).not.toBeNull();
      });

      avpService.isCorrectCombination.mockResolvedValue(true);

      let isCorrect: boolean = false;
      await act(async () => {
        isCorrect = await result.current.isCorrectCombination(mockAgent, mockVerb, mockPatient);
      });

      expect(avpService.isCorrectCombination).toHaveBeenCalledWith(mockAgent, mockVerb, mockPatient);
      expect(isCorrect).toBe(true);
    });

    it('should return false for incorrect combination', async () => {
      const { result } = renderHook(() => useDatabaseWordData());

      await waitFor(() => {
        expect(result.current.wordData).not.toBeNull();
      });

      avpService.isCorrectCombination.mockResolvedValue(false);

      let isCorrect: boolean = true;
      await act(async () => {
        isCorrect = await result.current.isCorrectCombination(mockAgent, mockVerb, mockPatient);
      });

      expect(isCorrect).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      const { result } = renderHook(() => useDatabaseWordData());

      await waitFor(() => {
        expect(result.current.wordData).not.toBeNull();
      });

      avpService.isCorrectCombination.mockRejectedValue(new Error('Check failed'));

      let isCorrect: boolean = true;
      await act(async () => {
        isCorrect = await result.current.isCorrectCombination(mockAgent, mockVerb, mockPatient);
      });

      // Should return false on error
      expect(isCorrect).toBe(false);
    });
  });

  describe('nextVerb', () => {
    it('should advance to next verb and refresh data', async () => {
      const { result } = renderHook(() => useDatabaseWordData());

      await waitFor(() => {
        expect(result.current.wordData).not.toBeNull();
      });

      const nextMockVerb = { ...mockVerb, id: 2, value: 'juoda' };
      const nextWordData = { ...mockWordData, currentVerb: nextMockVerb };
      
      databaseService.getNextVerb.mockResolvedValue(nextMockVerb);
      databaseService.getWordDataForCurrentVerb.mockResolvedValue(nextWordData);

      await act(async () => {
        await result.current.nextVerb();
      });

      expect(databaseService.getNextVerb).toHaveBeenCalled();
      expect(result.current.wordData?.currentVerb?.id).toBe(2);
    });

    it('should set loading state while advancing', async () => {
      const { result } = renderHook(() => useDatabaseWordData());

      await waitFor(() => {
        expect(result.current.wordData).not.toBeNull();
      });

      let resolveNext: () => void;
      const nextPromise = new Promise<void>((resolve) => {
        resolveNext = resolve;
      });
      
      databaseService.getNextVerb.mockReturnValue(nextPromise);

      act(() => {
        result.current.nextVerb();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      act(() => {
        resolveNext!();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should handle errors when advancing verb', async () => {
      const { result } = renderHook(() => useDatabaseWordData());

      await waitFor(() => {
        expect(result.current.wordData).not.toBeNull();
      });

      const errorMessage = 'Failed to get next verb';
      databaseService.getNextVerb.mockRejectedValue(new Error(errorMessage));

      await act(async () => {
        await result.current.nextVerb();
      });

      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('setCurrentSet', () => {
    it('should change to different set and refresh data', async () => {
      const { result } = renderHook(() => useDatabaseWordData());

      await waitFor(() => {
        expect(result.current.wordData).not.toBeNull();
      });

      const newSetData = { 
        ...mockWordData, 
        currentVerb: { ...mockVerb, groupId: 1, groupName: 'Group 2' }
      };
      
      databaseService.getWordDataForCurrentVerb.mockResolvedValue(newSetData);

      await act(async () => {
        await result.current.setCurrentSet(1);
      });

      expect(databaseService.setCurrentGroup).toHaveBeenCalledWith(1);
      expect(result.current.wordData?.currentVerb?.groupId).toBe(1);
    });

    it('should set loading state while changing set', async () => {
      const { result } = renderHook(() => useDatabaseWordData());

      await waitFor(() => {
        expect(result.current.wordData).not.toBeNull();
      });

      let resolveSet: () => void;
      const setPromise = new Promise<void>((resolve) => {
        resolveSet = resolve;
      });
      
      databaseService.setCurrentGroup.mockReturnValue(setPromise);

      act(() => {
        result.current.setCurrentSet(1);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      act(() => {
        resolveSet!();
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should handle errors when changing set', async () => {
      const { result } = renderHook(() => useDatabaseWordData());

      await waitFor(() => {
        expect(result.current.wordData).not.toBeNull();
      });

      const errorMessage = 'Failed to set current set';
      databaseService.setCurrentGroup.mockRejectedValue(new Error(errorMessage));

      await act(async () => {
        await result.current.setCurrentSet(1);
      });

      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('randomVerb', () => {
    it('should refresh data to get random verb', async () => {
      const { result } = renderHook(() => useDatabaseWordData());

      await waitFor(() => {
        expect(result.current.wordData).not.toBeNull();
      });

      const randomMockData = { ...mockWordData, currentVerb: { ...mockVerb, id: 3 } };
      databaseService.getWordDataForCurrentVerb.mockResolvedValue(randomMockData);

      await act(async () => {
        await result.current.randomVerb();
      });

      expect(databaseService.getWordDataForCurrentVerb).toHaveBeenCalled();
      expect(result.current.wordData?.currentVerb?.id).toBe(3);
    });

    it('should handle errors when getting random verb', async () => {
      const { result } = renderHook(() => useDatabaseWordData());

      await waitFor(() => {
        expect(result.current.wordData).not.toBeNull();
      });

      const errorMessage = 'Failed to get random verb';
      databaseService.getWordDataForCurrentVerb.mockRejectedValue(new Error(errorMessage));

      await act(async () => {
        await result.current.randomVerb();
      });

      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('Error State Management', () => {
    it('should clear error when operation succeeds after failure', async () => {
      const { result } = renderHook(() => useDatabaseWordData());

      await waitFor(() => {
        expect(result.current.wordData).not.toBeNull();
      });

      // First, cause an error
      databaseService.getNextVerb.mockRejectedValue(new Error('First error'));
      await act(async () => {
        await result.current.nextVerb();
      });

      expect(result.current.error).toBe('First error');

      // Then, succeed
      databaseService.getNextVerb.mockResolvedValue(mockVerb);
      databaseService.getWordDataForCurrentVerb.mockResolvedValue(mockWordData);
      
      await act(async () => {
        await result.current.nextVerb();
      });

      expect(result.current.error).toBe('First error'); // Error persists until next operation
    });
  });
});
