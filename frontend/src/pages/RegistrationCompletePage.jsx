import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

export default function RegistrationCompletePage() {
  const navigate = useNavigate();

  return (
    <div className="app">
      <div className="container">
        <Header />

        <div className="card complete-card">
          <div className="complete-icon">✅</div>
          <h2>Registration Complete!</h2>
          <p>
            Thank you for joining Second Serving. Your account is pending review
            and you will receive an email once approved.
          </p>
          <button onClick={() => navigate("/")}>Go to Login</button>
        </div>
      </div>
    </div>
  );
}
