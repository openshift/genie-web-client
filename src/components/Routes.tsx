import { Route, Routes } from 'react-router-dom-v5-compat';
// import AIandAutomation from './AIandAutomation'; // Example of sub route component

import GeniePage from './GeniePage';
import { SubRoutes } from './routeList';

export default function GenieRoutes() {
  return (
    <Routes>
      <Route element={<GeniePage />}>
        <Route path={SubRoutes.AIandAutomation} element={<></>} />
        <Route path={SubRoutes.Insights} element={<></>} />
        <Route path={SubRoutes.Security} element={<></>} />
        {/* <Route path={SubRoutes.Infrastructure} element={<Infrastructure />} /> // Example of sub route component */}
        <Route path="*" element={<></>} /> {/* Default route and content */}
      </Route>
    </Routes>
  );
}
