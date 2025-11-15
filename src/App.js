import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import LoginScreen from "./components/LoginScreen";
import Dashboard from "./screens/Dashboard";
import Simulator from "./screens/Simulator";
import AIAdvisor from "./screens/AIAdvisor";
import Subscription from "./screens/Subscription";
import Profile from "./screens/Profile";
import WalletPage from "./screens/Wallet";
import DataEntry from "./screens/DataEntry";
import Navbar from "./Navbar";
import ChatBubble from "./components/ChatBubble";
import { FinancialDataProvider } from "./contexts/FinancialDataContext";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const user = useState(() => {
    return localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user"))
      : null;
  })[0];

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Main App Layout
const AppLayout = () => {
  const location = useLocation();
  const [animateCards, setAnimateCards] = useState(false);

  useEffect(() => {
    if (location.pathname === "/dashboard") {
      setTimeout(() => setAnimateCards(true), 300);
    }
  }, [location.pathname]);

  const showNavbar = location.pathname !== "/login";
  const showChat = location.pathname !== "/login";

  return (
    <FinancialDataProvider>
      <div className="min-h-screen bg-gray-50">
        {showNavbar && <Navbar />}
        {showChat && <ChatBubble />}
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard animateCards={animateCards} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/data-entry"
            element={
              <ProtectedRoute>
                <DataEntry />
              </ProtectedRoute>
            }
          />
          <Route
            path="/simulator"
            element={
              <ProtectedRoute>
                <Simulator />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai"
            element={
              <ProtectedRoute>
                <AIAdvisor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscription"
            element={
              <ProtectedRoute>
                <Subscription />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wallet"
            element={
              <ProtectedRoute>
                <WalletPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </FinancialDataProvider>
  );
};

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
