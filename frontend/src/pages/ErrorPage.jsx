import { useNavigate } from "react-router-dom";
import "./ErrorPage.css";

const FOOD_EMOJIS = [
  "🍌","🍞","🥬","🍅","🥕","🥔","🍎","🥦","🥒",
  "🍌","🥬","🍞","🍅","🥦","🥕","🥔","🍎",
  "🥒","🍌","🍞","🥬","🍅","🥕","🥔","🍎",
  "🥦","🥒","🍌","🍞","🥬","🍅",
];

export default function ErrorPage() {
  const navigate = useNavigate();

  return (
    <div className="error-scene">
      <div className="landfill-field">
        {FOOD_EMOJIS.map((item, i) => (
          <span key={i} className={`food-piece food-${i}`}>{item}</span>
        ))}
      </div>

      <div className="error-card">
          <img
            className="cardlogo"
            src="/second_serving_clear.png"
            alt="Second Serving logo"
          />
        <div className="error-number">
          <span>4</span>
          <div className="plate-zero">🍽️</div>
          <span>4</span>
        </div>

        <h2 className="error-title">This Serving Couldn't Be Found</h2>

        <p className="error-text">
          This page has been lost among food that never got a second chance.
          Let's get you back to helping reduce food waste and supporting our
          community.
        </p>

        <button className="home-btn" onClick={() => navigate("/")}>
          Return Home
        </button>

        
      </div>
    </div>
  );
}
