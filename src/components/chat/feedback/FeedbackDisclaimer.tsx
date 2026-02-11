import { Content, ContentVariants, Split, SplitItem } from '@patternfly/react-core';
import { RhUiInformationIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';

export const FeedbackDisclaimer = () => {
  const { t } = useTranslation('plugin__genie-web-client');

  return (
    <Split hasGutter>
      <SplitItem>
        <RhUiInformationIcon />
      </SplitItem>
      <SplitItem isFilled>
        <Content component={ContentVariants.small}>
          {t('feedback.badResponse.form.disclaimer')}
        </Content>
      </SplitItem>
    </Split>
  );
};
