import { useState, useEffect } from "react";
import Header from "../components/Header";
import { api } from "../utils/api";

export default function ExpiredFoodsPage() {
  const [items, setItems]     = useState([]);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/donations/expired")
      .then((data) => setItems(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="app">
      <div className="container">
        <Header />

        <div className="card">
          <h2>Expired Food Listings</h2>

          {error && <p style={{ color: "#c62828", fontSize: "14px" }}>{error}</p>}

          {loading ? (
            <p>Loading…</p>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <p>No expired food listings.</p>
            </div>
          ) : (
            <div className="claimed-list">
              {items.map((food) => (
                <div key={food.id} className="claimed-item">
                  <div className="claimed-item-info">
                    <h3>{food.name}</h3>
                    <p>Donor: {food.donor}</p>
                    <p>Location: {food.location}</p>
                    <p>Qty: {food.quantity}</p>
                    <p style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
                      Expired: {food.expires_at ? new Date(food.expires_at).toLocaleString() : "—"}
                    </p>
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
