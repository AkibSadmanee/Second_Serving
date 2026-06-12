import { useNavigate } from "react-router-dom";

export default function RegistrationPage() {
  const navigate = useNavigate();

  return (
    <div className="app">
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "28px", marginTop: "12px" }}>
          <img
            src="/second_serving_clear.png"
            alt="Second Serving"
            style={{ width: "200px", height: "auto", cursor: "pointer" }}
            onClick={() => navigate("/")}
          />
        </div>

        <div className="card" style={{ textAlign: "center" }}>
          <h2>Create an Account</h2>
          <p>Choose how you would like to use Second Serving.</p>

          <button
            className="server-btn"
            onClick={() => navigate("/Registration/restaurant")}
            style={{ display: "block", width: "100%", marginBottom: "12px" }}
          >
            🍽️ Sign Up as a Food Contributor
            <br />
            <small style={{ fontWeight: "normal", fontSize: "13px" }}>
              Restaurants, bakeries, grocery stores, hotels, catering companies
            </small>
          </button>

          <button
            className="receiver-btn"
            onClick={() => navigate("/Registration/receiver")}
            style={{ display: "block", width: "100%" }}
          >
            🤝 Sign Up as a Beneficiary
            <br />
            <small style={{ fontWeight: "normal", fontSize: "13px" }}>
              Shelters, food pantries, NGOs, individuals in need
            </small>
          </button>

          <button className="secondary" onClick={() => navigate("/")} style={{ marginTop: "20px" }}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
