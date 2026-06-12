import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { api } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuth();

  const [form, setForm]     = useState({});
  const [error, setError]   = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) setForm({ ...user, password: "" });
  }, [user]);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    setLoading(true);
    try {
      const updated = await api.put("/api/profile", form);
      setUser(updated);
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to permanently delete your account? This cannot be undone.")) return;
    try {
      await api.delete("/api/profile");
      logout();
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  if (!form.email) return <div className="app"><div className="container"><Header /><p>Loading…</p></div></div>;

  return (
    <div className="app form-page">
      <div className="container">
        <Header />

        <div className="card">
          <h2>Edit Profile</h2>

          {error   && <p style={{ color: "#c62828", fontSize: "14px" }}>{error}</p>}
          {success && <p style={{ color: "#2e7d32", fontSize: "14px" }}>{success}</p>}

          <form onSubmit={handleSave}>
            <input placeholder="Contact Name" value={form.contactName || ""} onChange={set("contactName")} required />
            <input type="email" placeholder="Email" value={form.email || ""} onChange={set("email")} required />
            <input type="password" placeholder="New Password (leave blank to keep current)" value={form.password || ""} onChange={set("password")} />
            <input placeholder="Phone" value={form.phone || ""} onChange={set("phone")} />

            {user?.role === "contributor" ? (
              <>
                <input placeholder="Street Address" value={form.address || ""} onChange={set("address")} />
                <input placeholder="City" value={form.city || ""} onChange={set("city")} />
                <textarea placeholder="Additional info…" value={form.additionalInfo || ""} onChange={set("additionalInfo")} />
              </>
            ) : (
              <input placeholder="Address or City" value={form.addressCity || ""} onChange={set("addressCity")} />
            )}

            <button type="submit" disabled={loading}>{loading ? "Saving…" : "Save Changes"}</button>
            <button type="button" className="secondary" onClick={() => navigate(user?.role === "contributor" ? "/Dashboard" : "/Homepage")}>Cancel</button>
          </form>

          <div className="profile-section">
            <h3 style={{ fontSize: "18px", color: "#c62828", marginBottom: "8px" }}>Danger Zone</h3>
            <button className="danger-btn" onClick={handleDelete}>Delete My Account</button>
          </div>
        </div>
      </div>
    </div>
  );
}
