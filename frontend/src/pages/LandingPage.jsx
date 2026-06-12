import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./LandingPage.css";

const LeafSolid = ({ color = "#0e5f0c", ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
    <path
      fill={color}
      fillRule="evenodd"
      d="M19.981 4.019c-.27-.27-.644-.429-.995-.53a6.4 6.4 0 0 0-1.267-.21c-.936-.07-2.083-.014-3.287.185c-2.388.394-5.158 1.373-6.99 3.204C5.679 8.433 5.31 10.56 5.56 12.39c.196 1.43.773 2.723 1.4 3.59l-3.49 3.489a.75.75 0 1 0 1.061 1.06l3.489-3.488c.867.626 2.16 1.203 3.59 1.398c1.83.25 3.959-.118 5.723-1.883c1.831-1.83 2.81-4.6 3.204-6.989c.199-1.204.255-2.351.185-3.287a6.4 6.4 0 0 0-.21-1.267c-.101-.351-.26-.725-.53-.995M8.005 14.853c.17.269.342.488.498.644c.137.136.321.285.546.434l1.775-1.775l2.209.736a.75.75 0 0 0 .474-1.423l-1.497-.5l1.507-1.506l1.813.363a.75.75 0 0 0 .294-1.471l-.833-.167L16.45 8.53a.75.75 0 1 0-1.06-1.06l-1.66 1.657l-.167-.833a.75.75 0 0 0-1.47.295l.362 1.813l-1.507 1.507l-.5-1.498a.75.75 0 0 0-1.422.475l.736 2.209z"
      clipRule="evenodd"
    />
  </svg>
);

// Canopy zones in SVG-space (viewBox 0 0 100 100). Invisible — only used for spawn math.
const CANOPY_ZONES = [
  { cx: 50, cy: 27, rx: 22, ry: 23 },   // center mass
  { cx: 30, cy: 40, rx: 18, ry: 14 },   // left lobe
  { cx: 75, cy: 40, rx: 18, ry: 14 },   // right lobe
  // { cx: 50, cy: 12, rx: 14, ry: 10 },   // top dome
  { cx: 18, cy: 60, rx: 15, ry: 15 },    // far-left branch oval
  { cx: 75, cy: 60, rx: 15, ry: 13 },    // far-right branch oval
  // { cx: 50, cy: 48, rx: 14, ry: 10 },   // lower center oval
  { cx: 27, cy: 25, rx: 10, ry: 13 },   // left side circle (middle)
  { cx: 70, cy: 25, rx: 10, ry: 13 },   // right side circle (middle)
  // { cx: 12, cy: 30, rx: 9, ry: 11 },    // left side circle (top)
  // { cx: 88, cy: 30, rx: 9, ry: 11 },    // right side circle (top)
  // { cx: 12, cy: 58, rx: 9, ry: 11 },    // left side circle (bottom)
  // { cx: 88, cy: 58, rx: 9, ry: 11 },    // right side circle (bottom)
  // { cx: 14, cy: 70, rx: 8, ry: 10 },    // left side oval (lower)
  // { cx: 86, cy: 70, rx: 8, ry: 10 },    // right side oval (lower)
];

// Pick a random zone then sample uniformly inside that ellipse.
// This guarantees every zone (including the side/bottom ovals) gets coverage.
function randomCanopyPos() {
  const zone = CANOPY_ZONES[Math.floor(Math.random() * CANOPY_ZONES.length)];
  const angle = Math.random() * 2 * Math.PI;
  const r = Math.sqrt(Math.random()); // sqrt gives uniform distribution inside ellipse
  return {
    x: zone.cx + r * zone.rx * Math.cos(angle),
    y: zone.cy + r * zone.ry * Math.sin(angle),
  };
}

function generateLeaves(count) {
  return Array.from({ length: count }, () => {
    const pos = randomCanopyPos();
    return {
      id: Math.random(),
      x: pos.x,
      y: pos.y,
      rot: Math.random() * 360,
      size: 0.9 + Math.random() * 0.8,
      delay: Math.random() * 3,
      color: Math.random() > 0.4 ? "#0e5f0c" : "#3a7d1e",
    };
  });
}

function generateFlowers(count) {
  const types = ["🌸", "🌼", "🌺", "🌷"];
  return Array.from({ length: count }, () => {
    const pos = randomCanopyPos();
    return {
      id: Math.random(),
      x: pos.x,
      y: pos.y,
      emoji: types[Math.floor(Math.random() * types.length)],
      size: 0.85 + Math.random() * 0.5,
      delay: Math.random() * 4,
    };
  });
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [donationCount, setDonationCount] = useState(0);
  const [leaves, setLeaves] = useState([]);
  const [flowers, setFlowers] = useState([]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const loggedInUser = await login(form.email, form.password);
      navigate(loggedInUser.role === "contributor" ? "/Dashboard" : "/Homepage");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = () => {
    const added = 1000;
    const newTotal = donationCount + added;
    const prevFlowers = Math.floor(donationCount / 10);
    const nextFlowers = Math.floor(newTotal / 10);
    setLeaves((prev) => [...prev, ...generateLeaves(added)]);
    setFlowers((prev) => [...prev, ...generateFlowers(nextFlowers - prevFlowers)]);
    setDonationCount(newTotal);
  };

  return (
    <div className="landing-page">
      <div className="landing-main">

        {/* ── Left: tree panel ──────────────────────────────────────────────── */}
        <div className="tree-panel">
          <div className="tree-stage">
            {/* Invisible canopy SVG — defines spawn bounds only */}
            <svg
              className="canopy-svg"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {CANOPY_ZONES.map((z, i) => (
                <ellipse
                  key={i}
                  cx={z.cx}
                  cy={z.cy}
                  rx={z.rx}
                  ry={z.ry}
                  fill="none"
                  stroke="none"
                />
              ))}
            </svg>

            {/* Leaves */}
            {leaves.map((leaf) => (
              <div
                key={leaf.id}
                className="canopy-leaf"
                style={{
                  left: `${leaf.x}%`,
                  top: `${leaf.y}%`,
                  fontSize: `${leaf.size}rem`,
                  animationDelay: `${leaf.delay}s`,
                }}
              >
                <LeafSolid
                  color={leaf.color}
                  style={{ transform: `rotate(${leaf.rot}deg)`, display: "block" }}
                />
              </div>
            ))}

            {/* Flowers */}
            {flowers.map((flower) => (
              <div
                key={flower.id}
                className="canopy-flower"
                style={{
                  left: `${flower.x}%`,
                  top: `${flower.y}%`,
                  fontSize: `${flower.size}rem`,
                  animationDelay: `${flower.delay}s`,
                }}
              >
                {flower.emoji}
              </div>
            ))}

            <img src="/transparenttree.png" alt="tree" className="tree-img" />
          </div>

          {/* Bottom bar */}
          <div className="sim-bar">
            <button className="sim-btn" onClick={handleSimulate}>
              + 1,000 Donations
            </button>
            <p className="sim-note">
              Each leaf and flower represents a donation &mdash;{" "}
              <strong>{donationCount.toLocaleString()}</strong> donations so far
            </p>
          </div>
        </div>

        {/* ── Right: login panel ────────────────────────────────────────────── */}
        <div className="login-panel">
          <div className="login-panel-inner">
            <img
              src="/second_serving_clear.png"
              alt="Second Serving"
              className="login-logo"
            />

            <h2 className="login-heading">Log In</h2>

            {error && <p className="login-error">{error}</p>}

            <form onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button type="submit" disabled={loading} className="login-submit-btn">
                {loading ? "Logging in…" : "Log In"}
              </button>
            </form>

            <div style={{ marginTop: "8px" }}>
              <Link to="/ForgotPassword" className="forgot-link">
                Forgot password?
              </Link>
            </div>

            <hr className="login-divider" />

            <p className="login-panel-signup">Don't have an account yet?</p>
            <button
              className="server-btn signup-action-btn"
              onClick={() => navigate("/Registration")}
            >
              Sign Up
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
