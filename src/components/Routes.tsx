import { Route, Routes, Outlet } from 'react-router-dom-v5-compat';
// import AIandAutomation from './AIandAutomation'; // Example of sub route component

import { Home } from './home';
import { GeniePage } from './GeniePage';
import { NewChat } from './new-chat/NewChat';
import { SubRoutes } from './routeList';
import { ArtifactLibrary } from './artifact-library';
import { CanvasPreview } from './canvas';
import { Chat } from './chat';
import { StartChatWithPrompt } from './chat/StartChatWithPrompt';

const GenieRoutes = () => {
  return (
    <Routes>
      <Route element={<GeniePage />}>
        <Route index element={<Home />} />
        <Route path={SubRoutes.Chat} element={<Outlet />}>
          <Route index element={<Chat />} />
          <Route path={SubRoutes.New} element={<NewChat />} />
          <Route path={SubRoutes.StartChat} element={<StartChatWithPrompt />} />
          <Route path=":conversationId" element={<Chat />} />
        </Route>
        <Route path={SubRoutes.Library} element={<ArtifactLibrary />} />
        <Route path={SubRoutes.Canvas} element={<CanvasPreview />} />
        <Route path={SubRoutes.AIandAutomation} element={<></>} />
        <Route path={SubRoutes.Insights} element={<></>} />
        <Route path={SubRoutes.Security} element={<></>} />
        <Route path="*" element={<></>} /> {/* Default route and content */}
      </Route>
    </Routes>
  );
};

export default GenieRoutes;
