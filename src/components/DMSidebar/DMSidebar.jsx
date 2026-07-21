import { useState } from "react";
import FriendSearch from "../FriendSearch/FriendSearch.jsx";
import "./DMSidebar.css";

function DMSidebar() {
    const [showFriendSearch, setShowFriendSearch] = useState(false);

    return (
        <div className="dm-sidebar">
            <div className="dm-sidebar-header">
                <span className="dm-sidebar-title">Direct Messages</span>
                <button
                    className="dm-add-friend-btn"
                    onClick={() => setShowFriendSearch(true)}
                    title="Add Friend"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="8.5" cy="7" r="4"/>
                        <line x1="20" y1="8" x2="20" y2="14"/>
                        <line x1="23" y1="11" x2="17" y2="11"/>
                    </svg>
                </button>
            </div>

            {showFriendSearch && (
                <FriendSearch onClose={() => setShowFriendSearch(false)} />
            )}
        </div>
    );
}

export default DMSidebar;