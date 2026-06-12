import React, { useState } from "react";
function MultiSelect({
  label,
  options,
  selected,
  setSelected,
}) {
  const [open, setOpen] = React.useState(false);

  const toggleOption = (option) => {
    if (selected.includes(option)) {
      setSelected(
        selected.filter((item) => item !== option)
      );
    } else {
      setSelected([...selected, option]);
    }
  };

  return (
    <div className="multi-select">

      <label>{label}</label>

      <div
        className="multi-select-box"
        onClick={() => setOpen(!open)}
      >
        {selected.length === 0 ? (
          <span className="placeholder">
            Select options...
          </span>
        ) : (
          <div className="selected-tags">
            {selected.map((item) => (
              <span
                key={item}
                className="selected-tag"
              >
                {item}
              </span>
            ))}
          </div>
        )}
      </div>

      {open && (
        <div className="dropdown-menu">
          {options.map((option) => (
            <label
              key={option}
              className="dropdown-option"
            >
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() =>
                  toggleOption(option)
                }
              />
              {option}
            </label>
          ))}
        </div>
      )}

    </div>
  );
}
export default function App() {
  const [page, setPage] = useState("foodListings");

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [serverData, setServerData] = useState({
    institutionType: "",
    organizationName: "",
    proofOfAddress: null,
    additionalInfo: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
  });

  const [receiverData, setReceiverData] = useState({
    institutionType: "",
    organizationName: "",
    contactName: "",
    contactInfo: "",
    address: "",
    mouthsToFeed: "",
    dietaryRestrictions: "",
    refrigerationAvailable: "",
  });

  const sampleFoodListings = [
  {
  id: 1,
  name: "Pizza Trays",
  quantity: "8 trays",
  donor: "Downtown Pizza",
  location: "Honolulu",
  pickup: "Today 6 PM",
  image: "🍕",
  dietTypes: ["Vegetarian"],
  allergens: ["Dairy", "Wheat"],
  storage: "Refrigerated",
  description:
    "Fresh pizza from a catered event. Available for same-day pickup."
},
  {
    id: 2,
    name: "Fresh Bread",
    quantity: "25 loaves",
    donor: "Island Bakery",
    location: "Waikiki",
    pickup: "Today 8 PM",
    image: "🍞",
  },
  {
    id: 3,
    name: "Mixed Produce",
    quantity: "50 lbs",
    donor: "Aloha Market",
    location: "Pearl City",
    pickup: "Tomorrow",
    image: "🥬",
  },
];

  const handleLogin = (e) => {
    e.preventDefault();
    console.log(loginData);
    alert("Login submitted!");
  };

  const handleServerSubmit = (e) => {
    e.preventDefault();
    console.log({ role: "SERVER", ...serverData });
    alert("Server registration submitted!");
  };

  const handleReceiverSubmit = (e) => {
    e.preventDefault();
    console.log({ role: "RECEIVER", ...receiverData });
    alert("Receiver registration submitted!");
  };

  const [showFilters, setShowFilters] = useState(false);

const [filters, setFilters] = useState({
  dietTypes: [],
  allergens: [],
  quantities: [],
  storageTypes: [],
});

const [selectedListing, setSelectedListing] = useState(null);
const [claimedFood, setClaimedFood] = useState([]);
const handleClaimFood = (food) => {
  const alreadyClaimed = claimedFood.some(
    (item) => item.id === food.id
  );

  if (alreadyClaimed) {
    setClaimedFood(
      claimedFood.filter(
        (item) => item.id !== food.id
      )
    );
  } else {
    setClaimedFood([
      ...claimedFood,
      food,
    ]);
  }
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

        .spacer {
          height: 15px;
        }
          .server-btn {
  background-color: #dba138;
  color: white;
}

.receiver-btn {
  background-color: #6b8d38;
  color: white;
}

.signup-text {
  margin-top: 25px;
  font-size: 18px;
}

.signup-link {
  color: #2e7d32;
  font-weight: bold;
  cursor: pointer;
  text-decoration: underline;
}

.login-form {
  max-width: 500px;
  margin: 0 auto;
}
      `}</style>

      <div className="container">
  <div className="header">
    <img
      src="/second_serving_clear.png"
      alt="logo"
      style={{
        marginTop: "0",
        width: "150px",
        height: "auto",
        marginBottom: "5px",
      }}
    />
  </div>

     {/* HOME PAGE */}
{page === "home" && (
  <div className="card" style={{ textAlign: "center" }}>
    <h1>Second Serving</h1>

    <p>
      Connecting surplus food with communities that need it most.
      <br />
      Reducing waste. Feeding people.
    </p>

    {/* LOGIN SECTION */}
    <div className="login-form">
      <h2 style={{ fontSize: "28px", marginTop: "10px" }}>
        Log In
      </h2>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={loginData.email}
          onChange={(e) =>
            setLoginData({
              ...loginData,
              email: e.target.value,
            })
          }
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={loginData.password}
          onChange={(e) =>
            setLoginData({
              ...loginData,
              password: e.target.value,
            })
          }
          required
        />

        <button type="submit">Log In</button>
      </form>
    </div>

    {/* SIGN UP SECTION */}
    <div style={{ marginTop: "30px" }}>
      <p style={{ fontSize: "16px", marginBottom: "10px" }}>
        Don't already have an account?
      </p>

      <button
        className="server-btn"
        onClick={() => setPage("server")}
      >
        Sign Up as a Server
      </button>

      <button
        className="receiver-btn"
        onClick={() => setPage("receiver")}
      >
        Sign Up as a Receiver
      </button>
    </div>
  </div>
)}
{/* SIGNUP PAGE */}
{page === "signup" && (
  <div className="card" style={{ textAlign: "center" }}>
    <h2>Create an Account</h2>

    <p>
      Choose how you would like to use Second Serving.
    </p>

    <button
      className="server-btn"
      onClick={() => setPage("server")}
    >
      Sign Up as Server
    </button>

    <button
      className="receiver-btn"
      onClick={() => setPage("receiver")}
    >
      Sign Up as Receiver
    </button>

    <br />

    <button
      className="secondary"
      onClick={() => setPage("home")}
    >
      Back
    </button>
  </div>
)}
        {/* SERVER FORM */}
        {page === "server" && (
          <div className="card">
            <h2>Food Donor Registration</h2>

            <form onSubmit={handleServerSubmit}>
              <select
                value={serverData.institutionType}
                onChange={(e) =>
                  setServerData({
                    ...serverData,
                    institutionType: e.target.value,
                  })
                }
                required
              >
                <option value="">Institution Type</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Grocery Store">Grocery Store</option>
                <option value="Bakery">Bakery</option>
                <option value="Hotel">Hotel</option>
                <option value="Catering">Catering Company</option>
                <option value="Other">Other</option>
              </select>

              <input
                placeholder="Organization / Restaurant Name"
                value={serverData.organizationName}
                onChange={(e) =>
                  setServerData({
                    ...serverData,
                    organizationName: e.target.value,
                  })
                }
                required
              />

              <input
  placeholder="Organization / Restaurant Name"
  value={serverData.organizationName}
  onChange={(e) =>
    setServerData({
      ...serverData,
      organizationName: e.target.value,
    })
  }
  required
/>

<label
  style={{
    display: "block",
    marginTop: "12px",
    marginBottom: "6px",
    fontSize: "16px",
    fontWeight: "600",
    color: "#333",
  }}
>
  Proof of Address (i.e. water bill, electric bill, lease agreement, or business license)
</label>

<input
  type="file"
  accept="image/*"
  onChange={(e) =>
    setServerData({
      ...serverData,
      proofOfAddress: e.target.files[0],
    })
  }
  required
/>

<textarea
  placeholder="Optional: menu, food types, donation schedule..."
                value={serverData.additionalInfo}
                onChange={(e) =>
                  setServerData({
                    ...serverData,
                    additionalInfo: e.target.value,
                  })
                }
              />

              <input
                placeholder="Contact Name"
                value={serverData.contactName}
                onChange={(e) =>
                  setServerData({
                    ...serverData,
                    contactName: e.target.value,
                  })
                }
                required
              />

              <input
                type="email"
                placeholder="Email"
                value={serverData.email}
                onChange={(e) =>
                  setServerData({
                    ...serverData,
                    email: e.target.value,
                  })
                }
                required
              />

              <input
                placeholder="Phone Number"
                value={serverData.phone}
                onChange={(e) =>
                  setServerData({
                    ...serverData,
                    phone: e.target.value,
                  })
                }
                required
              />

              <input
                placeholder="Address"
                value={serverData.address}
                onChange={(e) =>
                  setServerData({
                    ...serverData,
                    address: e.target.value,
                  })
                }
                required
              />

              <button type="submit">Submit</button>

              <button
                type="button"
                className="secondary"
                onClick={() => setPage("home")}
              >
                Back
              </button>
            </form>
          </div>
        )}

        {/* RECEIVER FORM */}
        {page === "receiver" && (
          <div className="card">
            <h2>Receiver Registration</h2>

            <form onSubmit={handleReceiverSubmit}>
              <select
                value={receiverData.institutionType}
                onChange={(e) =>
                  setReceiverData({
                    ...receiverData,
                    institutionType: e.target.value,
                  })
                }
                required
              >
                <option value="">Institution Type</option>
                <option value="NGO">NGO</option>
                <option value="Shelter">Shelter</option>
                <option value="Religious">Religious Institution</option>
                <option value="Low Income Household">Low Income Household</option>
                <option value="Houseless">Houseless Individual</option>
                <option value="Other">Other</option>
              </select>

              <input
                placeholder="Organization Name (optional)"
                value={receiverData.organizationName}
                onChange={(e) =>
                  setReceiverData({
                    ...receiverData,
                    organizationName: e.target.value,
                  })
                }
              />

              <input
                placeholder="Contact Name"
                value={receiverData.contactName}
                onChange={(e) =>
                  setReceiverData({
                    ...receiverData,
                    contactName: e.target.value,
                  })
                }
                required
              />

              <input
                placeholder="Contact Info (email or phone)"
                value={receiverData.contactInfo}
                onChange={(e) =>
                  setReceiverData({
                    ...receiverData,
                    contactInfo: e.target.value,
                  })
                }
                required
              />

              <input
                placeholder="Address / Area"
                value={receiverData.address}
                onChange={(e) =>
                  setReceiverData({
                    ...receiverData,
                    address: e.target.value,
                  })
                }
                required
              />

              <input
                type="number"
                placeholder="Mouths to Feed"
                value={receiverData.mouthsToFeed}
                onChange={(e) =>
                  setReceiverData({
                    ...receiverData,
                    mouthsToFeed: e.target.value,
                  })
                }
                required
              />

              <textarea
                placeholder="Dietary Restrictions"
                value={receiverData.dietaryRestrictions}
                onChange={(e) =>
                  setReceiverData({
                    ...receiverData,
                    dietaryRestrictions: e.target.value,
                  })
                }
              />

              <select
                value={receiverData.refrigerationAvailable}
                onChange={(e) =>
                  setReceiverData({
                    ...receiverData,
                    refrigerationAvailable: e.target.value,
                  })
                }
                required
              >
                <option value="">Refrigeration Available?</option>
                <option value="Yes">Yes</option>
                <option value="Limited">Limited</option>
                <option value="No">No</option>
              </select>

              <button type="submit">Submit</button>

              <button
                type="button"
                className="secondary"
                onClick={() => setPage("home")}
              >
                Back
              </button>
            </form>
          </div>
        )}

        {/* FOOD LISTINGS PAGE */}
{page === "foodListings" && (
  <div className="food-listings-page">

<div className="food-listings-header">

  <h1>Food Listings</h1>

  <div className="header-actions">

    <button
      className="filter-btn"
      onClick={() => setShowFilters(!showFilters)}
    >
      Filters
    </button>

    <button
      className="secondary"
      onClick={() => setPage("home")}
    >
      Back
    </button>

  </div>

</div>

{showFilters && (
  <div className="filter-panel">

 <h3>Filter Listings</h3>

<MultiSelect
  label="Diet Types"
  options={[
    "Vegetarian",
    "Vegan",
    "Halal",
    "Kosher",
    "Gluten Free",
  ]}
  selected={filters.dietTypes}
  setSelected={(values) =>
    setFilters({
      ...filters,
      dietTypes: values,
    })
  }
/>

<MultiSelect
  label="Allergens"
  options={[
    "Dairy",
    "Eggs",
    "Peanuts",
    "Tree Nuts",
    "Soy",
    "Gluten",
    "Shellfish",
  ]}
  selected={filters.allergens}
  setSelected={(values) =>
    setFilters({
      ...filters,
      allergens: values,
    })
  }
/>

<MultiSelect
  label="Quantity"
  options={[
    "1-10 Meals",
    "10-50 Meals",
    "50+ Meals",
  ]}
  selected={filters.quantities}
  setSelected={(values) =>
    setFilters({
      ...filters,
      quantities: values,
    })
  }
/>

<MultiSelect
  label="Storage Type"
  options={[
    "Refrigerated",
    "Frozen",
    "No Refrigeration",
  ]}
  selected={filters.storageTypes}
  setSelected={(values) =>
    setFilters({
      ...filters,
      storageTypes: values,
    })
  }
/>

  </div>
)}

    <div className="food-grid">

      {sampleFoodListings.map((food) => (
        <div
          key={food.id}
          className="food-card"
        >

          <div className="food-card-image">
            {food.image}
          </div>

          <h3>{food.name}</h3>

          <div className="food-detail">
            <strong>Quantity:</strong> {food.quantity}
          </div>

          <div className="food-detail">
            <strong>Donor:</strong> {food.donor}
          </div>

          <div className="food-detail">
            <strong>Location:</strong> {food.location}
          </div>

          <div className="food-detail">
            <strong>Pickup:</strong> {food.pickup}
          </div>

         <button
  onClick={() => setSelectedListing(food)}
>
  View Listing
</button>

        </div>
      ))}

    </div>
  </div>
)}
{selectedListing && (
  <div
    className="listing-modal-overlay"
    onClick={() => setSelectedListing(null)}
  >

    <div
      className="listing-modal"
      onClick={(e) => e.stopPropagation()}
    >

      <div className="listing-modal-image">
        {selectedListing.image}
      </div>

      <h2>{selectedListing.name}</h2>

      <div className="listing-detail-row">
        <strong>Quantity:</strong>
        {selectedListing.quantity}
      </div>

      <div className="listing-detail-row">
        <strong>Donor:</strong>
        {selectedListing.donor}
      </div>

      <div className="listing-detail-row">
        <strong>Location:</strong>
        {selectedListing.location}
      </div>

      <div className="listing-detail-row">
        <strong>Pickup Time:</strong>
        {selectedListing.pickup}
      </div>

      <div className="listing-detail-row">
        <strong>Diet Types:</strong>
        Vegan, Vegetarian
      </div>

      <div className="listing-detail-row">
        <strong>Allergens:</strong>
        Dairy
      </div>

      <div className="listing-detail-row">
        <strong>Storage:</strong>
        Refrigerated
      </div>

      <div className="listing-detail-row">
        <strong>Description:</strong>
        Fresh surplus food available for pickup.
      </div>

   <div className="listing-actions">

  <button
    className="claim-btn"
    onClick={() =>
      handleClaimFood(selectedListing)
    }
  >
    {claimedFood.some(
      (item) =>
        item.id === selectedListing.id
    )
      ? "✓ Added to Cart"
      : "Claim Food"}
  </button>

  <button
    className="secondary"
    onClick={() => setSelectedListing(null)}
  >
    Close
  </button>

</div>

    </div>

  </div>
)}
   {/* 404 PAGE */}
{page === "404" && (
  <div className="error-scene">

    <div className="landfill-field">

      {[
        "🍌","🍞","🥬","🍅","🥕","🥔","🍎","🥦","🥒",
        "🍌","🥬","🍞","🍅","🥦","🥕","🥔","🍎",
        "🥒","🍌","🍞","🥬","🍅","🥕","🥔","🍎",
        "🥦","🥒","🍌","🍞","🥬","🍅"
      ].map((item,index)=>(
        <span
          key={index}
          className={`food-piece food-${index}`}
        >
          {item}
        </span>
      ))}

    </div>

    <div className="error-card">

 

      <div className="error-number">

        <span>4</span>

        <div className="plate-zero">
          🍽️
        </div>

        <span>4</span>

      </div>

      <h2 className="error-title">
        This Serving Couldn't Be Found
      </h2>

      <p className="error-text">
        This page has been lost among food that never got a
        second chance; Let's get you back to helping reduce food waste and
        supporting our community.
      </p>

      <button
        className="home-btn"
        onClick={() => setPage("home")}
      >
        Return Home
      </button>
  <div>
    <img
    className="cardlogo"
      src="/second_serving_clear.png"
      alt="logo"
      style={{
        width: "75px",
        height: "auto",
         marginTop: "20px"
      }}
    />
  </div>
     

    </div>

  </div>
)}
      </div>
    </div>
  );
}