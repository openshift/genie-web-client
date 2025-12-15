import { Conversation } from '@redhat-cloud-services/ai-client-state';

const diffInDaysFromToday = (date: Date) => {
  const today = new Date();
  const millisecondsDiff = today.getTime() - date.getTime();
  return Math.round(millisecondsDiff / (24 * 60 * 60 * 1000));
};

const isToday = (date: Date) => {
  return diffInDaysFromToday(date) === 0;
};

const isYesterday = (date: Date) => {
  return diffInDaysFromToday(date) === 1;
};

const isLastWeek = (date: Date) => {
  return diffInDaysFromToday(date) <= 7;
};

export const groupByDate = (conversations: Conversation[]) => {
  const groupedConversations = {
    today: [],
    yesterday: [],
    lastWeek: [],
    other: [],
  };

  if (!conversations || conversations.length === 0) {
    return groupedConversations;
  }

  // let's sort all conversations by date in descending order
  const sortedConversations = conversations.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  sortedConversations.forEach((conversation) => {
    const date = new Date(conversation.createdAt);
    if (isToday(date)) {
      groupedConversations.today.push(conversation);
    } else if (isYesterday(date)) {
      groupedConversations.yesterday.push(conversation);
    } else if (isLastWeek(date)) {
      groupedConversations.lastWeek.push(conversation);
    } else {
      groupedConversations.other.push(conversation);
    }
  });
  return groupedConversations;
};
