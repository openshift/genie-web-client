export const getConversations = () => {
  const today = new Date();
  const yesterday = new Date(new Date(today).setDate(today.getDate() - 1));
  const lastWeek = new Date(new Date(today).setDate(today.getDate() - 2));
  const lastMonth = new Date(new Date(today).setMonth(today.getMonth() - 1));

  return [
    {
      id: 'week-5-id',
      title: 'last week - 5',
      createdAt: lastWeek.toISOString(),
      messages: [],
      locked: false,
    },
    {
      id: 'yesterday-3-id',
      title: 'yesterday - 3',
      createdAt: yesterday.toISOString(),
      messages: [],
      locked: false,
    },
    {
      id: 'other-8-id',
      title: 'other - 8',
      createdAt: new Date(lastMonth.setHours(lastMonth.getHours() - 1)).toISOString(),
      messages: [],
      locked: false,
    },
    {
      id: 'today-2-id',
      title: 'today - 2',
      createdAt: new Date(today.setHours(today.getHours() - 1)).toISOString(),
      messages: [],
      locked: false,
    },
    {
      id: 'other-7-id',
      title: 'other - 7',
      createdAt: lastMonth.toISOString(),
      messages: [],
      locked: false,
    },
    {
      id: 'yesterday-4-id',
      title: 'yesterday - 4',
      createdAt: new Date(yesterday.setHours(yesterday.getHours() - 1)).toISOString(),
      messages: [],
      locked: false,
    },

    {
      id: 'last-week-6-id',
      title: 'last week - 6',
      createdAt: new Date(lastWeek.setHours(lastWeek.getHours() - 1)).toISOString(),
      messages: [],
      locked: false,
    },
    {
      id: 'today-1-id',
      title: 'today - 1',
      createdAt: today.toISOString(),
      messages: [],
      locked: false,
    },
  ];
};
