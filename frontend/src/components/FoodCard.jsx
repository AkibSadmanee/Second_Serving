export default function FoodCard({ food, onView }) {
  return (
    <div className="food-card" onClick={() => onView(food)}>
      <div className="food-card-image">{food.image_emoji || "🍽️"}</div>
      <h3>{food.name}</h3>
      <div className="food-detail"><strong>Qty:</strong> {food.quantity}</div>
      <div className="food-detail"><strong>Donor:</strong> {food.donor}</div>
      <div className="food-detail"><strong>Location:</strong> {food.location}</div>
      <div className="food-detail"><strong>Pickup:</strong> {food.pickup_time}</div>
      <button onClick={(e) => { e.stopPropagation(); onView(food); }}>
        View Listing
      </button>
    </div>
  );
}
