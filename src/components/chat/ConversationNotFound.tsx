import { useNavigate } from 'react-router-dom-v5-compat';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateActions,
  Button,
  EmptyStateVariant,
  EmptyStateFooter,
} from '@patternfly/react-core';
import { PlusSquareIcon } from '@patternfly/react-icons';
import { mainGenieRoute, ChatNew } from '../routeList';

export const ConversationNotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <EmptyState variant={EmptyStateVariant.lg} titleText="Conversation not found" headingLevel="h4">
      <EmptyStateBody>
        The conversation you are looking for was not found or no longer exists.
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <Button
            variant="primary"
            icon={<PlusSquareIcon />}
            onClick={() => {
              navigate(`${mainGenieRoute}/${ChatNew}`);
            }}
          >
            Start a new chat
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};
