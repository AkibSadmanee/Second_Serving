import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Header.css";

export default function Header({ welcomeSub, hideDonateBtn = false, sticky = true }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const initials = user
    ? (user.contact_name || user.organization_name || user.email || "?")
        .trim()
        .charAt(0)
        .toUpperCase()
    : "";

  const displayName =
    user?.contact_name ||
    user?.organization_name ||
    user?.email?.split("@")[0] ||
    "there";

  const fullName = user?.contact_name || user?.organization_name || "Account";

  return (
    <header className="topnav" style={!sticky ? { position: "static" } : undefined}>
      {/* Left: logo + optional welcome text */}
      <div className="topnav-left">
        <div
          className="topnav-logo"
          onClick={() => navigate(user ? (user.role === "contributor" ? "/Dashboard" : "/Homepage") : "/")}
        >
          <img src="/second_serving_clear.png" alt="Second Serving" />
        </div>
        {user && welcomeSub !== undefined && (
          <div className="topnav-welcome-text">
            <span className="topnav-welcome-name">Welcome back, {displayName} 👋</span>
          </div>
        )}
      </div>

      {/* Right: donate + avatar */}
      {user && (
        <div className="topnav-right">
          {user.role === "contributor" && !hideDonateBtn && (
            <button className="topnav-donate-btn" onClick={() => navigate("/MakePost")}>
              + Donate Food
            </button>
          )}
          <div className="topnav-user" ref={menuRef}>
            <button
              className={`topnav-avatar${menuOpen ? " open" : ""}`}
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Open user menu"
            >
              {initials}
            </button>
            {menuOpen && (
              <div className="topnav-dropdown">
                <div className="topnav-dropdown-info">
                  <span className="topnav-dropdown-name">{fullName}</span>
                  <span className="topnav-dropdown-email">{user.email}</span>
                </div>
                <div className="topnav-dropdown-divider" />
                <button
                  className="topnav-dropdown-item"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate(user.role === "contributor" ? "/Dashboard" : "/Homepage");
                  }}
                >
                  {user.role === "contributor" ? "My Dashboard" : "Home"}
                </button>
                <div className="topnav-dropdown-divider" />
                <button
                  className="topnav-dropdown-item"
                  onClick={() => { setMenuOpen(false); navigate("/EditProfile"); }}
                >
                  Edit Profile
                </button>
                <div className="topnav-dropdown-divider" />
                <button
                  className="topnav-dropdown-item topnav-dropdown-signout"
                  onClick={() => { setMenuOpen(false); logout(); navigate("/"); }}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
