import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ── Dummy data ────────────────────────────────────────────────────────────────

function makeSampleDonations(userId) {
  const now = Date.now();
  const h   = 3_600_000;
  return [
    {
      id: "sample-1", donor_id: userId, donor: "BBQ Mania",
      name: "BBQ Brisket Platter", quantity: "60 servings", location: "738 Kailua Rd, Kailua",
      pickup_time: new Date(now - 1 * h).toISOString(),
      description: "Leftover brisket from weekend catering event. Vacuum-sealed trays.",
      image_emoji: "🥩", diet_types: [], allergens: [],
      storage_type: "Refrigerated", is_claimed: true, is_expired: false,
      created_at: new Date(now - 26 * h).toISOString(),
    },
    {
      id: "sample-2", donor_id: userId, donor: "BBQ Mania",
      name: "Pulled Pork Sandwiches", quantity: "40 servings", location: "738 Kailua Rd, Kailua",
      pickup_time: new Date(now + 2 * h).toISOString(),
      description: "Freshly pulled pork with buns. Pick up before 8 PM.",
      image_emoji: "🥙", diet_types: [], allergens: [],
      storage_type: "Refrigerated", is_claimed: false, is_expired: false,
      created_at: new Date(now - 3 * h).toISOString(),
    },
    {
      id: "sample-3", donor_id: userId, donor: "BBQ Mania",
      name: "Coleslaw & Sides", quantity: "32 servings", location: "738 Kailua Rd, Kailua",
      pickup_time: new Date(now + 5 * h).toISOString(),
      description: "Creamy coleslaw, baked beans, and mac salad. Great for large groups.",
      image_emoji: "🥗", diet_types: ["Vegetarian"], allergens: ["Dairy", "Eggs"],
      storage_type: "Refrigerated", is_claimed: false, is_expired: false,
      created_at: new Date(now - 4 * h).toISOString(),
    },
    {
      id: "sample-4", donor_id: userId, donor: "BBQ Mania",
      name: "Smoked Chicken Quarters", quantity: "22 servings", location: "738 Kailua Rd, Kailua",
      pickup_time: new Date(now - 28 * h).toISOString(),
      description: "Smoked chicken, already portioned. Expired — not for distribution.",
      image_emoji: "🍗", diet_types: [], allergens: [],
      storage_type: "Refrigerated", is_claimed: false, is_expired: true,
      created_at: new Date(now - 52 * h).toISOString(),
    },
    {
      id: "sample-5", donor_id: userId, donor: "BBQ Mania",
      name: "Cornbread Loaves", quantity: "30 servings", location: "738 Kailua Rd, Kailua",
      pickup_time: new Date(now - 6 * h).toISOString(),
      description: "Homemade jalapeño-cheddar cornbread from Saturday's event.",
      image_emoji: "🍞", diet_types: ["Vegetarian"], allergens: ["Dairy", "Eggs", "Gluten"],
      storage_type: "No Refrigeration", is_claimed: true, is_expired: false,
      created_at: new Date(now - 30 * h).toISOString(),
    },
    {
      id: "sample-6", donor_id: userId, donor: "BBQ Mania",
      name: "BBQ Sauce & Condiments", quantity: "20 servings", location: "738 Kailua Rd, Kailua",
      pickup_time: new Date(now + 24 * h).toISOString(),
      description: "Assorted house-made sauces: original, spicy, and honey-chipotle.",
      image_emoji: "🫙", diet_types: ["Vegan", "Gluten Free"], allergens: [],
      storage_type: "No Refrigeration", is_claimed: false, is_expired: false,
      created_at: new Date(now - 1 * h).toISOString(),
    },
    {
      id: "sample-7", donor_id: userId, donor: "BBQ Mania",
      name: "Hawaiian Plate Lunches", quantity: "18 servings", location: "738 Kailua Rd, Kailua",
      pickup_time: new Date(now + 3 * h).toISOString(),
      description: "Plate lunches with rice, mac salad, and your choice of protein.",
      image_emoji: "🍱", diet_types: [], allergens: ["Dairy", "Soy"],
      storage_type: "Refrigerated", is_claimed: true, is_expired: false,
      created_at: new Date(now - 5 * h).toISOString(),
    },
  ];
}

