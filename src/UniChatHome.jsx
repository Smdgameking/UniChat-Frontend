import { useState, useEffect } from "react";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";
import ServerSidebar from "./components/ServerSidebar/ServerSidebar.jsx";
import DMSidebar from "./components/DMSidebar/DMSidebar.jsx";
import Chat from "./components/Chat/Chat.jsx";
import ProfileCompletion from "./components/ProfileCompletion/ProfileCompletion.jsx";
import "./UniChatHome.css";

function UniChatHome() {
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("unichat_user") || "{}");
    if (stored.profileIncomplete === true) {
      setShowProfileModal(true);
    }
  }, []);

  function handleProfileComplete() {
    setShowProfileModal(false);
  }

  return (
    <div className="unichat-home">
      {showProfileModal && (
        <ProfileCompletion onComplete={handleProfileComplete} />
      )}

      {/* Server Sidebar - fixed width */}
      <div className="server-wrapper">
        <ServerSidebar />
      </div>

      <PanelGroup direction="horizontal" autoSaveId="main-layout">
        {/* DM Sidebar */}
        <Panel defaultSize={20} minSize={12} maxSize={30}>
          <div className="dm-wrapper">
            <DMSidebar />
          </div>
        </Panel>

        <PanelResizeHandle className="resize-handle" />

        {/* Main Content Area */}
        <Panel defaultSize={55} minSize={30}>
          <div className="main-content">
            <Chat />
          </div>
        </Panel>

      </PanelGroup>
    </div>
  );
}

export default UniChatHome;
