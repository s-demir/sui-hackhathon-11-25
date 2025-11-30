import { Routes, Route } from "react-router-dom";
import { Navbar } from "./layout/Navbar";
import { Home } from "./pages/Home";
import { Dashboard } from "./pages/Dashboard";
import { Explore } from "./pages/Explore";
import { RatePage } from "./pages/RatePage";
import { AdminPage } from "./pages/AdminPage";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--color-background)" }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/explore" element={<Explore />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rate"
          element={
            <ProtectedRoute>
              <RatePage />
            </ProtectedRoute>
          }
        />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </div>
  );
}

export default App;