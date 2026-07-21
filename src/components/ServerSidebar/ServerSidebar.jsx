import { useState, useEffect } from "react";
import axios from "axios";
import "./ServerSidebar.css";

function ServerSidebar({ onSelectServer, selectedServerId }) {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchServers();
  }, []);

  async function fetchServers() {
    try {
      setLoading(true);
      setError("");
      const stored = JSON.parse(localStorage.getItem("unichat_user") || "{}");
      
      // Fetch user's servers
      const response = await axios.get("http://10.119.79.91:3000/server/list", {
        headers: { Authorization: `Bearer ${stored.token}` }
      });

      if (response.data.success) {
        // Add default "Friends" server at the beginning
        const friendsServer = {
          id: "friends",
          name: "Friends",
          icon: null,
          isDefault: true
        };
        setServers([friendsServer, ...(response.data.servers || [])]);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load servers");
      // Still show Friends server even if API fails
      setServers([{
        id: "friends",
        name: "Friends",
        icon: null,
        isDefault: true
      }]);
    } finally {
      setLoading(false);
    }
  }

  function getServerIcon(server) {
    if (server.isDefault) {
      return (
        <div className="server-icon friends-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
      );
    }
    
    if (server.icon) {
      return (
        <div className="server-icon">
          <img src={server.icon} alt={server.name} />
        </div>
      );
    }

    // Default icon with first letter
    return (
      <div className="server-icon">
        {server.name?.charAt(0).toUpperCase() || '?'}
      </div>
    );
  }

  return (
    <div className="server-sidebar">
      <div className="server-list">
        {loading && <div className="server-loading">Loading...</div>}
        
        {error && !loading && (
          <div className="server-error">{error}</div>
        )}

        {!loading && servers.map(server => (
          <button
            key={server.id}
            className={`server-button ${selectedServerId === server.id ? 'active' : ''}`}
            onClick={() => onSelectServer(server)}
            title={server.name}
          >
            {getServerIcon(server)}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ServerSidebar;