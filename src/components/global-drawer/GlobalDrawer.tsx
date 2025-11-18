import { FC, ReactNode } from 'react';
import {
  Backdrop,
  Drawer,
  DrawerContent,
  DrawerPanelContent,
  DrawerHead,
  DrawerActions,
  DrawerCloseButton,
  DrawerPanelBody,
} from '@patternfly/react-core';
import './GlobalDrawer.css';

interface GlobalDrawerProps {
  isOpen: boolean;
  heading: ReactNode;
  icon: ReactNode;
  children: ReactNode;
  position: 'left' | 'right';
  onClose: () => void;
}

export const GlobalDrawer: FC<GlobalDrawerProps> = ({
  isOpen,
  heading,
  icon,
  children,
  position,
  onClose,
}) => {
  if (!isOpen) {
    return null;
  }

  const panelContent = (
    <DrawerPanelContent onClick={(e) => e.stopPropagation()}>
      <DrawerHead>
        <div className="global-drawer-heading">
          <span className="global-drawer-heading__icon">{icon}</span>
          <span className="global-drawer-heading__text">{heading}</span>
        </div>
        <DrawerActions>
          <DrawerCloseButton onClick={onClose} />
        </DrawerActions>
      </DrawerHead>
      <DrawerPanelBody>{children}</DrawerPanelBody>
    </DrawerPanelContent>
  );

  return (
    <Backdrop onClick={onClose}>
      <div className="global-drawer-container">
        <Drawer isExpanded={isOpen} position={position}>
          <DrawerContent panelContent={panelContent} />
        </Drawer>
      </div>
    </Backdrop>
  );
};

