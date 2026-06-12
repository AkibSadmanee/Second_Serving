import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";

const INITIAL = {
  institutionType: "",
  organizationName: "",
  proofOfAddress: null,
  additionalInfo: "",
  contactName: "",
  email: "",
  password: "",
  phone: "",
  address: "",
  city: "",
};

export default function RestaurantRegistrationPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("role", "contributor");
      fd.append("institution_type", form.institutionType);
      fd.append("organization_name", form.organizationName);
      fd.append("contact_name", form.contactName);
      fd.append("email", form.email);
      fd.append("password", form.password);
      fd.append("phone", form.phone);
      fd.append("address", form.address);
      fd.append("city", form.city);
      fd.append("additional_info", form.additionalInfo);
      if (form.proofOfAddress) fd.append("proof_of_address", form.proofOfAddress);
      await api.postForm("/api/auth/register/contributor", fd);
      navigate("/Registration/complete");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "28px", marginTop: "12px" }}>
          <img
            src="/second_serving_clear.png"
            alt="Second Serving"
            style={{ width: "200px", height: "auto", cursor: "pointer" }}
            onClick={() => navigate("/Registration")}
          />
        </div>

        <div className="card">
          <h2>Food Contributor Registration</h2>

          {error && <p style={{ color: "#c62828", fontSize: "15px" }}>{error}</p>}

          <form onSubmit={handleSubmit}>
            <select value={form.institutionType} onChange={set("institutionType")} required>
              <option value="">Institution Type</option>
              <option>Restaurant</option>
              <option>Grocery Store</option>
              <option>Bakery</option>
              <option>Hotel</option>
              <option value="Catering">Catering Company</option>
              <option>Farmers Market</option>
              <option>Individual</option>
              <option>Food Pantry</option>
              <option>Shelter</option>
              <option>Other</option>
            </select>

            <input
              placeholder="Organization / Business Name"
              value={form.organizationName}
              onChange={set("organizationName")}
              required
            />

            <label>Proof of Address (optional — water bill, electric bill, lease, or business license)</label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setForm({ ...form, proofOfAddress: e.target.files[0] })}
            />

            <input placeholder="Contact Name" value={form.contactName} onChange={set("contactName")} required />
            <input type="email" placeholder="Email" value={form.email} onChange={set("email")} required />
            <input type="password" placeholder="Create Password" value={form.password} onChange={set("password")} required />
            <input placeholder="Phone Number" value={form.phone} onChange={set("phone")} required />
            <input placeholder="Street Address" value={form.address} onChange={set("address")} required />
            <input placeholder="City" value={form.city} onChange={set("city")} required />

            <textarea
              placeholder="Optional: menu, food types, donation schedule, any additional info…"
              value={form.additionalInfo}
              onChange={set("additionalInfo")}
            />

            <button type="submit" disabled={loading}>{loading ? "Submitting…" : "Submit"}</button>
            <button type="button" className="secondary" onClick={() => navigate("/Registration")}>Back</button>
          </form>
        </div>
      </div>
    </div>
  );
}
