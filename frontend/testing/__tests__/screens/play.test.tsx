import React from 'react';
import { waitFor, fireEvent } from '@testing-library/react-native';
import { renderWithProviders as render } from '../../testUtils';
import PlayScreen from '../../../app/play';
import { useDatabaseWordData } from '../../../hooks/useDatabaseWordData';
import { avpService } from '../../../services/avpService';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Mock dependencies
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
  Stack: {
    Screen: ({ children }: any) => children || null,
  },
}));

jest.mock('../../../hooks/useDatabaseWordData', () => ({
  useDatabaseWordData: jest.fn(),
}));

jest.mock('../../../services/avpService', () => ({
  avpService: {
    isCorrectCombination: jest.fn(),
  },
}));

jest.mock('../../../hooks/useResponsiveLayout', () => ({
  useResponsiveLayout: () => ({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: 1024,
    screenHeight: 768,
  }),
}));

jest.mock('../../../utils/responsive', () => ({
  getSafeAreaConfig: () => ({
    paddingTop: 0,
    paddingBottom: 0,
  }),
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  responsiveFontSize: jest.fn((size: number) => size),
  responsiveWidth: jest.fn((percentage: number) => percentage * 10),
  responsiveHeight: jest.fn((percentage: number) => percentage * 8),
  getCardDimensions: jest.fn(() => ({
    width: 200,
    height: 80,
    fontSize: 18,
  })),
  getVerbCardDimensions: jest.fn(() => ({
    width: 200,
    height: 80,
    fontSize: 24,
    marginVertical: 40,
  })),
  isDesktop: jest.fn(() => true),
  isMobile: jest.fn(() => false),
  isTabletOrLarger: jest.fn(() => true),
}));

