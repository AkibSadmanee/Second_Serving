import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";

const DIETARY_OPTIONS = [
  "Gluten Free", "Celiac Disease", "Kosher Foods",
  "Vegetarian", "Vegan", "Nut Free", "Dairy Free",
];

const INITIAL = {
  institutionType: "",
  organizationName: "",
  contactName: "",
  addressCity: "",
  email: "",
  password: "",
  phone: "",
  dietaryRestrictions: [],
  refrigeratorStorage: "",
  freezerStorage: "",
  dryStorage: "",
  noReliableStorage: "",
};

export default function ReceiverRegistrationPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const toggleDiet = (item) => {
    const updated = form.dietaryRestrictions.includes(item)
      ? form.dietaryRestrictions.filter((x) => x !== item)
      : [...form.dietaryRestrictions, item];
    setForm({ ...form, dietaryRestrictions: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/api/auth/register", {
        email: form.email,
        password: form.password,
        contact_name: form.contactName,
        phone: form.phone,
        institution_type: form.institutionType,
        organization_name: form.organizationName,
        address_city: form.addressCity,
        dietary_restrictions: form.dietaryRestrictions,
        refrigerator: form.refrigeratorStorage === "Yes",
        freezer: form.freezerStorage === "Yes",
        dry_storage: form.dryStorage === "Yes",
        no_reliable_storage: form.noReliableStorage === "Yes",
      });
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
          <h2>Beneficiary Registration</h2>

          {error && <p style={{ color: "#c62828", fontSize: "15px" }}>{error}</p>}

          <form onSubmit={handleSubmit}>
            <select value={form.institutionType} onChange={set("institutionType")} required>
              <option value="">Institution Type</option>
              <option>Food Pantry</option>
              <option>Shelter</option>
              <option value="NGO">Non-Governmental Organization (NGO)</option>
              <option value="Low-income Household">Low-income Household</option>
              <option value="Religious Organization">Religious Organization</option>
              <option>School</option>
              <option value="Nonprofit Organization">Nonprofit Organization</option>
              <option value="Houseless Individual">Houseless Individual</option>
              <option>Other</option>
            </select>

            <input
              placeholder="Organization Name (optional)"
              value={form.organizationName}
              onChange={set("organizationName")}
            />
            <input placeholder="Contact Name" value={form.contactName} onChange={set("contactName")} required />
            <input placeholder="Address or City" value={form.addressCity} onChange={set("addressCity")} required />
            <input type="email" placeholder="Email" value={form.email} onChange={set("email")} required />
            <input type="password" placeholder="Create Password" value={form.password} onChange={set("password")} required />
            <input type="tel" placeholder="Phone #" value={form.phone} onChange={set("phone")} required />

            <label style={{ marginTop: "14px" }}>Dietary Restrictions (select all that apply)</label>
            <div className="checkbox-group">
              {DIETARY_OPTIONS.map((item) => (
                <label key={item} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.dietaryRestrictions.includes(item)}
                    onChange={() => toggleDiet(item)}
                  />
                  {item}
                </label>
              ))}
            </div>

            <label>Refrigerator storage available?</label>
            <select value={form.refrigeratorStorage} onChange={set("refrigeratorStorage")} required>
              <option value="">Select one</option>
              <option>Yes</option>
              <option>No</option>
            </select>

            <label>Freezer storage available?</label>
            <select value={form.freezerStorage} onChange={set("freezerStorage")} required>
              <option value="">Select one</option>
              <option>Yes</option>
              <option>No</option>
            </select>

            <label>Dry storage available?</label>
            <select value={form.dryStorage} onChange={set("dryStorage")} required>
              <option value="">Select one</option>
              <option>Yes</option>
              <option>No</option>
            </select>

            <label>No reliable storage whatsoever?</label>
            <select value={form.noReliableStorage} onChange={set("noReliableStorage")} required>
              <option value="">Select one</option>
              <option>Yes</option>
              <option>No</option>
            </select>

            <button type="submit" disabled={loading}>{loading ? "Submitting…" : "Submit"}</button>
            <button type="button" className="secondary" onClick={() => navigate("/Registration")}>Back</button>
          </form>
        </div>
      </div>
    </div>
  );
}
