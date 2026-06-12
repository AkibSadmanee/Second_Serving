import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { api } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";

const FIVE_MIN = 5 * 60 * 1000;

export default function DonationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [donation, setDonation] = useState(null);
  const [claimed, setClaimed]   = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get(`/api/donations/${id}`)
      .then((d) => setDonation(d))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const canEdit = donation
    ? (Date.now() - new Date(donation.created_at).getTime() <= FIVE_MIN || !donation.is_claimed)
    : false;

  const handleClaim = async () => {
    setError("");
    try {
      await api.post(`/api/donations/${id}/claim`, {});
      setClaimed(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = () => navigate(`/Donation/${id}/edit`);

  const handleDelete = async () => {
    if (!window.confirm("Delete this donation?")) return;
    try {
      await api.delete(`/api/donations/${id}`);
      navigate("/Homepage");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="app"><div className="container"><Header /><p>Loading…</p></div></div>;

  if (!donation) return (
    <div className="app">
      <div className="container">
        <Header />
        <div className="card"><p>{error || "Donation not found."}</p><button onClick={() => navigate("/Homepage")}>Back</button></div>
      </div>
    </div>
  );

  const isDonor = user?.id === donation.donor_id;

  return (
    <div className="app">
      <div className="container">
        <Header />

        <div className="card">
          <div style={{ fontSize: "64px", marginBottom: "14px" }}>{donation.image_emoji || "🍽️"}</div>
          <h2>{donation.name}</h2>

          {error && <p style={{ color: "#c62828", fontSize: "14px" }}>{error}</p>}

          <div className="listing-detail-row"><strong>Quantity:</strong> {donation.quantity}</div>
          <div className="listing-detail-row"><strong>Location:</strong> {donation.location}</div>
          <div className="listing-detail-row"><strong>Pickup:</strong> {donation.pickup_time}</div>
          {donation.diet_types?.length > 0 && (
            <div className="listing-detail-row"><strong>Diet Types:</strong> {donation.diet_types.join(", ")}</div>
          )}
          {donation.allergens?.length > 0 && (
            <div className="listing-detail-row"><strong>Allergens:</strong> {donation.allergens.join(", ")}</div>
          )}
          {donation.storage_type && (
            <div className="listing-detail-row"><strong>Storage:</strong> {donation.storage_type}</div>
          )}
          {donation.description && (
            <div className="listing-detail-row"><strong>Description:</strong> {donation.description}</div>
          )}

          <div className="listing-actions">
            {!isDonor && (
              <button className="claim-btn" onClick={handleClaim} disabled={claimed}>
                {claimed ? "✓ Claimed" : "Claim Food"}
              </button>
            )}
            {isDonor && canEdit && (
              <>
                <button onClick={handleEdit}>Edit</button>
                <button className="danger-btn" onClick={handleDelete}>Delete</button>
              </>
            )}
            <button className="secondary" onClick={() => navigate("/Homepage")}>Back</button>
          </div>
        </div>
      </div>
    </div>
  );
}
