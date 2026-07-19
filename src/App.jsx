import { Routes, Route, Navigate } from "react-router-dom";

import AuthPage from "./AuthPage.jsx";
import UniChatHome from "./UniChatHome.jsx";

function App() {

    return (

        <Routes>

            <Route path="/" element={<Navigate to="/auth" />} />

            <Route path="/auth" element={<AuthPage />}/>

            <Route path="/dashboard" element={<UniChatHome />}/>

        </Routes>

    );

}

export default App;
