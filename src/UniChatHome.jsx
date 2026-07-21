import { useState, useEffect } from "react";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";
import ServerSidebar from "./components/ServerSidebar/ServerSidebar.jsx";
import FriendsSidebar from "./components/FriendsSidebar/FriendsSidebar.jsx";
import Chat from "./components/Chat/Chat.jsx";
import ProfileCompletion from "./components/ProfileCompletion/ProfileCompletion.jsx";
import Notifications from "./components/Notifications/Notifications.jsx";
import "./UniChatHome.css";

function UniChatHome() {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedServer, setSelectedServer] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("unichat_user") || "{}");
    if (stored.profileIncomplete === true) {
      setShowProfileModal(true);
    }
  }, []);

  function handleProfileComplete() {
    setShowProfileModal(false);
  }

  function handleSelectServer(server) {
    setSelectedServer(server);
    setSelectedChannel(null);
    setSelectedFriend(null);
  }

  function handleSelectChannel(channel) {
    setSelectedChannel(channel);
    setSelectedFriend(null);
  }

  function handleSelectFriend(friend) {
    setSelectedFriend(friend);
    setSelectedChannel(null);
  }

  return (
    <div className="unichat-home">
      {showProfileModal && (
        <ProfileCompletion onComplete={handleProfileComplete} />
      )}

      <div className="top-bar">
        <div className="top-bar-left">
          <h1>UniChat</h1>
        </div>
        <div className="top-bar-right">
          <div className="notifications-wrapper">
            <button
              className="notifications-trigger"
              onClick={() => setShowNotifications(prev => !prev)}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {unreadCount > 0 && (
                <span className="notifications-dot">{unreadCount}</span>
              )}
            </button>
            {showNotifications && (
              <Notifications
                onClose={() => setShowNotifications(false)}
                onUnreadCountChange={setUnreadCount}
              />
            )}
          </div>
        </div>
      </div>

      <PanelGroup direction="horizontal" autoSaveId="main-layout">
        {/* Server Sidebar - Leftmost */}
        <Panel defaultSize={8} minSize={5} maxSize={12}>
          <div className="server-wrapper">
            <ServerSidebar 
              onSelectServer={handleSelectServer}
              selectedServerId={selectedServer?.id}
            />
          </div>
        </Panel>

        <PanelResizeHandle className="resize-handle" />

        {/* Friends/Channels Sidebar - Middle */}
        <Panel defaultSize={20} minSize={15} maxSize={30}>
          <div className="friends-wrapper">
            <FriendsSidebar 
              selectedServer={selectedServer}
              onSelectChannel={handleSelectChannel}
              selectedChannelId={selectedChannel?.id}
              onSelectFriend={handleSelectFriend}
              selectedFriendId={selectedFriend?.id}
            />
          </div>
        </Panel>

        <PanelResizeHandle className="resize-handle" />

        {/* Main Content Area - Right */}
        <Panel defaultSize={72} minSize={40}>
          <div className="main-content">
            <Chat 
              selectedServer={selectedServer}
              selectedChannel={selectedChannel}
              selectedFriend={selectedFriend}
            />
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default UniChatHome;
