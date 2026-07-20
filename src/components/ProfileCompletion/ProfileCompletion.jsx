import { useState } from "react";
import axios from "axios";
import "./ProfileCompletion.css";

function ProfileCompletion({ onComplete }) {
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [gender, setGender] = useState("");
  const [country, setCountry] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!displayName || !gender || !country || !phoneNo) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const stored = JSON.parse(localStorage.getItem("unichat_user") || "{}");
      const response = await axios.post(
        "http://localhost:3000/user/complete-profile",
        {
          username: stored.username,
          displayName,
          bio,
          gender,
          country,
          phoneNo,
        },
        {
          headers: {
            Authorization: `Bearer ${stored.token}`,
          },
        }
      );

      if (response.data.success) {
        // Update stored user data
        stored.profileIncomplete = false;
        stored.displayName = displayName;
        localStorage.setItem("unichat_user", JSON.stringify(stored));
        if (onComplete) onComplete();
      } else {
        setError(response.data.message || "Failed to update profile");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSkip() {
    const stored = JSON.parse(localStorage.getItem("unichat_user") || "{}");
    stored.profileIncomplete = false;
    localStorage.setItem("unichat_user", JSON.stringify(stored));
    if (onComplete) onComplete();
  }

  return (
    <div className="profile-overlay">
      <div className="profile-modal">
        <div className="profile-modal-header">
          <div className="profile-modal-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
              <line x1="18" y1="8" x2="18" y2="14"/>
              <line x1="15" y1="11" x2="21" y2="11"/>
            </svg>
          </div>
          <h2>Complete Your Profile</h2>
          <p>Add a few details to help others get to know you</p>
        </div>

        {error && (
          <div className="profile-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="profile-input-group">
            <label htmlFor="displayName">
              Display Name <span className="required">*</span>
            </label>
            <div className="profile-input-field">
              <svg className="profile-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <input
                type="text"
                id="displayName"
                placeholder="e.g. John Doe"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={32}
              />
            </div>
          </div>

          <div className="profile-input-group">
            <label htmlFor="bio">Bio</label>
            <div className="profile-input-field profile-textarea-field">
              <svg className="profile-input-icon profile-textarea-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              <textarea
                id="bio"
                placeholder="Tell us a little about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={160}
                rows={3}
              />
              <span className="char-count">{bio.length}/160</span>
            </div>
          </div>

          <div className="profile-row">
            <div className="profile-input-group">
              <label htmlFor="gender">
                Gender <span className="required">*</span>
              </label>
              <div className="profile-input-field">
                <svg className="profile-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="profile-input-group">
              <label htmlFor="country">
                Country <span className="required">*</span>
              </label>
              <div className="profile-input-field">
                <svg className="profile-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                <select
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                >
                  <option value="">Select country</option>
                  <option value="AF">Afghanistan</option>
                  <option value="AL">Albania</option>
                  <option value="DZ">Algeria</option>
                  <option value="AR">Argentina</option>
                  <option value="AU">Australia</option>
                  <option value="AT">Austria</option>
                  <option value="BD">Bangladesh</option>
                  <option value="BE">Belgium</option>
                  <option value="BR">Brazil</option>
                  <option value="CA">Canada</option>
                  <option value="CN">China</option>
                  <option value="CO">Colombia</option>
                  <option value="HR">Croatia</option>
                  <option value="CZ">Czech Republic</option>
                  <option value="DK">Denmark</option>
                  <option value="EG">Egypt</option>
                  <option value="FI">Finland</option>
                  <option value="FR">France</option>
                  <option value="DE">Germany</option>
                  <option value="GR">Greece</option>
                  <option value="HK">Hong Kong</option>
                  <option value="HU">Hungary</option>
                  <option value="IS">Iceland</option>
                  <option value="IN">India</option>
                  <option value="ID">Indonesia</option>
                  <option value="IR">Iran</option>
                  <option value="IQ">Iraq</option>
                  <option value="IE">Ireland</option>
                  <option value="IL">Israel</option>
                  <option value="IT">Italy</option>
                  <option value="JP">Japan</option>
                  <option value="KE">Kenya</option>
                  <option value="KR">South Korea</option>
                  <option value="MY">Malaysia</option>
                  <option value="MX">Mexico</option>
                  <option value="NL">Netherlands</option>
                  <option value="NZ">New Zealand</option>
                  <option value="NG">Nigeria</option>
                  <option value="NO">Norway</option>
                  <option value="PK">Pakistan</option>
                  <option value="PH">Philippines</option>
                  <option value="PL">Poland</option>
                  <option value="PT">Portugal</option>
                  <option value="RO">Romania</option>
                  <option value="RU">Russia</option>
                  <option value="SA">Saudi Arabia</option>
                  <option value="SG">Singapore</option>
                  <option value="ZA">South Africa</option>
                  <option value="ES">Spain</option>
                  <option value="SE">Sweden</option>
                  <option value="CH">Switzerland</option>
                  <option value="TH">Thailand</option>
                  <option value="TR">Turkey</option>
                  <option value="UA">Ukraine</option>
                  <option value="AE">United Arab Emirates</option>
                  <option value="GB">United Kingdom</option>
                  <option value="US">United States</option>
                  <option value="VN">Vietnam</option>
                </select>
              </div>
            </div>
          </div>

          <div className="profile-input-group">
            <label htmlFor="phoneNo">
              Phone Number <span className="required">*</span>
            </label>
            <div className="profile-input-field">
              <svg className="profile-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <input
                type="tel"
                id="phoneNo"
                placeholder="e.g. +1 234 567 8900"
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value)}
              />
            </div>
          </div>

          <div className="profile-actions">
            <button
              type="button"
              className="profile-skip-btn"
              onClick={handleSkip}
              disabled={loading}
            >
              Skip for now
            </button>
            <button
              type="submit"
              className="profile-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="profile-loading">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="profile-spinner">
                    <circle cx="12" cy="12" r="10" opacity="0.25"/>
                    <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75"/>
                  </svg>
                  Saving...
                </span>
              ) : (
                <span>Save Profile</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileCompletion;