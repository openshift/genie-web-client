import { FormGroup, TextArea, Label } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

interface FeedbackDescriptionFieldProps {
  value: string;
  onValueChange: (value: string) => void;
  isDisabled?: boolean;
  isReadOnly?: boolean;
}

export const FeedbackDescriptionField = ({
  value,
  onValueChange,
  isDisabled = false,
  isReadOnly = false,
}: FeedbackDescriptionFieldProps) => {
  const { t } = useTranslation('plugin__genie-web-client');

  return (
    <FormGroup
      label={
        <>
          {t('feedback.badResponse.form.description.label')}{' '}
          <Label color="grey" className="pf-v6-u-ml-sm" isCompact>
            Optional
          </Label>
        </>
      }
      type="string"
      fieldId="user_feedback"
    >
      <TextArea
        resizeOrientation="vertical"
        value={value}
        onChange={(_event, newValue) => onValueChange(newValue)}
        placeholder={t('feedback.badResponse.form.description.placeholder')}
        isDisabled={isDisabled}
        maxLength={2500}
        readOnly={isReadOnly}
      />
    </FormGroup>
  );
};
