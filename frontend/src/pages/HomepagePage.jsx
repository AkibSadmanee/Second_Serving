import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import ListingModal from "../components/ListingModal";
import ExclusiveZone from "../components/ExclusiveZone";
import { api } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";

// ---------------------------------------------------------------------------
// Distance helper — Haversine formula, returns miles
// ---------------------------------------------------------------------------
function haversine(lat1, lng1, lat2, lng2) {
  const R = 3958.8;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ---------------------------------------------------------------------------
// 40 dummy listings — all on Oʻahu, with real-ish coordinates
// ---------------------------------------------------------------------------
function makeSampleListings() {
  const now = Date.now();
  const h = 3_600_000;
  return [
    // ── Downtown / Kakaako ──────────────────────────────────────────────────
    {
      id: "s01", name: "Bento Boxes", quantity: "30 servings",
      donor: "Zippy's Downtown", location: "820 S Hotel St, Honolulu",
      lat: 21.3069, lng: -157.8583,
      pickup_time: new Date(now + 3 * h).toISOString(),
      diet_types: [], allergens: ["Soy", "Gluten"], storage_type: "Refrigerated",
      description: "Mixed bento boxes from today's lunch service.", image_emoji: "🍱",
    },
    {
      id: "s02", name: "Acai Bowls & Smoothies", quantity: "20 servings",
      donor: "Lanikai Juice Kakaako", location: "600 Ala Moana Blvd, Honolulu",
      lat: 21.2983, lng: -157.8604,
      pickup_time: new Date(now + 1.5 * h).toISOString(),
      diet_types: ["Vegan", "Gluten Free"], allergens: ["Tree Nuts"], storage_type: "Refrigerated",
      description: "End-of-day acai bowls and smoothie bases.", image_emoji: "🫐",
    },
    {
      id: "s03", name: "Hawaiian Plate Lunches", quantity: "45 servings",
      donor: "Palama Canteen", location: "1285 N King St, Honolulu",
      lat: 21.3150, lng: -157.8650,
      pickup_time: new Date(now + 2 * h).toISOString(),
      diet_types: [], allergens: ["Soy"], storage_type: "Refrigerated",
      description: "Kalua pork, lomi salmon, and poi plates from a catering event.", image_emoji: "🍚",
    },
    {
      id: "s04", name: "Assorted Malasadas", quantity: "60 servings",
      donor: "Leonard's Bakery", location: "933 Kapahulu Ave, Honolulu",
      lat: 21.2834, lng: -157.8167,
      pickup_time: new Date(now + 0.5 * h).toISOString(),
      diet_types: ["Vegetarian"], allergens: ["Dairy", "Eggs", "Gluten"], storage_type: "No Refrigeration",
      description: "Plain and custard-filled malasadas from morning batch. Best fresh!", image_emoji: "🍩",
    },
    {
      id: "s05", name: "Chicken Katsu Plates", quantity: "25 servings",
      donor: "Rainbow Drive-In", location: "3308 Kanaina Ave, Honolulu",
      lat: 21.2826, lng: -157.8150,
      pickup_time: new Date(now + 4 * h).toISOString(),
      diet_types: [], allergens: ["Gluten", "Eggs"], storage_type: "Warm",
      description: "Chicken katsu with rice and gravy from the afternoon rush.", image_emoji: "🍗",
    },
    // ── Waikiki ─────────────────────────────────────────────────────────────
    {
      id: "s06", name: "Hotel Buffet Surplus", quantity: "80 servings",
      donor: "Waikiki Beach Marriott Kitchen", location: "2552 Kalakaua Ave, Waikiki",
      lat: 21.2755, lng: -157.8231,
      pickup_time: new Date(now + 1 * h).toISOString(),
      diet_types: ["Halal", "Vegetarian"], allergens: ["Dairy"], storage_type: "Refrigerated",
      description: "Breakfast buffet items: eggs, fruit, pastries, and more.", image_emoji: "🍳",
    },
    {
      id: "s07", name: "Sushi Platters", quantity: "18 servings",
      donor: "Arancino di Mare", location: "2552 Kalakaua Ave, Waikiki",
      lat: 21.2750, lng: -157.8240,
      pickup_time: new Date(now + 2 * h).toISOString(),
      diet_types: [], allergens: ["Shellfish", "Soy"], storage_type: "Refrigerated",
      description: "Catering sushi assortment — must be picked up cold.", image_emoji: "🍣",
    },
    // ── Kaimuki / Waialae ──────────────────────────────────────────────────
    {
      id: "s08", name: "Deli Sandwiches & Wraps", quantity: "22 servings",
      donor: "Kaimuki Superette", location: "3458 Waialae Ave, Honolulu",
      lat: 21.2849, lng: -157.8000,
      pickup_time: new Date(now + 3 * h).toISOString(),
      diet_types: ["Vegetarian"], allergens: ["Gluten", "Dairy"], storage_type: "Refrigerated",
      description: "Day's leftover deli sandwiches and grab-and-go wraps.", image_emoji: "🥙",
    },
    {
      id: "s09", name: "Salad Bar Components", quantity: "35 servings",
      donor: "Whole Foods Kahala", location: "4211 Waialae Ave, Honolulu",
      lat: 21.2790, lng: -157.7820,
      pickup_time: new Date(now + 5 * h).toISOString(),
      diet_types: ["Vegan", "Gluten Free"], allergens: [], storage_type: "Refrigerated",
      description: "Pre-portioned salad bar items: greens, toppings, and dressings.", image_emoji: "🥗",
    },
    // ── Manoa / Moiliili ───────────────────────────────────────────────────
    {
      id: "s10", name: "Vegetarian Plates", quantity: "28 servings",
      donor: "Campus Center Dining, UH Mānoa", location: "2465 Campus Rd, Honolulu",
      lat: 21.2971, lng: -157.8173,
      pickup_time: new Date(now + 2 * h).toISOString(),
      diet_types: ["Vegetarian", "Vegan"], allergens: ["Soy"], storage_type: "Warm",
      description: "Leftover vegetarian dining hall meals from the evening service.", image_emoji: "🥦",
    },
    {
      id: "s11", name: "Artisan Bread Loaves", quantity: "16 servings",
      donor: "Moiliili Bakehouse", location: "2671 S King St, Honolulu",
      lat: 21.2915, lng: -157.8282,
      pickup_time: new Date(now + 6 * h).toISOString(),
      diet_types: ["Vegan"], allergens: ["Gluten"], storage_type: "No Refrigeration",
      description: "Day-old sourdough and whole wheat loaves, still great.", image_emoji: "🍞",
    },
    {
      id: "s12", name: "Poke Bowls", quantity: "14 servings",
      donor: "Ono Seafood", location: "747 Kapahulu Ave, Honolulu",
      lat: 21.2881, lng: -157.8175,
      pickup_time: new Date(now + 1 * h).toISOString(),
      diet_types: [], allergens: ["Soy", "Shellfish"], storage_type: "Refrigerated",
      description: "Freshly prepared ahi and tako poke — cold chain required.", image_emoji: "🐟",
    },
    // ── Nuuanu / Pali ──────────────────────────────────────────────────────
    {
      id: "s13", name: "Japanese Catering Trays", quantity: "40 servings",
      donor: "Nuuanu Catering Co.", location: "45 Judd St, Honolulu",
      lat: 21.3247, lng: -157.8369,
      pickup_time: new Date(now + 4 * h).toISOString(),
      diet_types: [], allergens: ["Soy", "Gluten"], storage_type: "Refrigerated",
      description: "Teriyaki chicken, gyoza, and rice from an evening event.", image_emoji: "🥟",
    },
    // ── Kalihi / Palama ────────────────────────────────────────────────────
    {
      id: "s14", name: "Saimin & Noodle Soup", quantity: "30 servings",
      donor: "Shiro's Saimin Haven", location: "505 Dillingham Blvd, Honolulu",
      lat: 21.3367, lng: -157.8769,
      pickup_time: new Date(now + 3 * h).toISOString(),
      diet_types: [], allergens: ["Gluten", "Soy", "Shellfish"], storage_type: "Warm",
      description: "Classic saimin broth and noodles with toppings on the side.", image_emoji: "🍜",
    },
    {
      id: "s15", name: "Fresh Produce Box", quantity: "50 servings",
      donor: "Palama Market", location: "1210 Palama St, Honolulu",
      lat: 21.3200, lng: -157.8680,
      pickup_time: new Date(now + 24 * h).toISOString(),
      diet_types: ["Vegan", "Gluten Free"], allergens: [], storage_type: "Refrigerated",
      description: "Mixed local vegetables and fruits — taro, sweet potato, papaya.", image_emoji: "🥕",
    },
    {
      id: "s16", name: "Lau Lau & Poi", quantity: "20 servings",
      donor: "Helena's Hawaiian Food", location: "1240 N School St, Honolulu",
      lat: 21.3265, lng: -157.8612,
      pickup_time: new Date(now + 2 * h).toISOString(),
      diet_types: [], allergens: [], storage_type: "Warm",
      description: "Traditional Hawaiian lau lau and fresh poi. Iconic!", image_emoji: "🌿",
    },
    // ── Salt Lake / Aliamanu ───────────────────────────────────────────────
    {
      id: "s17", name: "Dinner Rolls & Pastries", quantity: "55 servings",
      donor: "Salt Lake Bakery & Café", location: "3460 Waialae Ave, Honolulu",
      lat: 21.3547, lng: -157.9192,
      pickup_time: new Date(now + 7 * h).toISOString(),
      diet_types: ["Vegetarian"], allergens: ["Dairy", "Eggs", "Gluten"], storage_type: "No Refrigeration",
      description: "Dinner rolls, croissants, and danishes from today's bake.", image_emoji: "🥐",
    },
    {
      id: "s18", name: "Korean BBQ Plates", quantity: "32 servings",
      donor: "Sorabol Restaurant", location: "805 Keeaumoku St, Honolulu",
      lat: 21.3000, lng: -157.8450,
      pickup_time: new Date(now + 3 * h).toISOString(),
      diet_types: [], allergens: ["Soy", "Gluten"], storage_type: "Warm",
      description: "Kalbi, bulgogi, and banchan from a private dining event.", image_emoji: "🥩",
    },
    // ── Aiea / Pearl City ─────────────────────────────────────────────────
    {
      id: "s19", name: "Hot Meals — Rice Bowls", quantity: "38 servings",
      donor: "Aiea Bowl Kitchen", location: "99-115 Aiea Heights Dr, Aiea",
      lat: 21.3846, lng: -157.9311,
      pickup_time: new Date(now + 2 * h).toISOString(),
      diet_types: [], allergens: ["Soy"], storage_type: "Warm",
      description: "Teriyaki and BBQ rice bowls made fresh this afternoon.", image_emoji: "🍚",
    },
    {
      id: "s20", name: "BBQ Ribs & Sides", quantity: "42 servings",
      donor: "Pearl City Grill", location: "98-020 Kamehameha Hwy, Pearl City",
      lat: 21.3972, lng: -157.9726,
      pickup_time: new Date(now + 5 * h).toISOString(),
      diet_types: [], allergens: ["Gluten"], storage_type: "Warm",
      description: "Slow-cooked ribs, coleslaw, and mac salad.", image_emoji: "🍖",
    },
    {
      id: "s21", name: "Day-Old Bread Assortment", quantity: "24 servings",
      donor: "Pearl City Bakery", location: "905 Kamehameha Hwy, Pearl City",
      lat: 21.3985, lng: -157.9710,
      pickup_time: new Date(now + 8 * h).toISOString(),
      diet_types: ["Vegan"], allergens: ["Gluten"], storage_type: "No Refrigeration",
      description: "White, wheat, and rye loaves from yesterday's bake.", image_emoji: "🍞",
    },
    // ── Waipahu ────────────────────────────────────────────────────────────
    {
      id: "s22", name: "Filipino Fiesta Trays", quantity: "60 servings",
      donor: "Waipahu Community Center", location: "94-275 Mokuola St, Waipahu",
      lat: 21.3833, lng: -158.0097,
      pickup_time: new Date(now + 6 * h).toISOString(),
      diet_types: [], allergens: ["Peanuts", "Soy"], storage_type: "Warm",
      description: "Adobo, pancit, lumpia, and rice from a community celebration.", image_emoji: "🫕",
    },
    // ── Ewa Beach / Kapolei ────────────────────────────────────────────────
    {
      id: "s23", name: "Mexican Catering Trays", quantity: "50 servings",
      donor: "Kapolei Cantina", location: "590 Farrington Hwy, Kapolei",
      lat: 21.3439, lng: -158.0512,
      pickup_time: new Date(now + 4 * h).toISOString(),
      diet_types: ["Vegetarian"], allergens: ["Dairy", "Gluten"], storage_type: "Warm",
      description: "Quesadillas, rice, beans, and salsa verde from a catering event.", image_emoji: "🌮",
    },
    {
      id: "s24", name: "Grilled Catch of the Day", quantity: "18 servings",
      donor: "Ewa Beach Grill", location: "91-1261 Renton Rd, Ewa Beach",
      lat: 21.3181, lng: -158.0059,
      pickup_time: new Date(now + 2 * h).toISOString(),
      diet_types: ["Gluten Free"], allergens: ["Shellfish"], storage_type: "Refrigerated",
      description: "Grilled mahi-mahi and ahi with rice and salad.", image_emoji: "🐠",
    },
    {
      id: "s25", name: "Resort Catering Overflow", quantity: "70 servings",
      donor: "Ko Olina Kitchen", location: "92-1185 Aliinui Dr, Kapolei",
      lat: 21.3255, lng: -158.1243,
      pickup_time: new Date(now + 1 * h).toISOString(),
      diet_types: ["Halal", "Gluten Free"], allergens: ["Dairy"], storage_type: "Refrigerated",
      description: "Upscale catering surplus: roasted meats, salads, and desserts.", image_emoji: "🥘",
    },
    // ── Mililani ──────────────────────────────────────────────────────────
    {
      id: "s26", name: "Deli Sandwiches", quantity: "20 servings",
      donor: "Mililani Town Center Café", location: "95-1249 Meheula Pkwy, Mililani",
      lat: 21.4514, lng: -158.0141,
      pickup_time: new Date(now + 6 * h).toISOString(),
      diet_types: ["Vegetarian"], allergens: ["Dairy", "Gluten"], storage_type: "Refrigerated",
      description: "Turkey, ham, and veggie deli sandwiches near closing time.", image_emoji: "🥪",
    },
    {
      id: "s27", name: "Artisan Sourdough", quantity: "12 servings",
      donor: "Mililani Mauka Bakery", location: "95-1030 Ainamakua Dr, Mililani",
      lat: 21.4627, lng: -158.0250,
      pickup_time: new Date(now + 10 * h).toISOString(),
      diet_types: ["Vegan"], allergens: ["Gluten"], storage_type: "No Refrigeration",
      description: "Freshly baked sourdough — great for large families or shelters.", image_emoji: "🥖",
    },
    // ── Kailua / Windward ─────────────────────────────────────────────────
    {
      id: "s28", name: "Pastries & Iced Coffee", quantity: "15 servings",
      donor: "Kailua Town Café", location: "315 Uluniu St, Kailua",
      lat: 21.3962, lng: -157.7392,
      pickup_time: new Date(now + 1.5 * h).toISOString(),
      diet_types: ["Vegetarian"], allergens: ["Dairy", "Eggs", "Gluten"], storage_type: "Refrigerated",
      description: "Morning pastries and batch-brewed iced coffee — closing early.", image_emoji: "☕",
    },
    {
      id: "s29", name: "Fresh Fish Plates", quantity: "22 servings",
      donor: "Kaneohe Bay Kitchen", location: "46-056 Kamehameha Hwy, Kaneohe",
      lat: 21.4161, lng: -157.8009,
      pickup_time: new Date(now + 3 * h).toISOString(),
      diet_types: ["Gluten Free"], allergens: ["Shellfish"], storage_type: "Refrigerated",
      description: "Furikake salmon and steamed white fish with rice.", image_emoji: "🐟",
    },
    {
      id: "s30", name: "Windward Farm Produce", quantity: "45 servings",
      donor: "Windward Community Market", location: "45-480 Kane Ohe Bay Dr, Kaneohe",
      lat: 21.4000, lng: -157.7900,
      pickup_time: new Date(now + 24 * h).toISOString(),
      diet_types: ["Vegan", "Gluten Free"], allergens: [], storage_type: "Refrigerated",
      description: "Organic farm produce: lettuce, herbs, banana, and breadfruit.", image_emoji: "🌿",
    },
    {
      id: "s31", name: "Gourmet Sandwiches & Salads", quantity: "16 servings",
      donor: "Kalapawai Market", location: "306 S Kalaheo Ave, Kailua",
      lat: 21.3933, lng: -157.7384,
      pickup_time: new Date(now + 2 * h).toISOString(),
      diet_types: ["Vegetarian"], allergens: ["Dairy", "Gluten"], storage_type: "Refrigerated",
      description: "Gourmet deli sandwiches and prepared salads near closing time.", image_emoji: "🥗",
    },
    // ── Hawaiʻi Kai ───────────────────────────────────────────────────────
    {
      id: "s32", name: "Seafood Platter Surplus", quantity: "20 servings",
      donor: "Hawaii Kai Grill", location: "377 Keahole St, Honolulu",
      lat: 21.2836, lng: -157.7003,
      pickup_time: new Date(now + 3 * h).toISOString(),
      diet_types: ["Gluten Free"], allergens: ["Shellfish"], storage_type: "Refrigerated",
      description: "Mixed seafood platters from a private dinner — pick up cold.", image_emoji: "🦞",
    },
    {
      id: "s33", name: "Prepared Deli Foods", quantity: "18 servings",
      donor: "Kuliouou Market", location: "149 Kailua Rd, Honolulu",
      lat: 21.2914, lng: -157.7339,
      pickup_time: new Date(now + 4 * h).toISOString(),
      diet_types: ["Vegetarian"], allergens: ["Dairy", "Eggs"], storage_type: "Refrigerated",
      description: "Prepared deli items: pasta salad, potato salad, and cold cuts.", image_emoji: "🍝",
    },
    // ── North Shore ───────────────────────────────────────────────────────
    {
      id: "s34", name: "Shrimp Plate Boxes", quantity: "24 servings",
      donor: "Giovanni's Shrimp Truck", location: "66-472 Kamehameha Hwy, Haleiwa",
      lat: 21.5987, lng: -158.0984,
      pickup_time: new Date(now + 5 * h).toISOString(),
      diet_types: ["Gluten Free"], allergens: ["Shellfish", "Dairy"], storage_type: "Warm",
      description: "Famous garlic butter shrimp over rice — leftover from closing.", image_emoji: "🍤",
    },
    {
      id: "s35", name: "BBQ Surf Plates", quantity: "30 servings",
      donor: "Sunset Beach Kitchen", location: "59-070 Kamehameha Hwy, Haleiwa",
      lat: 21.6616, lng: -158.0446,
      pickup_time: new Date(now + 2 * h).toISOString(),
      diet_types: [], allergens: ["Gluten"], storage_type: "Warm",
      description: "Grilled chicken and teriyaki beef with two scoops rice.", image_emoji: "🍖",
    },
    {
      id: "s36", name: "Açaí & Smoothie Packs", quantity: "20 servings",
      donor: "Haleiwa Joe's Café", location: "66-011 Kamehameha Hwy, Haleiwa",
      lat: 21.5928, lng: -158.1028,
      pickup_time: new Date(now + 1 * h).toISOString(),
      diet_types: ["Vegan", "Gluten Free"], allergens: ["Tree Nuts"], storage_type: "Frozen",
      description: "Frozen açaí packs and smoothie bases — kept in freezer until pickup.", image_emoji: "🫐",
    },
    // ── Wahiawa / Central ─────────────────────────────────────────────────
    {
      id: "s37", name: "Plate Lunch Surplus", quantity: "35 servings",
      donor: "Wahiawa Fresh Kitchen", location: "46 N Kamehameha Ave, Wahiawa",
      lat: 21.5025, lng: -158.0237,
      pickup_time: new Date(now + 4 * h).toISOString(),
      diet_types: [], allergens: ["Soy", "Gluten"], storage_type: "Warm",
      description: "Chicken teriyaki and shoyu pork with rice and mac salad.", image_emoji: "🍛",
    },
    {
      id: "s38", name: "Hot Cafeteria Meals", quantity: "50 servings",
      donor: "Schofield Community Canteen", location: "Schofield Barracks, Wahiawa",
      lat: 21.4894, lng: -158.0574,
      pickup_time: new Date(now + 3 * h).toISOString(),
      diet_types: ["Halal"], allergens: ["Soy"], storage_type: "Warm",
      description: "Halal-certified hot meals from the afternoon service.", image_emoji: "🍲",
    },
    // ── Waimānalo ─────────────────────────────────────────────────────────
    {
      id: "s39", name: "Organic Farm Box", quantity: "30 servings",
      donor: "Waimanalo Farm Stand", location: "41-1025 Kalanianaole Hwy, Waimanalo",
      lat: 21.3354, lng: -157.7150,
      pickup_time: new Date(now + 48 * h).toISOString(),
      diet_types: ["Vegan", "Gluten Free"], allergens: [], storage_type: "Refrigerated",
      description: "Certified organic produce: sweet potato, eggplant, peppers, and herbs.", image_emoji: "🫑",
    },
    // ── Kalihi Valley ─────────────────────────────────────────────────────
    {
      id: "s40", name: "Hawaiian Feast Trays", quantity: "55 servings",
      donor: "Kalihi Valley Kitchen", location: "2180 Kalihi St, Honolulu",
      lat: 21.3500, lng: -157.8900,
      pickup_time: new Date(now + 5 * h).toISOString(),
      diet_types: [], allergens: ["Soy"], storage_type: "Warm",
      description: "Loco moco, spam musubi, and Hawaiian sweet rolls from a catering event.", image_emoji: "🍙",
    },
  ];
}

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const IMPACT_STATS = [
  { icon: "🌱", value: "1,240 lbs", label: "food rescued" },
  { icon: "🍽️", value: "3,100",     label: "meals provided" },
  { icon: "♻️", value: "5.2 tons",  label: "CO₂ avoided" },
];

// Status chips are single-select and switch the data source instead of filtering within it
const STATUS_IDS = new Set(["available", "claimed", "expired"]);

const CHIP_GROUPS = [
  {
    label: "Status",
    chips: [
      { id: "available", label: "✅ Available", test: () => true },
      { id: "claimed",   label: "📦 Claimed",   test: () => true },
      { id: "expired",   label: "⏰ Expired",   test: () => true },
    ],
  },
  {
    label: "Pickup",
    chips: [
      { id: "today",    label: "Today",    test: (f) => {
        const d = new Date(f.pickup_time);
        if (isNaN(d)) return /today/i.test(String(f.pickup_time));
        const now = new Date();
        return d.toDateString() === now.toDateString();
      }},
      { id: "tomorrow", label: "Tomorrow", test: (f) => {
        const d = new Date(f.pickup_time);
        if (isNaN(d)) return /tomorrow/i.test(String(f.pickup_time));
        const tom = new Date(); tom.setDate(tom.getDate() + 1);
        return d.toDateString() === tom.toDateString();
      }},
    ],
  },
  {
    label: "Diet",
    chips: [
      { id: "vegan",      label: "🌱 Vegan",      test: (f) => f.diet_types?.includes("Vegan") },
      { id: "vegetarian", label: "🥕 Vegetarian",  test: (f) => f.diet_types?.includes("Vegetarian") },
      { id: "halal",      label: "☪️ Halal",       test: (f) => f.diet_types?.includes("Halal") },
      { id: "kosher",     label: "✡️ Kosher",      test: (f) => f.diet_types?.includes("Kosher") },
    ],
  },
  {
    label: "Restriction",
    chips: [
      { id: "no-dairy",     label: "No Dairy",     test: (f) => !f.allergens?.includes("Dairy") },
      { id: "no-eggs",      label: "No Eggs",       test: (f) => !f.allergens?.includes("Eggs") },
      { id: "no-peanuts",   label: "No Peanuts",    test: (f) => !f.allergens?.includes("Peanuts") },
      { id: "no-tree-nuts", label: "No Tree Nuts",  test: (f) => !f.allergens?.includes("Tree Nuts") },
      { id: "no-soy",       label: "No Soy",        test: (f) => !f.allergens?.includes("Soy") },
      { id: "no-gluten",    label: "No Gluten",     test: (f) => !f.allergens?.includes("Gluten") },
      { id: "no-shellfish", label: "No Shellfish",  test: (f) => !f.allergens?.includes("Shellfish") },
    ],
  },
  {
    label: "Storage",
    chips: [
      { id: "refrigerated", label: "❄️ Refrigerated", test: (f) => f.storage_type === "Refrigerated" },
      { id: "warm",         label: "🌡️ Warm",          test: (f) => ["No Refrigeration", "Warm"].includes(f.storage_type) },
      { id: "frozen",       label: "🧊 Frozen",        test: (f) => f.storage_type === "Frozen" },
    ],
  },
];

const ALL_CHIPS = CHIP_GROUPS.flatMap((g) => g.chips);

function urgencyBadge(pickupTime) {
  if (!pickupTime) return null;
  const d   = new Date(pickupTime);
  const str = String(pickupTime).toLowerCase();

  if (isNaN(d.getTime())) {
    if (str.includes("today"))    return { text: `⏰ ${pickupTime}`, color: "#E65100", bg: "#FFF3E0" };
    if (str.includes("tomorrow")) return { text: `📅 ${pickupTime}`, color: "#1565c0", bg: "#E3F2FD" };
    return { text: `📅 ${pickupTime}`, color: "#666", bg: "#f5f5f5" };
  }

  const diffMs = d - Date.now();
  const diffH  = diffMs / 3_600_000;
  const diffM  = diffMs /    60_000;

  if (diffMs < 0)  return { text: "Expired",                                color: "#c62828", bg: "#FFEBEE" };
  if (diffH < 1)   return { text: `🔴 Expires in ${Math.round(diffM)} min`, color: "#c62828", bg: "#FFEBEE" };
  if (diffH < 3)   return { text: `🟠 Pickup in ${Math.round(diffH)} hrs`,  color: "#E65100", bg: "#FFF3E0" };
  if (diffH < 24)  return { text: "🟢 Pickup today",                        color: "#2E7D32", bg: "#E8F5E9" };
  return { text: `📅 ${d.toLocaleDateString()}`, color: "#1565c0", bg: "#E3F2FD" };
}

function ctaProps(pickupTime) {
  if (!pickupTime) return { label: "Reserve Pickup", style: {} };
  const d = new Date(pickupTime);
  if (isNaN(d.getTime())) return { label: "Reserve Pickup", style: {} };

  const diffMs = d - Date.now();
  const diffH  = diffMs / 3_600_000;
  const diffM  = diffMs /    60_000;

  if (diffMs < 0) return {
    label: "Expired",
    style: { background: "#9e9e9e", cursor: "not-allowed", opacity: 0.7 },
    disabled: true,
  };
  if (diffH < 1) return {
    label: `⚡ Claim Now — ${Math.round(diffM)} min left!`,
    style: { background: "#c62828", animation: "pulse 1.4s ease-in-out infinite" },
  };
  if (diffH < 3) return {
    label: "🔥 Reserve Before It's Gone",
    style: { background: "#E65100" },
  };
  if (diffH < 24) return {
    label: "Reserve Pickup",
    style: {},
  };
  return {
    label: "Reserve Pickup",
    style: { background: "#1565c0" },
  };
}

// Default to Honolulu civic center if geolocation is unavailable
const HONOLULU_DEFAULT = { lat: 21.3069, lng: -157.8583 };

export default function HomepagePage() {
  const navigate   = useNavigate();
  const { user }   = useAuth();

  const [listings, setListings]        = useState([]);
  const [claims,   setClaims]          = useState([]);
  const [expired,  setExpired]         = useState([]);
  const [selectedListing, setSelected] = useState(null);
  const [claimedIds, setClaimedIds]    = useState(new Set());
  const [zoneClaim,  setZoneClaim]     = useState(null);
  const [zoneIds,    setZoneIds]       = useState(new Set());
  const [error,    setError]           = useState("");
  const [loading,  setLoading]         = useState(false);

  const [searchQuery,   setSearchQuery]   = useState("");
  const [activeChips,   setActiveChips]   = useState(new Set());
  const [distanceMiles, setDistanceMiles] = useState("");
  const [openCategory,  setOpenCategory]  = useState(null);
  const [viewMode,      setViewMode]      = useState("cards");

  // User's current position for distance filtering
  const [userLocation,   setUserLocation]   = useState(HONOLULU_DEFAULT);
  const [usingGps,       setUsingGps]       = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setUsingGps(true);
      },
      () => { /* permission denied or unavailable — keep default */ },
      { timeout: 6000 }
    );
  }, []);

  useEffect(() => {
    setLoading(true);
    api.get("/api/donations")
      .then(setListings)
      .catch(() => setListings(makeSampleListings()))
      .finally(() => setLoading(false));
    api.get("/api/claims").then(setClaims).catch(() => {});
    api.get("/api/donations/expired").then(setExpired).catch(() => {});
  }, []);

  const activeStatus = useMemo(
    () => [...activeChips].find((id) => STATUS_IDS.has(id)) ?? "available",
    [activeChips]
  );

  const filtered = useMemo(() => {
    const base =
      activeStatus === "claimed"  ? claims  :
      activeStatus === "expired"  ? expired :
      listings;

    // Hide claimed and exclusive-zone items from the available view
    let result = activeStatus === "available"
      ? base.filter((f) => !claimedIds.has(f.id) && !zoneIds.has(f.id))
      : base;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.name?.toLowerCase().includes(q) ||
          f.donor?.toLowerCase().includes(q) ||
          f.location?.toLowerCase().includes(q)
      );
    }

    // Non-status chip filters
    const nonStatusChips = [...activeChips].filter((id) => !STATUS_IDS.has(id));
    if (nonStatusChips.length > 0) {
      result = result.filter((f) =>
        nonStatusChips.every((id) => ALL_CHIPS.find((c) => c.id === id)?.test(f) ?? true)
      );
    }

    // Distance filter — only applies if the listing has coordinates
    const maxMi = parseFloat(distanceMiles);
    if (!isNaN(maxMi) && maxMi > 0) {
      result = result.filter((f) => {
        if (f.lat == null || f.lng == null) return true; // pass through if no coords
        return haversine(userLocation.lat, userLocation.lng, f.lat, f.lng) <= maxMi;
      });
    }

    return result;
  }, [listings, claims, expired, claimedIds, zoneIds, searchQuery, activeChips, activeStatus, distanceMiles, userLocation]);

  const activeDonors = useMemo(
    () => new Set(listings.map((f) => f.donor).filter(Boolean)).size,
    [listings]
  );

  const toggleChip = (id) =>
    setActiveChips((prev) => {
      const next = new Set(prev);
      if (STATUS_IDS.has(id)) {
        STATUS_IDS.forEach((s) => next.delete(s));
        if (!prev.has(id)) next.add(id);
      } else {
        next.has(id) ? next.delete(id) : next.add(id);
      }
      return next;
    });

  const toggleCategory = (label) =>
    setOpenCategory((prev) => (prev === label ? null : label));

  const handleClaim = async (food) => {
    setError("");
    try {
      await api.post(`/api/donations/${food.id}/claim`, {});
    } catch {
      // API unavailable (demo data) — continue to show countdown anyway
    }
    setClaimedIds((prev) => new Set([...prev, food.id]));
    setZoneClaim(food);
    setSelected(null);
  };

  const clearAllFilters = () => {
    setActiveChips(new Set());
    setDistanceMiles("");
  };

  const anyFiltersActive = activeChips.size > 0 || distanceMiles;

  const welcomeSub = listings.length > 0
    ? `${listings.length} donation${listings.length !== 1 ? "s" : ""} available nearby`
    : undefined;

  return (
    <div className="app">
      <div className="listings-shell">
        <Header welcomeSub={welcomeSub} />

        {/* ── Exclusive zone ── */}
        <ExclusiveZone
          donations={listings}
          onReserve={handleClaim}
          externalClaim={zoneClaim}
          onUnclaim={(food) => {
            setZoneClaim(null);
            setClaimedIds((prev) => { const next = new Set(prev); next.delete(food.id); return next; });
          }}
          onPairChange={setZoneIds}
        />

        {/* ── Impact bar ── */}
        <div className="impact-bar">
          {IMPACT_STATS.map(({ icon, value, label }) => (
            <div key={label} className="impact-stat">
              <span className="impact-icon">{icon}</span>
              <span className="impact-value">{value}</span>
              <span className="impact-label">{label}</span>
            </div>
          ))}
        </div>

        {/* ── Metric cards ── */}
        <div className="metrics-row">
          <div className="metric-card" style={{ borderTop: "3px solid #2E7D32" }}>
            <span className="metric-num">{listings.length}</span>
            <span className="metric-lbl">Available Donations</span>
          </div>
          <div className="metric-card" style={{ borderTop: "3px solid #FFB300" }}>
            <span className="metric-num">{claims.length}</span>
            <span className="metric-lbl">My Claims</span>
          </div>
          <div className="metric-card" style={{ borderTop: "3px solid #66BB6A" }}>
            <span className="metric-num">1,240</span>
            <span className="metric-lbl">Lbs Food Saved</span>
          </div>
          <div className="metric-card" style={{ borderTop: "3px solid #42A5F5" }}>
            <span className="metric-num">{activeDonors}</span>
            <span className="metric-lbl">Active Donors</span>
          </div>
        </div>

        {error && (
          <p style={{ color: "#c62828", fontSize: 14, marginBottom: 12 }}>{error}</p>
        )}

        {/* ── Search ── */}
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search food, donor, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery("")}>✕</button>
          )}
        </div>

        {/* ── Filter accordion ── */}
        <div className="filter-accordion">
          {/* Category selector row */}
          <div className="filter-categories">
            {CHIP_GROUPS.map(({ label, chips }) => {
              const activeCount = chips.filter((c) => activeChips.has(c.id)).length;
              return (
                <button
                  key={label}
                  className={`filter-cat-chip${openCategory === label ? " open" : ""}${activeCount > 0 ? " has-active" : ""}`}
                  onClick={() => toggleCategory(label)}
                >
                  {label}
                  {activeCount > 0 && <span className="filter-cat-count">{activeCount}</span>}
                  <span className="filter-cat-arrow">{openCategory === label ? "▴" : "▾"}</span>
                </button>
              );
            })}
            <button
              className={`filter-cat-chip${openCategory === "Distance" ? " open" : ""}${distanceMiles ? " has-active" : ""}`}
              onClick={() => toggleCategory("Distance")}
            >
              Distance
              {distanceMiles && <span className="filter-cat-count">1</span>}
              <span className="filter-cat-arrow">{openCategory === "Distance" ? "▴" : "▾"}</span>
            </button>

            {/* View toggle */}
            <div className="view-toggle" style={{ marginLeft: "auto" }}>
              <button
                className={`view-btn${viewMode === "table" ? " active" : ""}`}
                onClick={() => setViewMode("table")}
              >
                ☰ List
              </button>
              <button
                className={`view-btn${viewMode === "cards" ? " active" : ""}`}
                onClick={() => setViewMode("cards")}
              >
                ⊞ Grid
              </button>
            </div>
          </div>

          {/* Expanded chip panel */}
          {openCategory && openCategory !== "Distance" && (
            <div className="filter-cat-panel">
              {CHIP_GROUPS.find((g) => g.label === openCategory)?.chips.map(({ id, label: chipLabel }) => (
                <button
                  key={id}
                  className={`chip${activeChips.has(id) ? " active" : ""}`}
                  onClick={() => toggleChip(id)}
                >
                  {chipLabel}
                </button>
              ))}
            </div>
          )}

          {openCategory === "Distance" && (
            <div className="filter-cat-panel" style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              <label className={`distance-chip${distanceMiles ? " active" : ""}`}>
                <span>📍 Within</span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  placeholder="—"
                  value={distanceMiles}
                  onChange={(e) => setDistanceMiles(e.target.value)}
                />
                <span>miles</span>
              </label>
              <span style={{ fontSize: "12px", color: "#888" }}>
                {usingGps ? "📡 Using your GPS location" : "📍 Using Honolulu as reference (GPS not available)"}
              </span>
            </div>
          )}

          {/* Active filter tags */}
          {anyFiltersActive && (
            <div className="active-filters">
              {[...activeChips].map((id) => {
                const chip = ALL_CHIPS.find((c) => c.id === id);
                return chip ? (
                  <button key={id} className="active-filter-tag" onClick={() => toggleChip(id)}>
                    {chip.label} ✕
                  </button>
                ) : null;
              })}
              {distanceMiles && (
                <button className="active-filter-tag" onClick={() => setDistanceMiles("")}>
                  Within {distanceMiles} mi ✕
                </button>
              )}
              <button className="chip chip-clear" onClick={clearAllFilters}>
                Clear all ✕
              </button>
            </div>
          )}
        </div>

        {/* ── Result count ── */}
        <div className="listings-toolbar">
          <span className="listings-count">
            {filtered.length} listing{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div className="empty-state"><p>Loading…</p></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><p>No food listings match your search or filters.</p></div>
        ) : viewMode === "table" ? (

          /* Table view */
          <div className="food-table-container">
            <table className="food-table">
              <thead>
                <tr>
                  <th>Food</th>
                  <th>Quantity</th>
                  <th>Donor</th>
                  <th>Location</th>
                  <th>Pickup</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((food) => {
                  const badge = urgencyBadge(food.pickup_time);
                  return (
                    <tr key={food.id}>
                      <td style={{ fontWeight: 500 }}>{food.image_emoji && <span style={{ marginRight: 6 }}>{food.image_emoji}</span>}{food.name}</td>
                      <td>{food.quantity}</td>
                      <td>{food.donor}</td>
                      <td>{food.location}</td>
                      <td>
                        {badge
                          ? <span className="urgency-badge" style={{ color: badge.color, background: badge.bg }}>{badge.text}</span>
                          : food.pickup_time}
                      </td>
                      <td>
                        {(() => { const cta = ctaProps(food.pickup_time); return (
                          <button className="reserve-btn" style={cta.style} disabled={cta.disabled} onClick={() => !cta.disabled && setSelected(food)}>
                            {cta.label}
                          </button>
                        ); })()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        ) : (

          /* Card view */
          <div className="food-grid-v2">
            {filtered.map((food) => {
              const badge = urgencyBadge(food.pickup_time);
              return (
                <div key={food.id} className="food-card-v2">
                  {food.image_emoji && (
                    <div style={{ fontSize: "32px", marginBottom: "8px" }}>{food.image_emoji}</div>
                  )}
                  <div className="food-card-v2-name">{food.name}</div>
                  <div className="food-card-v2-qty">{food.quantity}</div>
                  <div className="food-card-v2-meta">
                    <span>📍 {food.location}</span>
                    <span>🏢 {food.donor}</span>
                    {badge && (
                      <span className="urgency-badge" style={{ color: badge.color, background: badge.bg }}>
                        {badge.text}
                      </span>
                    )}
                  </div>
                  {(() => { const cta = ctaProps(food.pickup_time); return (
                    <button className="reserve-btn" style={cta.style} disabled={cta.disabled} onClick={() => !cta.disabled && setSelected(food)}>
                      {cta.label}
                    </button>
                  ); })()}
                </div>
              );
            })}
          </div>
        )}

        {selectedListing && (
          <ListingModal
            food={selectedListing}
            isClaimed={claimedIds.has(selectedListing.id)}
            onClaim={handleClaim}
            onClose={() => setSelected(null)}
          />
        )}
      </div>
    </div>
  );
}
