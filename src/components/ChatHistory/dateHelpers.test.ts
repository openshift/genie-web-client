import { Conversation } from '../../hooks/AIState';
import { groupByDate } from './dateHelpers';

describe('dateHelpers', () => {
  // Mock the current date to ensure consistent test results
  const mockDate = (dateString: string) => {
    const date = new Date(dateString);
    jest.useFakeTimers();
    jest.setSystemTime(date);
    return date;
  };

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('groupByDate', () => {
    it('groups conversations by date correctly', () => {
      // Using Friday so that dates earlier in the week fall within the current week (Jan 12-18)
      mockDate('2025-01-17T12:00:00.000Z');

      const conversations: Conversation[] = [
        {
          id: '1',
          title: 'Today conversation',
          createdAt: '2025-01-17T10:00:00.000Z',
          messages: [],
          locked: false,
        },
        {
          id: '2',
          title: 'Yesterday conversation',
          createdAt: '2025-01-16T10:00:00.000Z',
          messages: [],
          locked: false,
        },
        {
          id: '3',
          title: 'Last week conversation',
          createdAt: '2025-01-13T10:00:00.000Z',
          messages: [],
          locked: false,
        },
        {
          id: '4',
          title: 'Older conversation',
          createdAt: '2025-01-01T10:00:00.000Z',
          messages: [],
          locked: false,
        },
      ] as unknown as Conversation[];

      const result = groupByDate(conversations);

      expect(result.today).toHaveLength(1);
      expect(result.today[0].id).toBe('1');
      expect(result.yesterday).toHaveLength(1);
      expect(result.yesterday[0].id).toBe('2');
      expect(result.lastWeek).toHaveLength(1);
      expect(result.lastWeek[0].id).toBe('3');
      expect(result.other).toHaveLength(1);
      expect(result.other[0].id).toBe('4');
    });

    it('sorts conversations by date in descending order', () => {
      // Using Friday so that dates earlier in the week fall within the current week (Jan 12-18)
      mockDate('2025-01-17T12:00:00.000Z');

      const conversations: Conversation[] = [
        {
          id: '1',
          title: 'Older',
          createdAt: '2025-01-01T10:00:00.000Z',
          messages: [],
          locked: false,
        },
        {
          id: '2',
          title: 'Newer',
          createdAt: '2025-01-17T10:00:00.000Z',
          messages: [],
          locked: false,
        },
        {
          id: '3',
          title: 'Middle',
          createdAt: '2025-01-13T10:00:00.000Z',
          messages: [],
          locked: false,
        },
      ] as unknown as Conversation[];

      const result = groupByDate(conversations);

      // Within each group, conversations should be sorted by date descending
      expect(result.today[0].id).toBe('2');
      expect(result.lastWeek[0].id).toBe('3');
      expect(result.other[0].id).toBe('1');
    });

    it('handles multiple conversations in the same group', () => {
      mockDate('2025-01-17T12:00:00.000Z');

      const conversations: Conversation[] = [
        {
          id: '1',
          title: 'Today 1',
          createdAt: '2025-01-17T08:00:00.000Z',
          messages: [],
          locked: false,
        },
        {
          id: '2',
          title: 'Today 2',
          createdAt: '2025-01-17T10:00:00.000Z',
          messages: [],
          locked: false,
        },
        {
          id: '3',
          title: 'Today 3',
          createdAt: '2025-01-17T12:00:00.000Z',
          messages: [],
          locked: false,
        },
      ] as unknown as Conversation[];

      const result = groupByDate(conversations);

      expect(result.today).toHaveLength(3);
      expect(result.today.map((c) => c.id)).toEqual(['3', '2', '1']); // Sorted descending
      expect(result.yesterday).toHaveLength(0);
      expect(result.lastWeek).toHaveLength(0);
      expect(result.other).toHaveLength(0);
    });

    it('handles empty array', () => {
      mockDate('2025-01-17T12:00:00.000Z');

      const result = groupByDate([]);

      expect(result.today).toHaveLength(0);
      expect(result.yesterday).toHaveLength(0);
      expect(result.lastWeek).toHaveLength(0);
      expect(result.other).toHaveLength(0);
    });

    it('handles conversations with same timestamp correctly', () => {
      mockDate('2025-01-17T12:00:00.000Z');

      const conversations: Conversation[] = [
        {
          id: '1',
          title: 'Same time 1',
          createdAt: '2025-01-17T10:00:00.000Z',
          messages: [],
          locked: false,
        },
        {
          id: '2',
          title: 'Same time 2',
          createdAt: '2025-01-17T10:00:00.000Z',
          messages: [],
          locked: false,
        },
      ] as unknown as Conversation[];

      const result = groupByDate(conversations);

      expect(result.today).toHaveLength(2);
      // Both should be in today group
      expect(result.today.every((c) => c.createdAt === '2025-01-17T10:00:00.000Z')).toBe(true);
    });
  });
});