const TOP_CONTRIBUTORS = [
  { name: "Aloha Kitchen",          servings: 2840 },
  { name: "BBQ Mania",              servings: 1650, isYou: true },
  { name: "Rainbow Drive-In",       servings: 1420 },
  { name: "Zippy's Kaimuki",        servings: 1280 },
  { name: "Maui Tacos",             servings: 1100 },
  { name: "Kona Grill",             servings:  980 },
  { name: "Down to Earth",          servings:  875 },
  { name: "Foodland Kahala",        servings:  760 },
  { name: "Liliha Bakery",          servings:  690 },
  { name: "Helena's Hawaiian Food", servings:  615 },
  { name: "Alan Wong's",            servings:  540 },
  { name: "Side Street Inn",        servings:  480 },
  { name: "Roy's Hawaii Kai",       servings:  420 },
  { name: "Uncle Bo's",             servings:  370 },
  { name: "Tropical Smoothie",      servings:  310 },
];

const TOP_BENEFICIARIES = [
  { name: "Waikiki Community Ctr",      reliability: 98, claims: 142 },
  { name: "UH Mānoa Food Pantry",       reliability: 96, claims: 118 },
  { name: "Catholic Charities Hawaii",  reliability: 95, claims: 203 },
  { name: "Aloha Harvest",              reliability: 94, claims: 287 },
  { name: "Salvation Army Hawaii",      reliability: 92, claims: 156 },
  { name: "Institute for Human Svcs",   reliability: 91, claims: 134 },
  { name: "Hawaii Foodbank",            reliability: 90, claims: 312 },
  { name: "Kalihi-Palama Health Ctr",   reliability: 89, claims:  98 },
  { name: "Family Promise Hawaii",      reliability: 88, claims:  76 },
  { name: "Kokua Mau",                  reliability: 86, claims:  65 },
  { name: "Partners in Care",           reliability: 84, claims:  54 },
  { name: "HMSA Wellness Hub",          reliability: 82, claims:  43 },
  { name: "Healthy Hawaii Coalition",   reliability: 80, claims:  38 },
  { name: "Leeward Food Hub",           reliability: 78, claims:  29 },
  { name: "North Shore Farms Pantry",   reliability: 76, claims:  22 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusBadge(donation) {
  if (donation.is_claimed) return { text: "📦 Claimed",      color: "#1565c0", bg: "#E3F2FD" };
  if (donation.is_expired) return { text: "⏰ Expired",      color: "#c62828", bg: "#FFEBEE" };
  const diffH = (new Date(donation.pickup_time) - Date.now()) / 3_600_000;
  if (isNaN(diffH) || diffH < 0) return { text: "⏰ Expired",      color: "#c62828", bg: "#FFEBEE" };
  if (diffH < 3)                  return { text: "🔴 Urgent",       color: "#E65100", bg: "#FFF3E0" };
  if (diffH < 24)                 return { text: "🟢 Active today", color: "#2E7D32", bg: "#E8F5E9" };
  return                                  { text: "✅ Available",   color: "#2E7D32", bg: "#E8F5E9" };
}

function formatPickup(pt) {
  if (!pt) return "—";
  const d = new Date(pt);
  if (isNaN(d.getTime())) return String(pt);
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ContributorDashboardPage() {
  const navigate         = useNavigate();
  const { user, logout } = useAuth();

  const [activeDonations,  setActiveDonations]  = useState([]);
  const [expiredDonations, setExpiredDonations] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    Promise.all([api.get("/api/donations"), api.get("/api/donations/expired")])
      .then(([active, expired]) => {
        const myActive  = active.filter((d) => d.donor_id === user.id);
        const myExpired = expired.filter((d) => d.donor_id === user.id);
        if (myActive.length === 0 && myExpired.length === 0) {
          const s = makeSampleDonations(user.id);
          setActiveDonations(s.filter((d) => !d.is_expired));
          setExpiredDonations(s.filter((d) => d.is_expired));
        } else {
          setActiveDonations(myActive);
          setExpiredDonations(myExpired);
        }
      })
      .catch(() => {
        const s = makeSampleDonations(user.id);
        setActiveDonations(s.filter((d) => !d.is_expired));
        setExpiredDonations(s.filter((d) => d.is_expired));
      })
      .finally(() => setLoading(false));
  }, [user.id]);

  const allMyDonations = useMemo(
    () => [...activeDonations, ...expiredDonations].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    ),
    [activeDonations, expiredDonations]
  );

  const stats = useMemo(() => {
    const claimed = allMyDonations.filter((d) => d.is_claimed).length;
    return {
      total:   allMyDonations.length,
      active:  activeDonations.filter((d) => !d.is_claimed).length,
      claimed,
      expired: expiredDonations.length,
      meals:   claimed * 4,
    };
  }, [allMyDonations, activeDonations, expiredDonations]);

  const orgName  = "BBQ Mania";
  const initials = orgName.trim().charAt(0).toUpperCase();
  const fullName = user?.contact_name || orgName;

  const [cardModalOpen,  setCardModalOpen]  = useState(false);
  const [cardImageUrl,   setCardImageUrl]   = useState(null);
  const [cardLoading,    setCardLoading]    = useState(false);
  const [cardCopied,     setCardCopied]     = useState(false);

  const generateCard = useCallback(async () => {
    setCardLoading(true);
    setCardModalOpen(true);
    setCardImageUrl(null);
    setCardCopied(false);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        restaurant_name: orgName,
        meals_donated:   String(stats.meals),
      });
      const res = await fetch(
        `${API_BASE}/api/card/contribution?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to generate card");
      const blob = await res.blob();
      setCardImageUrl(URL.createObjectURL(blob));
    } catch {
      setCardModalOpen(false);
    } finally {
      setCardLoading(false);
    }
  }, [orgName, stats.meals]);

  const downloadCard = () => {
    if (!cardImageUrl) return;
    const a = document.createElement("a");
    a.href = cardImageUrl;
    a.download = `${orgName.replace(/\s+/g, "_")}_contribution_card.png`;
    a.click();
  };

  const copyCard = async () => {
    if (!cardImageUrl) return;
    try {
      const res  = await fetch(cardImageUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setCardCopied(true);
      setTimeout(() => setCardCopied(false), 2000);
    } catch {
      /* clipboard API not available — silent fail */
    }
  };

  return (
    <div className="app">
      <div className="listings-shell">

        {/* ── Combined header + welcome pane ── */}
        <div style={{
          background: "linear-gradient(to right, #edfaef 0%, #25522d 100%)",
          borderRadius: "16px",
          padding: "22px 28px",
          marginBottom: "24px",
        }}>
          {/* Top row: logo · welcome text · actions */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}>
            {/* Logo */}
            <img
              src="/second_serving_clear.png"
              alt="Second Serving"
              style={{ height: "120px", width: "auto", cursor: "pointer", flexShrink: 0 }}
              onClick={() => navigate("/Dashboard")}
            />

            {/* Divider */}
            <div style={{ width: "1px", height: "40px", background: "rgba(30,60,35,0.18)", flexShrink: 0 }} />

            {/* Welcome text — dark so it reads on the light left side */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "22px", fontWeight: 700, lineHeight: 1.2, color: "#1a3320" }}>
                Welcome back, {orgName} 👋
              </div>
              <div style={{ fontSize: "14px", color: "rgba(26,51,32,0.62)", marginTop: "3px" }}>
                {user?.institution_type || "Restaurant"} · {user?.city || "Honolulu"}
              </div>
            </div>

            {/* Action buttons — sit on the dark right side, frosted white */}
            <button
              onClick={() => navigate("/MakePost")}
              style={{
                background: "rgba(255,255,255,0.18)",
                color: "white",
                fontWeight: 600,
                fontSize: "14px",
                padding: "10px 18px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.35)",
                cursor: "pointer",
                margin: 0,
                whiteSpace: "nowrap",
                flexShrink: 0,
                backdropFilter: "blur(4px)",
                transition: "background 0.15s",
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.28)"; }}
              onMouseOut={(e)  => { e.currentTarget.style.background = "rgba(255,255,255,0.18)"; }}
            >
              + Post A New Donation
            </button>

            <button
              onClick={generateCard}
              style={{
                background: "rgba(255,255,255,0.18)",
                color: "white",
                fontWeight: 600,
                fontSize: "14px",
                padding: "10px 18px",
                borderRadius: "10px",
                border: "1px solid rgba(255,255,255,0.35)",
                cursor: "pointer",
                margin: 0,
                whiteSpace: "nowrap",
                flexShrink: 0,
                backdropFilter: "blur(4px)",
                transition: "background 0.15s",
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.28)"; }}
              onMouseOut={(e)  => { e.currentTarget.style.background = "rgba(255,255,255,0.18)"; }}
            >
              🏅 Contribution Card
            </button>

            {/* Avatar + dropdown — sits on the dark right side */}
            <div ref={menuRef} style={{ position: "relative", flexShrink: 0 }}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.22)",
                  border: "2px solid rgba(255,255,255,0.5)",
                  color: "white",
                  fontSize: "36px",
                  fontWeight: 700,
                  cursor: "pointer",
                  margin: 0,
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.15s",
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.32)"; }}
                onMouseOut={(e)  => { e.currentTarget.style.background = "rgba(255,255,255,0.22)"; }}
                aria-label="Open user menu"
              >
                {initials}
              </button>

              {menuOpen && (
                <div style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 10px)",
                  width: "220px",
                  background: "white",
                  borderRadius: "12px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.05)",
                  border: "1px solid rgba(0,0,0,0.07)",
                  overflow: "hidden",
                  zIndex: 200,
                  animation: "dropdownIn 0.12s ease",
                }}>
                  <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid #f0f0f0" }}>
                    <div style={{ fontWeight: 600, fontSize: "14px", color: "#111" }}>{fullName}</div>
                    <div style={{ fontSize: "12px", color: "#999", marginTop: "2px" }}>{user?.email}</div>
                  </div>
                  <button
                    className="topnav-dropdown-item"
                    onClick={() => { setMenuOpen(false); navigate("/EditProfile"); }}
                  >
                    Edit Profile
                  </button>
                  <div style={{ height: "1px", background: "#f0f0f0" }} />
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
        </div>

        {/* ── Two-column body ── */}
        <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>

          {/* ── Left: stats + table ── */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Stat cards */}
            <div className="metrics-row">
              <div className="metric-card" style={{ borderTop: "3px solid #dba138" }}>
                <span className="metric-num">{stats.total}</span>
                <span className="metric-lbl">Total Posted</span>
              </div>
              <div className="metric-card" style={{ borderTop: "3px solid #2E7D32" }}>
                <span className="metric-num">{stats.active}</span>
                <span className="metric-lbl">Currently Active</span>
              </div>
              <div className="metric-card" style={{ borderTop: "3px solid #1565c0" }}>
                <span className="metric-num">{stats.claimed}</span>
                <span className="metric-lbl">Times Claimed</span>
              </div>
              <div className="metric-card" style={{ borderTop: "3px solid #66BB6A" }}>
                <span className="metric-num">~{stats.meals}</span>
                <span className="metric-lbl">Meals Provided</span>
              </div>
            </div>

            {/* Impact bar */}
            <div className="impact-bar">
              <div className="impact-stat">
                <span className="impact-icon">🌱</span>
                <span className="impact-value">{stats.claimed} donations</span>
                <span className="impact-label">successfully claimed</span>
              </div>
              <div className="impact-stat">
                <span className="impact-icon">🍽️</span>
                <span className="impact-value">~{stats.meals} meals</span>
                <span className="impact-label">provided to community</span>
              </div>
              <div className="impact-stat">
                <span className="impact-icon">♻️</span>
                <span className="impact-value">{stats.expired} post{stats.expired !== 1 ? "s" : ""}</span>
                <span className="impact-label">expired unclaimed</span>
              </div>
            </div>

            {/* My Donations table */}
            <div style={{ marginTop: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h2 style={{ margin: 0, fontSize: "20px" }}>My Donations</h2>
                <button
                  className="server-btn"
                  style={{ margin: 0, padding: "8px 16px", fontSize: "14px" }}
                  onClick={() => navigate("/MakePost")}
                >
                  + Post A New Donation
                </button>
              </div>

              {loading ? (
                <div className="empty-state"><p>Loading your donations…</p></div>
              ) : (
                <div className="food-table-container">
                  <table className="food-table">
                    <thead>
                      <tr>
                        <th>Food Item</th>
                        <th>Servings</th>
                        <th>Location</th>
                        <th>Pickup Time</th>
                        <th>Storage</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allMyDonations.map((d) => {
                        const badge    = statusBadge(d);
                        const isSample = d.id.startsWith("sample-");
                        return (
                          <tr
                            key={d.id}
                            style={{ cursor: isSample ? "default" : "pointer" }}
                            onClick={() => !isSample && navigate(`/Donation/${d.id}`)}
                          >
                            <td style={{ fontWeight: 500 }}>
                              <span style={{ marginRight: "6px" }}>{d.image_emoji}</span>
                              {d.name}
                            </td>
                            <td>{d.quantity}</td>
                            <td>{d.location}</td>
                            <td style={{ whiteSpace: "nowrap" }}>{formatPickup(d.pickup_time)}</td>
                            <td>{d.storage_type || "—"}</td>
                            <td>
                              <span className="urgency-badge" style={{ color: badge.color, background: badge.bg }}>
                                {badge.text}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Tip banner */}
            {stats.expired > 0 && (
              <div style={{
                background: "#FFF8E1",
                border: "1px solid #FFD54F",
                borderRadius: "12px",
                padding: "16px 20px",
                marginTop: "20px",
                fontSize: "14px",
                color: "#795548",
              }}>
                <strong>💡 Tip:</strong> {stats.expired} of your donation{stats.expired !== 1 ? "s" : ""} expired
                before being claimed. Try posting earlier in the day or extending the pickup window.
              </div>
            )}
          </div>

          {/* ── Right: rankings sidebar ── */}
          <div style={{ width: "290px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Top Contributors */}
            <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e8f0e9", overflow: "hidden" }}>
              <div style={{ background: "linear-gradient(to right, #edfaef, #c8e6c9)", padding: "14px 16px 12px" }}>
                <div style={{ fontWeight: 700, fontSize: "15px", color: "#1a3320" }}>🏆 Top 15 Contributors</div>
                <div style={{ fontSize: "12px", color: "rgba(26,51,32,0.6)", marginTop: "2px" }}>Ranked by servings donated</div>
              </div>
              <div style={{ padding: "8px 0" }}>
                {TOP_CONTRIBUTORS.map((c, i) => (
                  <div key={c.name} style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "7px 16px",
                    gap: "10px",
                    background: c.isYou ? "rgba(46,125,50,0.06)" : "transparent",
                    borderLeft: c.isYou ? "3px solid #2e7d32" : "3px solid transparent",
                  }}>
                    <span style={{
                      width: "22px",
                      fontWeight: 700,
                      fontSize: "13px",
                      color: i === 0 ? "#b8860b" : i === 1 ? "#888" : i === 2 ? "#a0522d" : "#bbb",
                      flexShrink: 0,
                      textAlign: "center",
                    }}>
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
                    </span>
                    <span style={{
                      flex: 1,
                      fontSize: "13px",
                      fontWeight: c.isYou ? 700 : 400,
                      color: c.isYou ? "#1a3320" : "#333",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {c.name}{c.isYou ? " (You)" : ""}
                    </span>
                    <span style={{ fontSize: "12px", color: "#666", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                      {c.servings.toLocaleString()} srv
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Most Reliable Beneficiaries */}
            <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e8f0e9", overflow: "hidden" }}>
              <div style={{ background: "linear-gradient(to right, #e3f2fd, #bbdefb)", padding: "14px 16px 12px" }}>
                <div style={{ fontWeight: 700, fontSize: "15px", color: "#0d2b4a" }}>⭐ Most Reliable Beneficiaries</div>
                <div style={{ fontSize: "12px", color: "rgba(13,43,74,0.6)", marginTop: "2px" }}>Ranked by claim reliability</div>
              </div>
              <div style={{ padding: "8px 0" }}>
                {TOP_BENEFICIARIES.map((b, i) => (
                  <div key={b.name} style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "7px 16px",
                    gap: "10px",
                  }}>
                    <span style={{
                      width: "22px",
                      fontWeight: 700,
                      fontSize: "13px",
                      color: i === 0 ? "#b8860b" : i === 1 ? "#888" : i === 2 ? "#a0522d" : "#bbb",
                      flexShrink: 0,
                      textAlign: "center",
                    }}>
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
                    </span>
                    <span style={{
                      flex: 1,
                      fontSize: "13px",
                      color: "#333",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {b.name}
                    </span>
                    <span style={{ fontSize: "12px", color: "#1565c0", flexShrink: 0, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                      {b.reliability}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Contribution Card Modal ── */}
      {cardModalOpen && (
        <div
          onClick={(e) => e.target === e.currentTarget && setCardModalOpen(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div style={{
            background: "white",
            borderRadius: "18px",
            padding: "24px 28px",
            maxWidth: "560px",
            width: "90%",
            boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "18px", color: "#1a3320" }}>🏅 Contribution Card</div>
                <div style={{ fontSize: "13px", color: "#888", marginTop: "2px" }}>{orgName}</div>
              </div>
              <button
                onClick={() => setCardModalOpen(false)}
                style={{
                  background: "none", border: "none", fontSize: "22px",
                  cursor: "pointer", color: "#999", padding: "4px", margin: 0, lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>

            {/* Image area — max-height reserves space for header + buttons + padding */}
            <div style={{
              borderRadius: "12px",
              overflow: "hidden",
              background: "#f4f6f4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "120px",
            }}>
              {cardLoading ? (
                <div style={{ color: "#888", fontSize: "14px", padding: "48px" }}>Generating your card…</div>
              ) : cardImageUrl ? (
                <img
                  src={cardImageUrl}
                  alt="Contribution card"
                  style={{
                    width: "100%",
                    height: "auto",
                    maxHeight: "calc(90vh - 200px)",
                    objectFit: "contain",
                    display: "block",
                  }}
                />
              ) : null}
            </div>

            {/* Action buttons */}
            {cardImageUrl && (
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={downloadCard}
                  style={{
                    flex: 1,
                    background: "#25522d",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    padding: "12px",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    margin: 0,
                    transition: "background 0.15s",
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = "#1a3d20"; }}
                  onMouseOut={(e)  => { e.currentTarget.style.background = "#25522d"; }}
                >
                  ⬇ Download
                </button>
                <button
                  onClick={copyCard}
                  style={{
                    flex: 1,
                    background: cardCopied ? "#e8f5e9" : "#f4f6f4",
                    color: cardCopied ? "#2e7d32" : "#333",
                    border: `1px solid ${cardCopied ? "#a5d6a7" : "#ddd"}`,
                    borderRadius: "10px",
                    padding: "12px",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    margin: 0,
                    transition: "background 0.15s, color 0.15s",
                  }}
                >
                  {cardCopied ? "✓ Copied!" : "📋 Copy to Clipboard"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
