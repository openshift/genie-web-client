import * as React from 'react';
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
  heading: React.ReactNode;
  children: React.ReactNode;
  position: 'left' | 'right';
  onClose: () => void;
}

export const GlobalDrawer: React.FC<GlobalDrawerProps> = ({
  isOpen,
  heading,
  children,
  position,
  onClose,
}) => {
  if (!isOpen) {
    return null;
  }

  const panelContent = (
    <DrawerPanelContent>
      <DrawerHead>
        <span>{heading}</span>
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

