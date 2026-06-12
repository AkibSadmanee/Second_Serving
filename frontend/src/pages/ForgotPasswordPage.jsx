import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { api } from "../utils/api";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/api/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="container">
        <Header />

        <div className="card forgot-card">
          <h2>Forgot Password</h2>

          {sent ? (
            <div style={{ textAlign: "center" }}>
              <p>
                If an account exists for <strong>{email}</strong>, a password
                reset link has been sent.
              </p>
              <button onClick={() => navigate("/")}>Back to Login</button>
            </div>
          ) : (
            <>
              <p style={{ fontSize: "15px" }}>
                Enter your email address and we'll send you a link to reset your
                password.
              </p>
              {error && <p style={{ color: "#c62828", fontSize: "14px" }}>{error}</p>}
              <form onSubmit={handleSubmit}>
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" disabled={loading}>
                  {loading ? "Sending…" : "Send Reset Link"}
                </button>
                <button type="button" className="secondary" onClick={() => navigate("/")}>
                  Back
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
