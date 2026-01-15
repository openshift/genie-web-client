import { Avatar, Flex, FlexItem } from '@patternfly/react-core';
import AvatarImg from '../../assets/images/avatar.svg';

export const UserAccountMenuHeader = ({ name, email }: { name: string; email: string }) => {
  if (!name) {
    return null;
  }
  return (
    <div className="pf-v6-c-menu__item">
      <Flex
        direction={{ default: 'row' }}
        gap={{ default: 'gapMd' }}
        alignItems={{ default: 'alignItemsFlexStart' }}
      >
        <FlexItem>
          <Avatar src={AvatarImg} alt="User Account" />
        </FlexItem>
        <FlexItem>
          <div className="pf-v6-u-font-weight-bold">{name}</div>

          {email ? (
            <div className="pf-v6-u-text-color-subtle pf-v6-u-font-size-xs">{email}</div>
          ) : null}
        </FlexItem>
      </Flex>
    </div>
  );
};
