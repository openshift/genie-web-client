import { useState } from 'react';
import {
  Avatar,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
  Tooltip,
} from '@patternfly/react-core';
import {
  OutlinedSmileIcon,
  RhUiSettingsIcon,
  RhUiQuestionMarkCircleIcon,
  RhUiInformationIcon,
  OutlinedCommentAltIcon,
  OutlinedFileAltIcon,
  SignOutAltIcon,
} from '@patternfly/react-icons';

import { useTranslation } from 'react-i18next';

import AvatarImg from '../../assets/images/avatar.svg';
import { UserAccountMenuHeader } from './UserAccountMenuHeader';
import { help } from '../../externalLinks';
import './menuDropDown.css';

const ProfileIcon = ({ title }: { title: string }) => {
  return <Avatar src={AvatarImg} alt={title} />;
};

export const UserAccountMenu = () => {
  const name = 'Phoenix Campbell'; // to be replaced with the actual name
  const email = 'sampleEmail@redhat.com'; // to be replaced with the actual email
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation('plugin__genie-web-client');

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };
  /* To be replaced with the actual functions */
  const handlePersonalizeClick = (ev: React.MouseEvent<HTMLAnchorElement>) => {
    ev.preventDefault();
    console.log('Personalize menu item clicked');
  };
  const handleSettingsClick = (ev: React.MouseEvent<HTMLAnchorElement>) => {
    ev.preventDefault();
    console.log('Settings menu item clicked');
  };
  const handleHelpClick = (ev: React.MouseEvent<HTMLAnchorElement>) => {
    ev.preventDefault();
    console.log('Help menu item clicked');
  };
  const handleSendFeedbackClick = (ev: React.MouseEvent<HTMLAnchorElement>) => {
    ev.preventDefault();
    console.log('Send feedback menu item clicked');
  };
  const handleAboutAladdinClick = (ev: React.MouseEvent<HTMLAnchorElement>) => {
    ev.preventDefault();
    console.log('About Aladdin menu item clicked');
  };

  const handleLogoutClick = (ev: React.MouseEvent<HTMLAnchorElement>) => {
    ev.preventDefault();
    console.log('Logout menu item clicked');
  };

  return (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <Tooltip content={name} position="bottom-end" enableFlip={false}>
          <MenuToggle
            ref={toggleRef}
            aria-label={t('userAccount.menu.title')}
            variant="plain"
            onClick={onToggleClick}
            isExpanded={isOpen}
            icon={<ProfileIcon title={t('userAccount.menu.title')} />}
          />
        </Tooltip>
      )}
      shouldFocusToggleOnSelect
      className="user-account-menu-dropdown"
    >
      <UserAccountMenuHeader name={name} email={email} />
      <DropdownList>
        <DropdownItem icon={<OutlinedSmileIcon />} onClick={handlePersonalizeClick}>
          {t('userAccount.menu.personalize')}
        </DropdownItem>
        <DropdownItem icon={<RhUiSettingsIcon />} onClick={handleSettingsClick}>
          {t('userAccount.menu.settings')}
        </DropdownItem>
        <Divider component="li" key="separator" />
        <DropdownItem icon={<RhUiQuestionMarkCircleIcon />} onClick={handleHelpClick}>
          {t('userAccount.menu.help')}
        </DropdownItem>
        <DropdownItem icon={<OutlinedCommentAltIcon />} onClick={handleSendFeedbackClick}>
          {t('userAccount.menu.sendFeedback')}
        </DropdownItem>
        <DropdownItem icon={<RhUiInformationIcon />} onClick={handleAboutAladdinClick}>
          {t('userAccount.menu.about')}
        </DropdownItem>
        <DropdownItem icon={<OutlinedFileAltIcon />} isExternalLink to={help.legalAgreements}>
          {t('userAccount.menu.legal')}
        </DropdownItem>
        <Divider component="li" key="separator" />
        <DropdownItem icon={<SignOutAltIcon />} onClick={handleLogoutClick}>
          {t('userAccount.menu.logout')}
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
};
