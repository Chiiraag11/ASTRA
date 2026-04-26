import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import LandingPage from "./pages/LandingPage";
import ScanSelection from "./pages/ScanSelection";
import ScanResults from "./pages/ScanResults";
import FinalVerdict from "./pages/FinalVerdict";
import { ScanProvider } from "./context/ScanContext";
import SignIn from "./pages/signin";   // ⬅️ make sure file name matches
import SignUp from "./pages/signup";   // ⬅️ same here
import { AuthProvider } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <ScanProvider>
        <Router>
          <AnimatePresence mode="wait">
            <motion.div
              className="min-h-screen bg-gradient-to-br from-gray-900 to-slate-800"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/scan-selection" element={<ScanSelection />} />
                <Route path="/scan-results" element={<ScanResults />} />
                <Route path="/final-verdict" element={<FinalVerdict />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
              </Routes>
            </motion.div>
          </AnimatePresence>
        </Router>
      </ScanProvider>
    </AuthProvider>
  );
}

export default App;
