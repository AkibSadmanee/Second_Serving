import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Footer from "./components/Footer";

import LandingPage                from "./pages/LandingPage";
import RegistrationPage           from "./pages/RegistrationPage";
import RestaurantRegistrationPage from "./pages/RestaurantRegistrationPage";
import ReceiverRegistrationPage   from "./pages/ReceiverRegistrationPage";
import RegistrationCompletePage   from "./pages/RegistrationCompletePage";
import ForgotPasswordPage         from "./pages/ForgotPasswordPage";
import HomepagePage               from "./pages/HomepagePage";
import ContributorDashboardPage   from "./pages/ContributorDashboardPage";
import ClaimedFoodsPage           from "./pages/ClaimedFoodsPage";
import ExpiredFoodsPage           from "./pages/ExpiredFoodsPage";
import EditProfilePage            from "./pages/EditProfilePage";
import MakePostPage               from "./pages/MakePostPage";
import DonationDetailPage         from "./pages/DonationDetailPage";
import ErrorPage                  from "./pages/ErrorPage";
import ProtectedRoute             from "./components/ProtectedRoute";

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="app" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
    <Routes>
      {/* Public routes */}
      <Route path="/"                          element={<LandingPage />} />
      <Route path="/Login"                     element={<LandingPage />} />
      <Route path="/Registration"              element={<RegistrationPage />} />
      <Route path="/Registration/restaurant"   element={<RestaurantRegistrationPage />} />
      <Route path="/Registration/receiver"     element={<ReceiverRegistrationPage />} />
      <Route path="/Registration/complete"     element={<RegistrationCompletePage />} />
      <Route path="/ForgotPassword"            element={<ForgotPasswordPage />} />
      <Route path="/Error"                     element={<ErrorPage />} />

      {/* Protected routes */}
      <Route path="/Dashboard"                 element={<ProtectedRoute><ContributorDashboardPage /></ProtectedRoute>} />
      <Route path="/Homepage"                  element={<ProtectedRoute><HomepagePage /></ProtectedRoute>} />
      <Route path="/Homepage/ClaimedFoods"     element={<ProtectedRoute><ClaimedFoodsPage /></ProtectedRoute>} />
      <Route path="/Homepage/Donation/:id"     element={<ProtectedRoute><DonationDetailPage /></ProtectedRoute>} />
      <Route path="/ClaimedFoods"              element={<ProtectedRoute><ClaimedFoodsPage /></ProtectedRoute>} />
      <Route path="/ExpiredFoods"              element={<ProtectedRoute><ExpiredFoodsPage /></ProtectedRoute>} />
      <Route path="/EditProfile"               element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
      <Route path="/MakePost"                  element={<ProtectedRoute><MakePostPage /></ProtectedRoute>} />
      <Route path="/Donation/:id"              element={<ProtectedRoute><DonationDetailPage /></ProtectedRoute>} />

      {/* Catch-all → 404 */}
      <Route path="*" element={<ErrorPage />} />
    </Routes>
    <Footer />
    </div>
  );
}
