import { FormGroup, Radio } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { FeedbackCategory } from '../../../hooks/AIState';

const FEEDBACK_TYPES = [
  {
    labelKey: 'feedback.badResponse.type.incorrect.label',
    descriptionKey: 'feedback.badResponse.type.incorrect.description',
    value: FeedbackCategory.INCORRECT,
  },
  {
    labelKey: 'feedback.badResponse.type.unhelpful.label',
    descriptionKey: 'feedback.badResponse.type.unhelpful.description',
    value: FeedbackCategory.NOT_RELEVANT,
  },
  {
    labelKey: 'feedback.badResponse.type.incomplete.label',
    descriptionKey: 'feedback.badResponse.type.incomplete.description',
    value: FeedbackCategory.INCOMPLETE,
  },
  {
    labelKey: 'feedback.badResponse.type.harmful.label',
    descriptionKey: 'feedback.badResponse.type.harmful.description',
    value: FeedbackCategory.UNSAFE,
  },
  {
    labelKey: 'feedback.badResponse.type.other.label',
    descriptionKey: undefined,
    value: FeedbackCategory.OTHER,
  },
] as const;

interface FeedbackTypeRadioGroupProps {
  selectedValue?: string;
  onValueChange: (value: string) => void;
  isDisabled?: boolean;
}

export const FeedbackTypeRadioGroup = ({
  selectedValue,
  onValueChange,
  isDisabled = false,
}: FeedbackTypeRadioGroupProps) => {
  const { t } = useTranslation('plugin__genie-web-client');

  return (
    <FormGroup
      role="radiogroup"
      isStack
      fieldId="feedback-type-group"
      label={t('feedback.badResponse.form.label')}
      aria-required="true"
    >
      {FEEDBACK_TYPES.map((feedback) => (
        <Radio
          key={feedback.value}
          name="feedback-type"
          label={t(feedback.labelKey)}
          id={`feedback-type-${feedback.value}`}
          isChecked={selectedValue === feedback.value}
          onChange={() => onValueChange(feedback.value)}
          description={feedback.descriptionKey ? t(feedback.descriptionKey) : undefined}
          isDisabled={isDisabled}
          required
        />
      ))}
    </FormGroup>
  );
};