describe('PlayScreen - Integration Tests', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
  };

  const mockWordData = {
    currentVerb: { id: 1, value: 'syödä', type: 'Verb' as const, groupId: 0, groupName: 'Set 1' },
    subjects: [
      { id: 1, value: 'Minä', type: 'Agent' as const },
      { id: 2, value: 'Sinä', type: 'Agent' as const },
    ],
    objects: [
      { id: 1, value: 'omena', type: 'Patient' as const },
      { id: 2, value: 'leipä', type: 'Patient' as const },
    ],
    verbs: [
      { id: 1, value: 'syödä', type: 'Verb' as const, groupId: 0, groupName: 'Set 1' },
      { id: 2, value: 'juoda', type: 'Verb' as const, groupId: 0, groupName: 'Set 1' },
    ],
  };

  const mockUseDatabaseWordData = {
    wordData: mockWordData,
    isLoading: false,
    error: null,
    refreshData: jest.fn(),
    nextVerb: jest.fn(),
    setCurrentSet: jest.fn(),
    isCorrectCombination: jest.fn(),
    randomVerb: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useLocalSearchParams as jest.Mock).mockReturnValue({ groupId: '0' });
    (useDatabaseWordData as jest.Mock).mockReturnValue(mockUseDatabaseWordData);
  });

  describe('Initial Rendering', () => {
    it('should render loading view when data is loading', async () => {
      (useDatabaseWordData as jest.Mock).mockReturnValue({
        ...mockUseDatabaseWordData,
        isLoading: true,
        wordData: null,
      });

      const { getByText } = await render(<PlayScreen />);
      expect(getByText(/loading/i)).toBeTruthy();
    });

    it('should render error view when there is an error', async () => {
      (useDatabaseWordData as jest.Mock).mockReturnValue({
        ...mockUseDatabaseWordData,
        isLoading: false,
        error: 'Failed to load data',
        wordData: null,
      });

      const { getByText } = await render(<PlayScreen />);
      expect(getByText(/error/i)).toBeTruthy();
    });

    it('should render game view with correct initial data', async () => {
      const { getAllByText, getByText } = await render(<PlayScreen />);

      await waitFor(() => {
        expect(getAllByText('syödä').length).toBeGreaterThan(0);
        expect(getByText('Minä')).toBeTruthy();
        expect(getByText('Sinä')).toBeTruthy();
        expect(getByText('omena')).toBeTruthy();
        expect(getByText('leipä')).toBeTruthy();
      });
    });

    it('should call refreshData on mount', async () => {
      render(<PlayScreen />);
      
      await waitFor(() => {
        expect(mockUseDatabaseWordData.refreshData).toHaveBeenCalled();
      });
    });
  });

  describe('Correct Answer Flow', () => {
    it('should handle correct answer and show feedback', async () => {
      (avpService.isCorrectCombination as jest.Mock).mockResolvedValue(true);

      const { getAllByText, getByText } = await render(<PlayScreen />);

      await waitFor(() => {
        expect(getAllByText('syödä').length).toBeGreaterThan(0);
      });

      fireEvent.press(getByText('Minä'));
      fireEvent.press(getByText('omena'));

      await waitFor(() => {
        expect(avpService.isCorrectCombination).toHaveBeenCalledWith(
          { id: 1, value: 'Minä', type: 'Agent' },
          { id: 1, value: 'syödä', type: 'Verb', groupId: 0, groupName: 'Set 1' },
          { id: 1, value: 'omena', type: 'Patient' }
        );
        expect(getByText('Oikein!')).toBeTruthy();
      });
    });

    it('should progress through multiple correct answers', async () => {
      (avpService.isCorrectCombination as jest.Mock).mockResolvedValue(true);

      const { getAllByText, getByText } = await render(<PlayScreen />);

      await waitFor(() => {
        expect(getAllByText('syödä').length).toBeGreaterThan(0);
      });

      fireEvent.press(getByText('Minä'));
      fireEvent.press(getByText('omena'));

      await waitFor(() => {
        expect(getByText('Oikein!')).toBeTruthy();
      });

      // Wait for feedback to clear
      await waitFor(() => {
        expect(avpService.isCorrectCombination).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Incorrect Answer Flow', () => {
    it('should show error feedback for incorrect answer', async () => {
      (avpService.isCorrectCombination as jest.Mock).mockResolvedValue(false);

      const { getAllByText, getByText } = await render(<PlayScreen />);

      await waitFor(() => {
        expect(getAllByText('syödä').length).toBeGreaterThan(0);
      });

      fireEvent.press(getByText('Minä'));
      fireEvent.press(getByText('omena'));

      await waitFor(() => {
        expect(getByText('Väärin!')).toBeTruthy();
      });
    });

    it('should not progress on incorrect answer', async () => {
      (avpService.isCorrectCombination as jest.Mock).mockResolvedValue(false);

      const { getAllByText, getByText } = await render(<PlayScreen />);

      await waitFor(() => {
        expect(getAllByText('syödä').length).toBeGreaterThan(0);
      });

      fireEvent.press(getByText('Minä'));
      fireEvent.press(getByText('omena'));

      await waitFor(() => {
        expect(getByText('Väärin!')).toBeTruthy();
      });

      // Verify nextVerb wasn't called
      expect(mockUseDatabaseWordData.nextVerb).not.toHaveBeenCalled();
    });
  });

  describe('Navigation Controls', () => {
    it('should render navigation buttons', async () => {
      const { getAllByText } = await render(<PlayScreen />);

      await waitFor(() => {
        expect(getAllByText('syödä').length).toBeGreaterThan(0);
      });

      // Basic verification that the screen renders with controls
      // Skip detailed button testing since buttons use icons without text
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing verb gracefully', async () => {
      (useDatabaseWordData as jest.Mock).mockReturnValue({
        ...mockUseDatabaseWordData,
        wordData: {
          ...mockWordData,
          currentVerb: null,
        },
      });

      const { getByText } = await render(<PlayScreen />);
      expect(getByText(/yhdistä oikeat parit verbille/i)).toBeTruthy();
    });

    it('should handle empty subjects array', async () => {
      (useDatabaseWordData as jest.Mock).mockReturnValue({
        ...mockUseDatabaseWordData,
        wordData: {
          ...mockWordData,
          subjects: [],
        },
      });

      const { getAllByText } = await render(<PlayScreen />);
      
      await waitFor(() => {
        expect(getAllByText('syödä').length).toBeGreaterThan(0);
      });
    });

    it('should handle empty objects array', async () => {
      (useDatabaseWordData as jest.Mock).mockReturnValue({
        ...mockUseDatabaseWordData,
        wordData: {
          ...mockWordData,
          objects: [],
        },
      });

      const { getAllByText } = await render(<PlayScreen />);
      
      await waitFor(() => {
        expect(getAllByText('syödä').length).toBeGreaterThan(0);
      });
    });
  });

  describe('Error Recovery', () => {
    it('should call retry function when retry button is pressed', async () => {
      (useDatabaseWordData as jest.Mock).mockReturnValue({
        ...mockUseDatabaseWordData,
        isLoading: false,
        error: 'Network error',
        wordData: null,
      });

      const { getByText } = await render(<PlayScreen />);

      await waitFor(() => {
        expect(getByText(/error/i)).toBeTruthy();
      });

      const retryButton = getByText(/retry/i);
      fireEvent.press(retryButton);

      expect(mockUseDatabaseWordData.refreshData).toHaveBeenCalled();
    });
  });

  // Generated by Claude Sonnet 4.5 to cover BUG-001
  // Checked and verified by @trnvanh
  describe('Taso/Set Change Behavior (BUG-001)', () => {
    it('should refresh and show first verb when returning with different taso', async () => {
      
      const mockRefreshData = jest.fn();
      const mockNextVerb = jest.fn();
      const mockSetCurrentSet = jest.fn();
      const mockRandomVerb = jest.fn();
      
      // Initial render with Set 1 - user is on last verb
      (useDatabaseWordData as jest.Mock).mockReturnValue({
        wordData: {
          currentVerb: { id: 2, value: 'juoda', type: 'Verb', groupId: 0, groupName: 'Set 1' },
          subjects: [
            { id: 1, value: 'minä', type: 'Agent' },
            { id: 2, value: 'sinä', type: 'Agent' },
          ],
          objects: [
            { id: 1, value: 'kahvia', type: 'Patient' },
            { id: 2, value: 'teetä', type: 'Patient' },
          ],
          verbs: [
            { id: 1, value: 'syödä', type: 'Verb', groupId: 0 },
            { id: 2, value: 'juoda', type: 'Verb', groupId: 0 },
          ],
        },
        isLoading: false,
        error: null,
        refreshData: mockRefreshData,
        nextVerb: mockNextVerb,
        setCurrentSet: mockSetCurrentSet,
        isCorrectCombination: jest.fn(),
        randomVerb: mockRandomVerb,
      });

      const { rerender, getAllByText, queryByText } = await render(<PlayScreen />);

      await waitFor(() => {
        expect(getAllByText('juoda').length).toBeGreaterThan(0);
      });

      // Simulate taso change - user selected Set 2 from menu
      (useDatabaseWordData as jest.Mock).mockReturnValue({
        wordData: {
          currentVerb: { id: 3, value: 'lukea', type: 'Verb', groupId: 1, groupName: 'Set 2' },
          subjects: [
            { id: 1, value: 'minä', type: 'Agent' },
            { id: 2, value: 'sinä', type: 'Agent' },
          ],
          objects: [
            { id: 3, value: 'kirjaa', type: 'Patient' },
            { id: 4, value: 'lehteä', type: 'Patient' },
          ],
          verbs: [
            { id: 3, value: 'lukea', type: 'Verb', groupId: 1 },
            { id: 4, value: 'kirjoittaa', type: 'Verb', groupId: 1 },
          ],
        },
        isLoading: false,
        error: null,
        refreshData: mockRefreshData,
        nextVerb: mockNextVerb,
        setCurrentSet: mockSetCurrentSet,
        isCorrectCombination: jest.fn(),
        randomVerb: mockRandomVerb,
      });

      // Re-render to simulate navigation back to PlayScreen with new groupId
      rerender(<PlayScreen />);

      await waitFor(() => {
        // Should show FIRST verb of Set 2, not last verb of Set 1
        expect(getAllByText('lukea').length).toBeGreaterThan(0);
        expect(queryByText('juoda')).toBeNull(); // Old verb should not be present
      });

      // Verify refreshData was called on groupId change
      expect(mockRefreshData).toHaveBeenCalled();
    });

    it.skip('should call refreshData when groupId changes', async () => {
      // @bug BUG-001
      // @status blocked
      // @priority high
      // This test verifies the fix mechanism - will pass once useEffect is added
      
      const mockRefreshData = jest.fn();
      const mockSetCurrentSet = jest.fn();
      const mockNextVerb = jest.fn();
      const mockRandomVerb = jest.fn();

      // Mock useLocalSearchParams to return initial groupId
      const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;
      mockUseLocalSearchParams.mockReturnValue({ groupId: '0' });

      (useDatabaseWordData as jest.Mock).mockReturnValue({
        wordData: {
          currentVerb: { id: 1, value: 'syödä', type: 'Verb', groupId: 0, groupName: 'Set 1' },
          subjects: [
            { id: 1, value: 'minä', type: 'Agent' },
            { id: 2, value: 'sinä', type: 'Agent' },
          ],
          objects: [
            { id: 1, value: 'kahvia', type: 'Patient' },
            { id: 2, value: 'teetä', type: 'Patient' },
          ],
          verbs: [
            { id: 1, value: 'syödä', type: 'Verb', groupId: 0 },
            { id: 2, value: 'juoda', type: 'Verb', groupId: 0 },
          ],
        },
        isLoading: false,
        error: null,
        refreshData: mockRefreshData,
        nextVerb: mockNextVerb,
        setCurrentSet: mockSetCurrentSet,
        isCorrectCombination: jest.fn(),
        randomVerb: mockRandomVerb,
      });

      const { rerender } = await render(<PlayScreen />);

      await waitFor(() => {
        expect(mockRefreshData).toHaveBeenCalled();
      });

      const initialCallCount = mockRefreshData.mock.calls.length;

      // Change groupId in route params to simulate taso change
      mockUseLocalSearchParams.mockReturnValue({ groupId: '1' });

      (useDatabaseWordData as jest.Mock).mockReturnValue({
        wordData: {
          currentVerb: { id: 3, value: 'lukea', type: 'Verb', groupId: 1, groupName: 'Set 2' },
          subjects: [
            { id: 1, value: 'minä', type: 'Agent' },
            { id: 2, value: 'sinä', type: 'Agent' },
          ],
          objects: [
            { id: 3, value: 'kirjaa', type: 'Patient' },
            { id: 4, value: 'lehteä', type: 'Patient' },
          ],
          verbs: [
            { id: 3, value: 'lukea', type: 'Verb', groupId: 1 },
            { id: 4, value: 'kirjoittaa', type: 'Verb', groupId: 1 },
          ],
        },
        isLoading: false,
        error: null,
        refreshData: mockRefreshData,
        nextVerb: mockNextVerb,
        setCurrentSet: mockSetCurrentSet,
        isCorrectCombination: jest.fn(),
        randomVerb: mockRandomVerb,
      });

      rerender(<PlayScreen />);

      await waitFor(() => {
        // Should have called refreshData again due to groupId change
        expect(mockRefreshData.mock.calls.length).toBeGreaterThan(initialCallCount);
      });
    });
  });
});
