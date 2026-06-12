import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import MultiSelect from "../components/MultiSelect";
import { api } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";

const DIET_OPTIONS     = ["Vegetarian", "Vegan", "Halal", "Kosher", "Gluten Free"];
const ALLERGEN_OPTIONS = ["Dairy", "Eggs", "Peanuts", "Tree Nuts", "Soy", "Gluten", "Shellfish"];
const STORAGE_OPTIONS  = ["Refrigerated", "Frozen", "No Refrigeration"];

function toLocalDateTimeInput(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaultPickupTime() {
  const d = new Date();
  d.setHours(d.getHours() + 2, 0, 0, 0);
  return toLocalDateTimeInput(d);
}

function emptyFoodItem() {
  return { name: "", quantity: "", diet_types: [], allergens: [] };
}

export default function MakePostPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const restaurantLocation =
    user?.address && user?.city
      ? `${user.address}, ${user.city}`
      : user?.address || user?.city || "";

  // Section A — free-text description
  const [description, setDescription]     = useState("");
  const [isRecording, setIsRecording]     = useState(false);
  const [isParsing, setIsParsing]         = useState(false);
  const [parseError, setParseError]       = useState("");
  const mediaRecorderRef                  = useRef(null);
  const chunksRef                         = useRef([]);

  // Section B — donor/logistics
  const [donorInfo, setDonorInfo] = useState({
    location:    restaurantLocation,
    pickup_time: defaultPickupTime(),
    storage_type: "",
  });

  // Section C — food items list
  const [foodItems, setFoodItems] = useState([emptyFoodItem()]);

  const [submitError, setSubmitError]   = useState("");
  const [loading, setLoading]           = useState(false);

  // ── Audio recording ─────────────────────────────────────────────────────

  const startRecording = async () => {
    setParseError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        handleTranscribe(new Blob(chunksRef.current, { type: "audio/webm" }));
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      setParseError("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  // ── Whisper transcription ────────────────────────────────────────────────

  const handleTranscribe = async (blob) => {
    setIsParsing(true);
    setParseError("");
    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");
      const res = await fetch("/api/ai/transcribe", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Transcription failed");
      const { text } = await res.json();
      setDescription(text);
      await parseDescription(text);
    } catch (e) {
      setParseError(e.message || "Transcription failed. Try typing instead.");
    } finally {
      setIsParsing(false);
    }
  };

  // ── GPT-4.1 parse ────────────────────────────────────────────────────────

  const parseDescription = async (text) => {
    const t = text ?? description;
    if (!t.trim()) return;
    setIsParsing(true);
    setParseError("");
    try {
      const data = await api.post("/api/ai/parse-donation", { text: t });
      if (data.food_items?.length) {
        setFoodItems(data.food_items.map((item) => ({
          name:       item.name       || "",
          quantity:   item.quantity   || "",
          diet_types: item.diet_types || [],
          allergens:  item.allergens  || [],
        })));
      }
    } catch (e) {
      setParseError("Could not parse description. Please fill the form manually.");
    } finally {
      setIsParsing(false);
    }
  };

  // ── Food item helpers ────────────────────────────────────────────────────

  const setFoodField = (idx, field) => (value) => {
    setFoodItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  const setFoodInput = (idx, field) => (e) => setFoodField(idx, field)(e.target.value);

  const addFoodItem = () => setFoodItems((prev) => [...prev, emptyFoodItem()]);

  const removeFoodItem = (idx) =>
    setFoodItems((prev) => prev.filter((_, i) => i !== idx));

  // ── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setLoading(true);
    try {
      const pickupISO = new Date(donorInfo.pickup_time).toISOString();
      await Promise.all(
        foodItems.map((item) =>
          api.post("/api/donations", {
            name:         item.name,
            quantity:     item.quantity,
            location:     donorInfo.location,
            pickup_time:  pickupISO,
            storage_type: donorInfo.storage_type,
            diet_types:   item.diet_types,
            allergens:    item.allergens,
            description,
            image_emoji:  "🍽️",
          })
        )
      );
      navigate("/Homepage");
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app make-post-page">
      <div className="container">
        <Header hideDonateBtn sticky={false} />

        <form onSubmit={handleSubmit}>

          {/* ── Section A: Description ──────────────────────────────── */}
          <div className="card" style={{ marginBottom: 16 }}>
            <h2 style={{ marginBottom: 8 }}>What are you donating?</h2>
            <p style={{ fontSize: 14, color: "#555", marginBottom: 12 }}>
              Describe what you have, how many portions, and when it needs to go — or record audio and we'll fill the form for you.
            </p>

            <textarea
              placeholder="e.g. 'We have 20 portions of BBQ chicken and 3 trays of rice pilaf, all halal, needs to go by tonight.'"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ minHeight: 100 }}
            />

            <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
              {!isRecording ? (
                <button type="button" onClick={startRecording} disabled={isParsing}
                  style={{ background: "#b71c1c" }}>
                  🎙 Start Recording
                </button>
              ) : (
                <button type="button" onClick={stopRecording}
                  style={{ background: "#555", animation: "pulse 1s infinite" }}>
                  ⏹ Stop Recording
                </button>
              )}

              <button type="button" onClick={() => parseDescription()}
                disabled={isParsing || !description.trim()}
                style={{ background: "#1565c0" }}>
                {isParsing ? "Parsing…" : "✨ Fill form from description"}
              </button>
            </div>

            {isParsing && (
              <p style={{ fontSize: 13, color: "#888", marginTop: 8 }}>Processing…</p>
            )}
            {parseError && (
              <p style={{ fontSize: 13, color: "#c62828", marginTop: 8 }}>{parseError}</p>
            )}
          </div>

          {/* ── Section B: Logistics ───────────────────────────────── */}
          <div className="card" style={{ marginBottom: 16 }}>
            <h2 style={{ marginBottom: 8 }}>Pickup Details</h2>

            <div style={{ position: "relative" }}>
              <input
                placeholder="Pickup Location"
                value={donorInfo.location}
                onChange={(e) => setDonorInfo({ ...donorInfo, location: e.target.value })}
                required
              />
              {restaurantLocation && donorInfo.location !== restaurantLocation && (
                <button type="button"
                  onClick={() => setDonorInfo({ ...donorInfo, location: restaurantLocation })}
                  style={{ fontSize: 12, padding: "2px 8px", background: "transparent",
                    color: "#2e7d32", border: "1px solid #2e7d32", borderRadius: 4, marginTop: 4 }}>
                  Reset to restaurant address
                </button>
              )}
            </div>

            <label>Pickup Date &amp; Time</label>
            <input
              type="datetime-local"
              value={donorInfo.pickup_time}
              onChange={(e) => setDonorInfo({ ...donorInfo, pickup_time: e.target.value })}
              min={toLocalDateTimeInput(new Date())}
              required
              style={{ cursor: "pointer" }}
            />

            <label>Storage Type</label>
            <select
              value={donorInfo.storage_type}
              onChange={(e) => setDonorInfo({ ...donorInfo, storage_type: e.target.value })}
              required
            >
              <option value="">Select one</option>
              {STORAGE_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* ── Section C: Food Items ──────────────────────────────── */}
          <div className="card" style={{ marginBottom: 16 }}>
            <h2 style={{ marginBottom: 8 }}>Food Items</h2>

            {foodItems.map((item, idx) => (
              <div key={idx} style={{
                background: "rgba(255,255,255,0.5)", borderRadius: 12,
                padding: "18px 18px 10px", marginBottom: 14,
                border: "1px solid rgba(0,0,0,0.08)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 15, color: "#2e7d32" }}>
                    Item {idx + 1}
                  </span>
                  {foodItems.length > 1 && (
                    <button type="button" onClick={() => removeFoodItem(idx)}
                      style={{ background: "transparent", color: "#c62828", border: "1px solid #c62828",
                        padding: "2px 10px", fontSize: 13, borderRadius: 6, margin: 0 }}>
                      Remove
                    </button>
                  )}
                </div>

                <input
                  placeholder="Food Name (e.g. BBQ Chicken)"
                  value={item.name}
                  onChange={setFoodInput(idx, "name")}
                  required
                />
                <input
                  placeholder="Quantity (e.g. 20 portions, 3 trays)"
                  value={item.quantity}
                  onChange={setFoodInput(idx, "quantity")}
                  required
                />
                <MultiSelect
                  label="Diet Types"
                  options={DIET_OPTIONS}
                  selected={item.diet_types}
                  setSelected={setFoodField(idx, "diet_types")}
                />
                <MultiSelect
                  label="Allergens Present"
                  options={ALLERGEN_OPTIONS}
                  selected={item.allergens}
                  setSelected={setFoodField(idx, "allergens")}
                />
              </div>
            ))}

            <button type="button" onClick={addFoodItem}
              style={{ background: "transparent", color: "#2e7d32", border: "2px dashed #2e7d32",
                width: "100%", borderRadius: 10, fontSize: 15, margin: 0 }}>
              + Add food to list
            </button>
          </div>

          {submitError && (
            <p style={{ color: "#c62828", fontSize: 14, marginBottom: 8 }}>{submitError}</p>
          )}

          <div style={{ display: "flex", gap: 10, marginBottom: 32 }}>
            <button type="submit" disabled={loading}>
              {loading ? "Posting…" : `Post ${foodItems.length > 1 ? `${foodItems.length} Donations` : "Donation"}`}
            </button>
            <button type="button" className="secondary" onClick={() => navigate("/Dashboard")}>
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
