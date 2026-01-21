import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
  Tooltip,
} from '@patternfly/react-core';

import { RhUiThumbnailViewSmallIcon, RedhatIcon, OpenshiftIcon } from '@patternfly/react-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apps } from '../../externalLinks';
import '../user-account/menuDropDown.css';

const AppMenuIcon = ({ tooltipText }: { tooltipText: string }) => {
  return (
    <Tooltip content={tooltipText}>
      <RhUiThumbnailViewSmallIcon />
    </Tooltip>
  );
};

export const AppMenu = () => {
  const { t } = useTranslation('plugin__genie-web-client');
  const [isOpen, setIsOpen] = useState(false);

  const consoleURL = 'https://console.redhat.com'; // NOTE this needs to be updated to the actual console URL

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Dropdown
      isOpen={isOpen}
      onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          aria-label="User Account Menu"
          variant="plain"
          onClick={onToggleClick}
          isExpanded={isOpen}
          icon={<AppMenuIcon tooltipText={t('appMenu.title')} />}
        />
      )}
      shouldFocusToggleOnSelect
      className="user-account-menu-dropdown"
    >
      <DropdownList>
        <DropdownItem icon={<RedhatIcon />} isExternalLink to={apps.hybridCloudConsole}>
          {t('appMenu.hybridCloudConsole')}
        </DropdownItem>
        <DropdownItem icon={<RedhatIcon />} isExternalLink to={apps.openShiftClusterManager}>
          {t('appMenu.openShiftClusterManager')}
        </DropdownItem>
        <DropdownItem
          icon={<OpenshiftIcon />}
          isExternalLink
          to={consoleURL}
          description={consoleURL}
        >
          {t('appMenu.openOpenShiftConsole')}
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
};
