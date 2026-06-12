import MultiSelect from "./MultiSelect";

const DIET_TYPES = ["Vegetarian", "Vegan", "Halal", "Kosher", "Gluten Free"];
const ALLERGENS  = ["Dairy", "Eggs", "Peanuts", "Tree Nuts", "Soy", "Gluten", "Shellfish"];
const QUANTITIES = ["1–10 Meals", "10–50 Meals", "50+ Meals"];
const STORAGE    = ["Refrigerated", "Frozen", "No Refrigeration"];
const EMPTY      = { dietTypes: [], allergens: [], quantities: [], storageTypes: [] };

export default function FilterPanel({ filters, setFilters, onClose }) {
  const update = (key) => (values) => setFilters((prev) => ({ ...prev, [key]: values }));

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3>Filter Listings</h3>
        <button className="filter-close" onClick={onClose}>✕</button>
      </div>
      <div className="filter-actions">
        <button className="secondary" onClick={() => setFilters(EMPTY)}>Clear Filters</button>
      </div>
      <MultiSelect label="Diet Types"   options={DIET_TYPES} selected={filters.dietTypes}    setSelected={update("dietTypes")} />
      <MultiSelect label="Allergens"    options={ALLERGENS}  selected={filters.allergens}    setSelected={update("allergens")} />
      <MultiSelect label="Quantity"     options={QUANTITIES} selected={filters.quantities}   setSelected={update("quantities")} />
      <MultiSelect label="Storage Type" options={STORAGE}    selected={filters.storageTypes} setSelected={update("storageTypes")} />
    </div>
  );
}
