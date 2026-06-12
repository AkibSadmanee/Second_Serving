import { useState, useEffect } from "react";

const ZONE_MS    = 10 * 60 * 1000;   // 10-minute browsing window
const UNCLAIM_MS =  5 * 60 * 1000;   // 5-minute unclaim window after claiming

function fmt(ms) {
  if (ms <= 0) return "0:00";
  const s   = Math.floor(ms / 1000);
  const h   = Math.floor(s / 3600);
  const m   = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export default function ExclusiveZone({ donations, onReserve, externalClaim, onUnclaim, onPairChange }) {
  const [pair,      setPair]      = useState(null);
  const [expiry,    setExpiry]    = useState(null);
  const [phase,     setPhase]     = useState("browsing"); // "browsing" | "claimed"
  const [claimed,   setClaimed]   = useState(null);
  const [claimedAt, setClaimedAt] = useState(null);
  const [now,       setNow]       = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Pick two random donations once the list is ready
  useEffect(() => {
    if (donations?.length >= 2 && !pair) {
      const shuffled = [...donations].sort(() => Math.random() - 0.5);
      const next = shuffled.slice(0, 2);
      setPair(next);
      setExpiry(Date.now() + ZONE_MS);
      onPairChange?.(new Set(next.map((d) => d.id)));
    }
  }, [donations, pair]);

  // Sync to an external claim (e.g. Claim Food button in the regular listings)
  useEffect(() => {
    if (externalClaim) {
      setClaimed(externalClaim);
      setClaimedAt(Date.now());
      setPhase("claimed");
    }
  }, [externalClaim]);

  const zoneLeft    = expiry    ? Math.max(0, expiry    - now) : 0;
  const unclaimLeft = claimedAt ? Math.max(0, claimedAt + UNCLAIM_MS - now) : 0;
  const pickupLeft  = claimed?.pickup_time
    ? Math.max(0, new Date(claimed.pickup_time).getTime() - now)
    : 0;

  // Browsing timer expired with no claim → hide the zone
  if (phase === "browsing" && expiry && now >= expiry) {
    onPairChange?.(new Set());
    return null;
  }
  if (!pair) return null;

  const reserve = (donation) => {
    setClaimed(donation);
    setClaimedAt(Date.now());
    setPhase("claimed");
    onReserve?.(donation);
  };

  const unclaim = () => {
    const prev = claimed;
    setClaimed(null);
    setClaimedAt(null);
    const shuffled = [...donations].sort(() => Math.random() - 0.5);
    const next = shuffled.slice(0, 2);
    setPair(next);
    setExpiry(Date.now() + ZONE_MS);
    setPhase("browsing");
    onPairChange?.(new Set(next.map((d) => d.id)));
    onUnclaim?.(prev);
  };

  // ── Claimed state ──────────────────────────────────────────────────────────
  if (phase === "claimed") {
    return (
      <div className="exclusive-zone">
        <div className="exclusive-zone-header">
          <div className="exclusive-zone-title">
            <span>⚡</span>
            <span>EXCLUSIVE ZONE</span>
          </div>
          <span className="exclusive-zone-confirmed">✅ Reservation confirmed</span>
        </div>

        <div className="exclusive-claimed">
          <div className="exclusive-claimed-info">
            <div className="exclusive-claimed-name">
              {claimed.image_emoji && <span style={{ marginRight: 6 }}>{claimed.image_emoji}</span>}
              {claimed.name}
            </div>
            <div className="exclusive-claimed-meta">
              📍 {claimed.location}
            </div>
            <div className="exclusive-claimed-meta">
              🏢 {claimed.donor}
            </div>
            {claimed.quantity && (
              <div className="exclusive-claimed-meta">{claimed.quantity}</div>
            )}
          </div>

          <div className="exclusive-claimed-right">
            <div className="exclusive-pickup-label">Pickup deadline in</div>
            <div className="exclusive-pickup-countdown">{fmt(pickupLeft)}</div>

            {unclaimLeft > 0 && (
              <div className="exclusive-unclaim-row">
                <button className="exclusive-unclaim-btn" onClick={unclaim}>
                  Unclaim
                </button>
                <div className="exclusive-unclaim-window">
                  {fmt(unclaimLeft)} remaining to unclaim
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Browsing state ─────────────────────────────────────────────────────────
  return (
    <div className="exclusive-zone">
      <div className="exclusive-zone-header">
        <div className="exclusive-zone-title">
          <span>⚡</span>
          <span>EXCLUSIVE ZONE</span>
          <span className="exclusive-zone-sub">Reserve one before time runs out!</span>
        </div>
        <div className={`exclusive-zone-timer${zoneLeft < 60_000 ? " urgent" : ""}`}>
          <span>⏱</span>
          <span>{fmt(zoneLeft)}</span>
        </div>
      </div>

      <div className="exclusive-zone-cards">
        {pair.map((donation) => {
          const pickupDate = donation.pickup_time ? new Date(donation.pickup_time) : null;
          const pickupStr  = pickupDate && !isNaN(pickupDate)
            ? pickupDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : donation.pickup_time;

          return (
            <div key={donation.id} className="exclusive-card">
              {donation.image_emoji && (
                <div className="exclusive-card-emoji">{donation.image_emoji}</div>
              )}
              <div className="exclusive-card-name">{donation.name}</div>
              {donation.quantity && (
                <div className="exclusive-card-qty">{donation.quantity}</div>
              )}
              <div className="exclusive-card-meta">🏢 {donation.donor}</div>
              <div className="exclusive-card-meta">📍 {donation.location}</div>
              {pickupStr && (
                <div className="exclusive-card-pickup">
                  Pickup by {pickupStr}
                </div>
              )}
              <button className="exclusive-reserve-btn" onClick={() => reserve(donation)}>
                Reserve Pickup
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
