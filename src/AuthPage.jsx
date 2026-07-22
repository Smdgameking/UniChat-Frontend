import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "./utils/errorHandler";
import "./AuthPage.css";

function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const navigate = useNavigate();

    // Login state
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    // Register state
    const [regUsername, setRegUsername] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");
    const [regConfirmPassword, setRegConfirmPassword] = useState("");
    const [regMonth, setRegMonth] = useState("");
    const [regDay, setRegDay] = useState("");
    const [regYear, setRegYear] = useState("");

    // Error state
    const [error, setError] = useState("");

    async function handleLogin(e) {
        e.preventDefault();
        setError("");

        if (!loginEmail || !loginPassword) {
            setError("Please fill in all fields");
            return;
        }

        try {
            const response = await axios.post(
                "http://localhost:3000/auth/login",
                { email: loginEmail, password: loginPassword }
            );
            if (response.data.success) {
                // Store user data including profileIncomplete flag
                const userData = {
                    token: response.data.accessToken,
                    user: response.data.user,
                    username: response.data.user?.username || response.data.username,
                    profileIncomplete: response.data.profileInComplete || false,
                };
                localStorage.setItem("unichat_user", JSON.stringify(userData));
                navigate("/dashboard");
            }
        } catch (err) {
            setError(getErrorMessage(err, "Invalid email or password"));
        }
    }

    async function handleRegister(e) {
        e.preventDefault();
        setError("");

        if (!regUsername || !regEmail || !regPassword || !regConfirmPassword || !regMonth || !regDay || !regYear) {
            setError("Please fill in all fields");
            return;
        }

        if (regPassword !== regConfirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (regPassword.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        const dob = `${regYear}-${regMonth.padStart(2, "0")}-${regDay.padStart(2, "0")}`;

        try {
            const response = await axios.post(
                "http://localhost:3000/auth/register",
                {
                    username: regUsername,
                    email: regEmail,
                    password: regPassword,
                    confirmpassword: regConfirmPassword,
                    dob,
                }
            );
            if (response.data.success) {
                setIsLogin(true);
                setError("Account created! Please log in.");
            }
        } catch (err) {
            setError(getErrorMessage(err, "Registration failed"));
        }
    }

    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const years = Array.from({ length: 77 }, (_, i) => 1950 + i);

    return (
        <div className="auth-page">
            <div className="auth-container">
                {/* Decorative elements */}
                <div className="auth-decoration auth-decoration-1"></div>
                <div className="auth-decoration auth-decoration-2"></div>
                <div className="auth-decoration auth-decoration-3"></div>

                <div className="auth-card">
                    {/* Toggle */}
                    <div className="auth-toggle">
                        <button
                            className={`auth-toggle-btn ${isLogin ? "active" : ""}`}
                            onClick={() => { setIsLogin(true); setError(""); }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            Login
                        </button>
                        <button
                            className={`auth-toggle-btn ${!isLogin ? "active" : ""}`}
                            onClick={() => { setIsLogin(false); setError(""); }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                <circle cx="8.5" cy="7" r="4"/>
                                <line x1="20" y1="8" x2="20" y2="14"/>
                                <line x1="23" y1="11" x2="17" y2="11"/>
                            </svg>
                            Register
                        </button>
                    </div>

                    {/* Error/Success message */}
                    {error && (
                        <div className={`auth-message ${error.includes("created") ? "success" : "error"}`}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                {error.includes("created")
                                    ? <polyline points="20 6 9 17 4 12"/>
                                    : <><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></>
                                }
                            </svg>
                            {error}
                        </div>
                    )}

                    {/* Login Form */}
                    <div className={`auth-form-wrapper ${isLogin ? "show" : "hide"}`}>
                        <div className="auth-header">
                            <h2>Welcome Back</h2>
                            <p>Sign in to continue to your account</p>
                        </div>

                        <form onSubmit={handleLogin} className="auth-form">
                            <div className="input-group">
                                <label htmlFor="login-email">Email</label>
                                <div className="input-field">
                                    <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                        <polyline points="22,6 12,13 2,6"/>
                                    </svg>
                                    <input
                                        type="email"
                                        id="login-email"
                                        placeholder="Enter your email"
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label htmlFor="login-password">Password</label>
                                <div className="input-field">
                                    <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                    </svg>
                                    <input
                                        type="password"
                                        id="login-password"
                                        placeholder="Enter your password"
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button type="submit" className="auth-submit">
                                <span>Sign In</span>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12"/>
                                    <polyline points="12 5 19 12 12 19"/>
                                </svg>
                            </button>
                        </form>
                    </div>

                    {/* Register Form */}
                    <div className={`auth-form-wrapper ${!isLogin ? "show" : "hide"}`}>
                        <div className="auth-header">
                            <h2>Create Account</h2>
                            <p>Join us and start your journey</p>
                        </div>

                        <form onSubmit={handleRegister} className="auth-form">
                            <div className="input-group">
                                <label htmlFor="reg-username">Username</label>
                                <div className="input-field">
                                    <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                        <circle cx="12" cy="7" r="4"/>
                                    </svg>
                                    <input
                                        type="text"
                                        id="reg-username"
                                        placeholder="Choose a username"
                                        value={regUsername}
                                        onChange={(e) => setRegUsername(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label htmlFor="reg-email">Email</label>
                                <div className="input-field">
                                    <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                        <polyline points="22,6 12,13 2,6"/>
                                    </svg>
                                    <input
                                        type="email"
                                        id="reg-email"
                                        placeholder="Enter your email"
                                        value={regEmail}
                                        onChange={(e) => setRegEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label htmlFor="reg-password">Password</label>
                                <div className="input-field">
                                    <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                    </svg>
                                    <input
                                        type="password"
                                        id="reg-password"
                                        placeholder="Create a password"
                                        value={regPassword}
                                        onChange={(e) => setRegPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label htmlFor="reg-confirm">Confirm Password</label>
                                <div className="input-field">
                                    <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                        <polyline points="9 14 11 16 15 12"/>
                                    </svg>
                                    <input
                                        type="password"
                                        id="reg-confirm"
                                        placeholder="Confirm your password"
                                        value={regConfirmPassword}
                                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Date of Birth</label>
                                <div className="dob-selects">
                                    <select value={regMonth} onChange={(e) => setRegMonth(e.target.value)}>
                                        <option value="">Month</option>
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <option key={i + 1} value={String(i + 1).padStart(2, "0")}>
                                                {new Date(0, i).toLocaleString("default", { month: "long" })}
                                            </option>
                                        ))}
                                    </select>
                                    <select value={regDay} onChange={(e) => setRegDay(e.target.value)}>
                                        <option value="">Day</option>
                                        {days.map((d) => (
                                            <option key={d} value={String(d).padStart(2, "0")}>{d}</option>
                                        ))}
                                    </select>
                                    <select value={regYear} onChange={(e) => setRegYear(e.target.value)}>
                                        <option value="">Year</option>
                                        {years.map((y) => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <button type="submit" className="auth-submit">
                                <span>Create Account</span>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                    <circle cx="8.5" cy="7" r="4"/>
                                    <line x1="20" y1="8" x2="20" y2="14"/>
                                    <line x1="23" y1="11" x2="17" y2="11"/>
                                </svg>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AuthPage;