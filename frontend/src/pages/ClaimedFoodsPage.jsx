import { useState, useEffect } from "react";
import Header from "../components/Header";
import { api } from "../utils/api";

const FIVE_MIN = 5 * 60 * 1000;

export default function ClaimedFoodsPage() {
  const [claims, setClaims]   = useState([]);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get("/api/claims")
      .then((data) => setClaims(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const canCancel = (claim) => {
    const elapsed = Date.now() - new Date(claim.claimed_at).getTime();
    return elapsed <= FIVE_MIN;
  };

  const handleCancel = async (claimId) => {
    setError("");
    try {
      await api.delete(`/api/claims/${claimId}`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="app">
      <div className="container">
        <Header />

        <div className="card">
          <h2>Claimed Foods</h2>

          {error && <p style={{ color: "#c62828", fontSize: "14px" }}>{error}</p>}

          {loading ? (
            <p>Loading…</p>
          ) : claims.length === 0 ? (
            <div className="empty-state">
              <p>You haven't claimed any food yet.</p>
            </div>
          ) : (
            <div className="claimed-list">
              {claims.map((claim) => (
                <div key={claim.id} className="claimed-item">
                  <div className="claimed-item-info">
                    <h3>{claim.donation?.name || "Food Item"}</h3>
                    <p>Donor: {claim.donation?.donor || "—"}</p>
                    <p>Location: {claim.donation?.location || "—"}</p>
                    <p>Pickup: {claim.donation?.pickup_time || "—"}</p>
                    <p style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
                      Claimed: {new Date(claim.claimed_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="claimed-item-actions">
                    {canCancel(claim) && (
                      <button className="danger-btn" onClick={() => handleCancel(claim.id)}>
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
