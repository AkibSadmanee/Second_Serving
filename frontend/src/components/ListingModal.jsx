const DIET_EMOJI = { Vegetarian: "🥕", Vegan: "🌱", Halal: "☪️", Kosher: "✡️", "Gluten Free": "🍽️" };
const ALLERGEN_EMOJI = { Dairy: "🥛", Eggs: "🥚", Peanuts: "🥜", "Tree Nuts": "🌰", Soy: "🫘", Gluten: "🌾", Wheat: "🌾", Shellfish: "🦐" };

export default function ListingModal({ food, isClaimed, onClaim, onClose }) {
  return (
    <div className="listing-modal-overlay" onClick={onClose}>
      <div className="listing-modal" onClick={(e) => e.stopPropagation()}>

        <h2 style={{ marginBottom: 6 }}>{food.name}</h2>
        <p style={{ fontSize: 15, color: "#555", marginBottom: 0 }}>
          {food.description || "Fresh surplus food available for pickup."}
        </p>

        <div className="listing-grid">
          <div className="listing-box">
            <h4>🏪 Donor Information</h4>
            <div className="compact">
              <strong>{food.donor || "—"}</strong>
              <span>📍 {food.location || "—"}</span>
            </div>
          </div>

          <div className="listing-box">
            <h4>📦 Details</h4>
            <div className="compact">
              <span><strong>Quantity:</strong> {food.quantity || "—"}</span>
              <span><strong>Pickup:</strong> {food.pickup_time ? new Date(food.pickup_time).toLocaleString() : food.pickup_time || "—"}</span>
              {food.storage_type && <span><strong>Storage:</strong> {food.storage_type}</span>}
            </div>
          </div>

          <div className="listing-box">
            <h4>🥗 Dietary Information</h4>
            <div style={{ marginBottom: 6, fontSize: 14 }}>
              <strong>Diet Types: </strong>
              {food.diet_types?.length ? (
                food.diet_types.map((d) => (
                  <span key={d} style={{ marginRight: 10 }}>{DIET_EMOJI[d] || "🍽️"} {d}</span>
                ))
              ) : "None listed"}
            </div>
            <div style={{ fontSize: 14 }}>
              <strong>Allergens: </strong>
              {food.allergens?.length ? (
                food.allergens.map((a) => (
                  <span key={a} style={{ marginRight: 10 }}>{ALLERGEN_EMOJI[a] || "⚠️"} {a}</span>
                ))
              ) : "None listed"}
            </div>
          </div>
        </div>

        <div className="listing-actions">
          <button className="claim-btn" onClick={() => onClaim(food)}>
            {isClaimed ? "✓ Claimed" : "Claim Food"}
          </button>
          <button className="secondary" onClick={onClose}>Close</button>
        </div>

      </div>
    </div>
  );
}
