import { Route, Routes } from 'react-router-dom-v5-compat';
// import AIandAutomation from './AIandAutomation'; // Example of sub route component

import { Home } from './home';
import GeniePage from './GeniePage';
import { NewChat } from './chat/NewChat';
import { SubRoutes } from './routeList';
import { Chat } from './chat/Chat';

export default function GenieRoutes() {
  return (
    <Routes>
      <Route element={<GeniePage />}>
        <Route index element={<Home />} />
        <Route path={SubRoutes.NewChat} element={<NewChat />} />
        <Route path={SubRoutes.Chat} element={<Chat />} />
        <Route path={SubRoutes.AIandAutomation} element={<></>} />
        <Route path={SubRoutes.Insights} element={<></>} />
        <Route path={SubRoutes.Security} element={<></>} />
        {/* <Route path={SubRoutes.Infrastructure} element={<Infrastructure />} /> // Example of sub route component */}
        <Route path="*" element={<></>} /> {/* Default route and content */}
      </Route>
    </Routes>
  );
}
