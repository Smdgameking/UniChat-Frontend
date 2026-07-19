import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";
import ServerSidebar from "./components/ServerSidebar/ServerSidebar.jsx";
import DMSidebar from "./components/DMSidebar/DMSidebar.jsx";
import TopNavbar from "./components/TopNavbar/TopNavbar.jsx";
import FriendsPage from "./components/FriendsPage/FriendsPage.jsx";
import ActiveNow from "./components/ActiveNow/ActiveNow.jsx";
import BottomProfile from "./components/BottomProfile/BottomProfile.jsx";
import "./UniChatHome.css";

function UniChatHome() {
  return (
    <div className="unichat-home">
      {/* Server Sidebar - fixed width */}
      <div className="server-wrapper">
        <ServerSidebar />
      </div>

      <PanelGroup direction="horizontal" autoSaveId="main-layout">
        {/* DM Sidebar */}
        <Panel defaultSize={20} minSize={12} maxSize={30}>
          <div className="dm-wrapper">
            <DMSidebar />
            <BottomProfile />
          </div>
        </Panel>

        <PanelResizeHandle className="resize-handle" />

        {/* Main Content Area */}
        <Panel defaultSize={55} minSize={30}>
          <div className="main-content">
            <TopNavbar />
            <FriendsPage />
          </div>
        </Panel>

        <PanelResizeHandle className="resize-handle" />

        {/* Active Now Panel */}
        <Panel defaultSize={25} minSize={15} maxSize={35}>
          <ActiveNow />
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default UniChatHome;