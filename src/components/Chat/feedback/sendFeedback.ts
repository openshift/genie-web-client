export const FeedBackCategories = {
  INCORRECT: 'incorrect',
  NOT_RELEVANT: 'not_relevant',
  INCOMPLETE: 'incomplete',
  OUTDATED_INFORMATION: 'outdated_information',
  UNSAFE: 'unsafe',
  OTHER: 'other',
} as const;

// TODO: We need to change this to a real URL
const feedBackURL = 'http://localhost:8080/v1/feedback';

export type FeedBackCategory = typeof FeedBackCategories[keyof typeof FeedBackCategories];

export type Feedback = {
  conversation_id: string;
  user_question: string;
  llm_response: string;
  sentiment: -1 | 1;
  user_feedback?: string;
  categories?: FeedBackCategory[];
};

export const sendFeedback = async (feedback: Feedback) => {
  return await fetch(feedBackURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(feedback),
  });
};
