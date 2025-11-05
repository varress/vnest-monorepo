import { Agent, Patient, Verb } from '@/database/schemas';
import { avpService } from '@/services/avpService';
import { databaseService, DatabaseWordData } from '@/services/exerciseManagementService';
import { useCallback, useEffect, useState } from 'react';

export interface UseDatabaseWordDataReturn {
  wordData: DatabaseWordData | null;
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  isCorrectCombination: (subject: Agent, verb: Verb, object: Patient) => Promise<boolean>;
  nextVerb: () => Promise<void>;
  randomVerb: () => Promise<void>;
  setCurrentSet: (setId: number) => Promise<void>;
}

export function useDatabaseWordData(): UseDatabaseWordDataReturn {
  const [wordData, setWordData] = useState<DatabaseWordData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize the database service
  const initializeData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await refreshData();
      
    } catch (err) {
      console.error('Error initializing database word data:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize database');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh data from database
  const refreshData = useCallback(async () => {
    try {
      const data = await databaseService.getWordDataForCurrentVerb();
      setWordData(data);
    } catch (err) {
      console.error('Error refreshing database word data:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    }
  }, []);

  // Check if a combination is correct
  const isCorrectCombination = useCallback(async (subject: Agent, verb: Verb, object: Patient): Promise<boolean> => {
    try {
      return await avpService.isCorrectCombination(subject, verb, object);
    } catch (err) {
      console.error('Error checking combination:', err);
      return false;
    }
  }, []);

  // Move to next verb
  const nextVerb = useCallback(async () => {
    try {
      setIsLoading(true);
      await databaseService.getNextVerb();
      await refreshData();
    } catch (err) {
      console.error('Error getting next verb:', err);
      setError(err instanceof Error ? err.message : 'Failed to get next verb');
    } finally {
      setIsLoading(false);
    }
  }, [refreshData]);

  // Get random verb
  const randomVerb = useCallback(async () => {
    try {
      setIsLoading(true);
      await databaseService.getNextVerb();
      await refreshData();
    } catch (err) {
      console.error('Error getting random verb:', err);
      setError(err instanceof Error ? err.message : 'Failed to get random verb');
    } finally {
      setIsLoading(false);
    }
  }, [refreshData]);

  // Set current set
  const setCurrentSet = useCallback(async (setId: number) => {
    try {
      setIsLoading(true);
      await databaseService.setCurrentGroup(setId);
      await refreshData();
    } catch (err) {
      console.error('Error setting current set:', err);
      setError(err instanceof Error ? err.message : 'Failed to set current set');
    } finally {
      setIsLoading(false);
    }
  }, [refreshData]);

  // Initialize on mount
  useEffect(() => {
    initializeData();
  }, [initializeData]);

  return {
    wordData,
    isLoading,
    error,
    refreshData,
    isCorrectCombination,
    nextVerb,
    randomVerb,
    setCurrentSet
  };
}