import { useEffect, useState, useCallback, type FC, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';
import { CompassPanel, Nav, NavItem, NavList, Button } from '@patternfly/react-core';
import { HomeIcon, SearchIcon } from '@patternfly/react-icons';
import { mainGenieRoute, SubRoutes } from '../routeList';

const CreateNavItem: FC<{
  subRoute: SubRoutes;
  title: string;
  activeItem: string | number;
}> = ({ subRoute, title, activeItem }) => {
  const navigate = useNavigate();
  return (
    <NavItem
      preventDefault
      itemId={subRoute}
      isActive={activeItem === subRoute}
      to={`${mainGenieRoute}/${subRoute}`}
      onClick={() => navigate(`${mainGenieRoute}/${subRoute}`)}
    >
      {title}
    </NavItem>
  );
};

export const LayoutNav: FC = () => {
  const [activeItem, setActiveItem] = useState<string | number>(0);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleHomeClick = useCallback(() => {
    navigate(mainGenieRoute);
  }, [navigate]);

  // Set the active item based on the current route path
  useEffect(() => {
    const urlSegments = pathname.split('/');
    const lastUrlItem = urlSegments.pop();
    setActiveItem(lastUrlItem as SubRoutes);
  }, [pathname]);

  const onNavSelect = useCallback(
    (
      _event: FormEvent<HTMLInputElement>,
      selectedItem: {
        groupId: number | string;
        itemId: number | string;
        to: string;
      },
    ): void => {
      setActiveItem(selectedItem.itemId);
    },
    [],
  );

  return (
    <div className="global-layout-nav">
      <CompassPanel isPill>
        <Button variant="plain" icon={<HomeIcon />} aria-label="Home" onClick={handleHomeClick} />
        <Nav onSelect={onNavSelect} aria-label="Nav" variant="horizontal">
          <NavList>
            <CreateNavItem
              subRoute={SubRoutes.AIandAutomation}
              title="AI & Automation"
              activeItem={activeItem}
            />
            <CreateNavItem
              subRoute={SubRoutes.Infrastructure}
              title="Infrastructure"
              activeItem={activeItem}
            />
            <CreateNavItem subRoute={SubRoutes.Insights} title="Insights" activeItem={activeItem} />
            <CreateNavItem subRoute={SubRoutes.Security} title="Security" activeItem={activeItem} />
          </NavList>
        </Nav>
        <Button variant="plain" icon={<SearchIcon />} aria-label="Search" />
      </CompassPanel>
    </div>
  );
};
