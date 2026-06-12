import React, { useState } from "react";

export default function App() {
  const [page, setPage] = useState("home");

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
const [passwordData, setPasswordData] = useState({
  password: "",
});

  const [contributorData, setContributorData] = useState({
  institutionType: "",
  organizationName: "",
  proofOfAddress: null,
  additionalInfo: "",
  contactName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  password: "", 
});

const [beneficiaryData, setBeneficiaryData] = useState({
  institutionType: "",
  organizationName: "",
  contactName: "",
  contactInfo: "",
  addressCity: "",
  mouthsToFeed: "",
  dietaryRestrictions: [],
  refrigeratorStorage: "",
  freezerStorage: "",
  dryStorage: "",
  noReliableStorage: "",
  password: "",
});
  const handleLogin = (e) => {
    e.preventDefault();
    console.log(loginData);
    alert("Login submitted!");
  };

  // CHANGED
  const handleContributorSubmit = (e) => {
    e.preventDefault();
    console.log({ role: "CONTRIBUTOR", ...contributorData });
    alert("Contributor registration submitted!");
  };

  // CHANGED
  const handleBeneficiarySubmit = (e) => {
    e.preventDefault();
    console.log({ role: "BENEFICIARY", ...beneficiaryData });
    alert("Beneficiary registration submitted!");
  };

  return (
    <div className="app">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: "SN Pro", Arial, sans-serif;
        }

        html,
        body,
        #root {
          min-height: 100%;
          width: 100%;
          margin: 0;
          padding: 0;
          background-color: #DAD8CD;
        }

        .app {
          min-height: 100vh;
          width: 100%;
          background-color: #DAD8CD;
          padding: 30px 20px;
        }

        .container {
          max-width: 750px;
          margin: 0 auto;
        }

        .header {
          text-align: center;
          margin-bottom: 25px;
        }

        .logo {
          width: 200px;
          margin-bottom: 10px;
        }

        h1 {
          font-size: 38px;
          margin-bottom: 10px;
          color: #2e7d32;
        }

        h2 {
          font-size: 30px;
          margin-bottom: 20px;
          margin-top: 10px;
        }

        p {
          font-size: 18px;
          margin-bottom: 20px;
          line-height: 1.6;
        }

        input, select, textarea {
          width: 100%;
          padding: 14px;
          margin: 12px 0;
          border-radius: 10px;
          border: 1px solid #bbb;
          font-size: 16px;
        }

        textarea {
          min-height: 110px;
        }

        button {
          background-color: #2e7d32;
          color: white;
          padding: 14px 22px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-size: 16px;
          margin-right: 10px;
          margin-top: 10px;
        }

        .secondary {
          background-color: #ccc;
          color: #000;
        }

        .card {
          background: rgba(255,255,255,0.6);
          padding: 25px;
          border-radius: 15px;
          margin-top: 15px;
        }

        .server-btn { background-color: #dba138; color: white; }
        .receiver-btn { background-color: #6b8d38; color: white; }
      `}</style>

      <div className="container">
        <div className="header">
          <img src="/second_serving_clear.png" className="logo" alt="logo" />
        </div>

        {/* HOME */}
        {page === "home" && (
          <div className="card" style={{ textAlign: "center" }}>
            <h1>Second Serving</h1>
            <p>Connecting surplus food with communities that need it most.</p>

            <div style={{ marginTop: 20 }}>
              <h2>Log In</h2>

              <form onSubmit={handleLogin}>
                <input
                  type="email"
                  placeholder="Email"
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData({ ...loginData, email: e.target.value })
                  }
                  required
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                  required
                />

                <button type="submit">Log In</button>
              </form>

              <p style={{ marginTop: 20 }}>
                Don’t already have an account?
              </p>

              <button
                className="server-btn"
                onClick={() => setPage("contributor")}
              >
                Sign Up as Contributor
              </button>

              <button
                className="receiver-btn"
                onClick={() => setPage("beneficiary")}
              >
                Sign Up as Beneficiary
              </button>
            </div>
          </div>
        )}

        {/* CONTRIBUTOR FORM */}
        {page === "contributor" && (
          <div className="card">
            <h2>Contributor Registration</h2>

            <form onSubmit={handleContributorSubmit}>
              <select
                value={contributorData.institutionType}
                onChange={(e) =>
                  setContributorData({
                    ...contributorData,
                    institutionType: e.target.value,
                  })
                }
                required
              >
                <option value="">Institution Type</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Food Pantry">Food Pantry</option>
                <option value="Shelter">Shelter</option>
                <option value="Farmers Market">Farmers Market</option>
                <option value="Individual">Individual</option>
                <option value="Grocery Store">Grocery Store</option>
                <option value="Bakery">Bakery</option>
                <option value="Hotel">Hotel</option>
                <option value="Catering">Catering Company</option>
                <option value="Other">Other</option>
              </select>

              <input
                placeholder="Organization Name"
                value={contributorData.organizationName}
                onChange={(e) =>
                  setContributorData({
                    ...contributorData,
                    organizationName: e.target.value,
                  })
                }
                required
              />

              <label>Proof of Address (water bill, electric bill, lease, etc.)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setContributorData({
                    ...contributorData,
                    proofOfAddress: e.target.files[0],
                  })
                }
                required
              />

              <input
                placeholder="Contact Name"
                value={contributorData.contactName}
                onChange={(e) =>
                  setContributorData({
                    ...contributorData,
                    contactName: e.target.value,
                  })
                }
                required
              />

              <input
                type="email"
                placeholder="Email"
                value={contributorData.email}
                onChange={(e) =>
                  setContributorData({
                    ...contributorData,
                    email: e.target.value,
                  })
                }
                required
              />
              <input
  type="password"
  placeholder="Create Password"
  value={contributorData.password}
  onChange={(e) =>
    setContributorData({
      ...contributorData,
      password: e.target.value,
    })
  }
  required
/>

              <input
                placeholder="Phone"
                value={contributorData.phone}
                onChange={(e) =>
                  setContributorData({
                    ...contributorData,
                    phone: e.target.value,
                  })
                }
                required
              />

              <input
                placeholder="Address"
                value={contributorData.address}
                onChange={(e) =>
                  setContributorData({
                    ...contributorData,
                    address: e.target.value,
                  })
                }
                required
              />
              <input
                placeholder="City"
                value={contributorData.city}
                onChange={(e) =>
                  setContributorData({
                    ...contributorData,
                    city: e.target.value,
                  })
                }
                required
              />

              <button type="submit">Submit</button>
              <button type="button" className="secondary" onClick={() => setPage("home")}>
                Back
              </button>
            </form>
          </div>
        )}

        {/* BENEFICIARY FORM */}
        {page === "beneficiary" && (
          <div className="card">
            <h2>Beneficiary Registration</h2>

            <form onSubmit={handleBeneficiarySubmit}>
              <select
                value={beneficiaryData.institutionType}
                onChange={(e) =>
                  setBeneficiaryData({
                    ...beneficiaryData,
                    institutionType: e.target.value,
                  })
                }
                required
              >
                <option value="">Institution Type</option>
                <option value="Food Pantry">Food Pantry</option>
                <option value="Shelter">Shelter</option>
                <option value="Non-Governmental Organization (NGO)">Non-Governmental Organization (NGO)</option>
                <option value="Low-income Household">Low-income Household</option>
                <option value="Religious Organization">Religious Organization</option>
                <option value="Low-income Household">Low-income Household</option>
                <option value="School">School</option>
                <option value="Nonprofit Organization">Nonprofit Organization</option>
                <option value="Houseless Individual">Houseless Individual</option>
              </select>

              <input
                placeholder="Organization Name (optional)"
                value={beneficiaryData.organizationName}
                onChange={(e) =>
                  setBeneficiaryData({
                    ...beneficiaryData,
                    organizationName: e.target.value,
                  })
                }
              />

              <input
                placeholder="Contact Name"
                value={beneficiaryData.contactName}
                onChange={(e) =>
                  setBeneficiaryData({
                    ...beneficiaryData,
                    contactName: e.target.value,
                  })
                }
                required
              />
               <input
                placeholder="Address or City"
                value={beneficiaryData.addressCity}
                onChange={(e) =>
                  setBeneficiaryData({
                    ...beneficiaryData,
                   addressCity: e.target.value,
                  })
                }
                required
              />


              <input
  type="email"
  placeholder="Email"
  value={beneficiaryData.email}
  onChange={(e) =>
    setBeneficiaryData({
      ...beneficiaryData,
      email: e.target.value,
    })
  }
  required
/>
<input
  type="password"
  placeholder="Create Password"
  value={beneficiaryData.password}
  onChange={(e) =>
    setBeneficiaryData({
      ...beneficiaryData,
      password: e.target.value,
    })
  }
  required
/>

<input
  type="tel"
  placeholder="Phone #"
  value={beneficiaryData.phone}
  onChange={(e) =>
    setBeneficiaryData({
      ...beneficiaryData,
      phone: e.target.value,
    })
  }
  required
/>

             <div style={{ marginTop: "10px" }}>
  <p style={{ marginBottom: "10px", fontWeight: "bold" }}>
    Dietary Restrictions (select all that apply)
  </p>

  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "10px",
    }}
  >
    {[
      "Gluten Free",
      "Celiac Disease",
      "Kosher Foods",
      "Vegetarian",
      "Vegan",
      "Nut Free",
      "Dairy Free",
    ].map((item) => (
      <label
        key={item}
        style={{
          width: "calc(50% - 10px)",
          display: "flex",
          alignItems: "center",
          fontSize: "14px",
          background: "rgba(255,255,255,0.5)",
          padding: "10px",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        <input
          type="checkbox"
          checked={beneficiaryData.dietaryRestrictions.includes(item)}
          onChange={(e) => {
            const updated = e.target.checked
              ? [...beneficiaryData.dietaryRestrictions, item]
              : beneficiaryData.dietaryRestrictions.filter(
                  (x) => x !== item
                );

            setBeneficiaryData({
              ...beneficiaryData,
              dietaryRestrictions: updated,
            });
          }}
          style={{ marginRight: "8px" }}
        />
        {item}
      </label>
    ))}
  </div>
</div>
{/* Refrigerator Storage */}
<label style={{ fontWeight: "bold" }}>
  Do you have refrigerator storage readily available?
</label>

<select
  value={beneficiaryData.refrigeratorStorage}
  onChange={(e) =>
    setBeneficiaryData({
      ...beneficiaryData,
      refrigeratorStorage: e.target.value,
    })
  }
  required
>
  <option value="">Select One</option>
  <option value="Yes">Yes</option>
  <option value="No">No</option>
</select>

{/* Freezer Storage */}
<label style={{ fontWeight: "bold" }}>
  Do you have freezer storage readily available?
</label>

<select
  value={beneficiaryData.freezerStorage}
  onChange={(e) =>
    setBeneficiaryData({
      ...beneficiaryData,
      freezerStorage: e.target.value,
    })
  }
  required
>
  <option value="">Select One</option>
  <option value="Yes">Yes</option>
  <option value="No">No</option>
</select>

{/* Dry Storage */}
<label style={{ fontWeight: "bold" }}>
  Do you have dry storage readily available?
</label>

<select
  value={beneficiaryData.dryStorage}
  onChange={(e) =>
    setBeneficiaryData({
      ...beneficiaryData,
      dryStorage: e.target.value,
    })
  }
  required
>
  <option value="">Select One</option>
  <option value="Yes">Yes</option>
  <option value="No">No</option>
</select>

{/* No Reliable Storage */}
<label style={{ fontWeight: "bold" }}>
  Do you have no reliable storage whatsoever?
</label>

<select
  value={beneficiaryData.noReliableStorage}
  onChange={(e) =>
    setBeneficiaryData({
      ...beneficiaryData,
      noReliableStorage: e.target.value,
    })
  }
  required
>
  <option value="">Select One</option>
  <option value="Yes">Yes</option>
  <option value="No">No</option>
</select>

              <button type="submit">Submit</button>
              <button type="button" className="secondary" onClick={() => setPage("home")}>
                Back
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}