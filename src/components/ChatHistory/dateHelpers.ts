import { Conversation } from '@redhat-cloud-services/ai-client-state';
import {
  isToday as isTodayDateFns,
  isYesterday as isYesterdayDateFns,
  isThisWeek as isThisWeekDateFns,
} from 'date-fns';

const isToday = (date: Date) => isTodayDateFns(date);

const isYesterday = (date: Date) => isYesterdayDateFns(date);

const isLastWeek = (date: Date) => isThisWeekDateFns(date, { weekStartsOn: 0 }); // week starts on Sunday

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
