import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BacksoundPlayer from "./components/BacksoundPlayer";
import Home from "./pages/Home";
import Edukasi from "./pages/Edukasi";
import ArtikelDetail from "./pages/ArtikelDetail";
import Chatbot from "./pages/Chatbot";
import Tentang from "./pages/Tentang";
import Archive from "./pages/Archive";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Journal from "./pages/Journal";
import Highlights from "./pages/Highlights";
import ChatHistory from "./pages/ChatHistory";
import Faskes from "./pages/Faskes";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import { useAuth } from "./context/AuthContext";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return children;
}

// Layout halaman publik — ada Navbar & Footer
function PublicLayout() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/"            element={<Home />} />
          <Route path="/edukasi"     element={<Edukasi />} />
          <Route path="/artikel/:id" element={<ArtikelDetail />} />
          <Route path="/edukasi/:id" element={<ArtikelDetail />} />
          <Route path="/tentang"     element={<Tentang />} />
          <Route path="/chatbot"     element={<Chatbot />} />
          <Route path="/archive"     element={<Archive />} />
          <Route path="/login"       element={<Login />} />
        </Routes>
      </main>
      <Footer />
      <BacksoundPlayer />
    </div>
  );
}

// Layout halaman user — TIDAK ada Navbar/Footer, pakai DashboardShell sendiri
function UserLayout() {
  return (
    <Routes>
      <Route path="/profil"     element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/jurnal"     element={<ProtectedRoute><Journal /></ProtectedRoute>} />
      <Route path="/highlights" element={<ProtectedRoute><Highlights /></ProtectedRoute>} />
      <Route path="/riwayat"    element={<ProtectedRoute><ChatHistory /></ProtectedRoute>} />
      <Route path="/faskes"     element={<ProtectedRoute><Faskes /></ProtectedRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Admin */}
          <Route path="/superadmin"           element={<AdminLogin />} />
          <Route path="/superadmin/dashboard" element={<AdminDashboard />} />

          {/* User dashboard (no navbar) */}
          <Route path="/profil"     element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/jurnal"     element={<ProtectedRoute><Journal /></ProtectedRoute>} />
          <Route path="/highlights" element={<ProtectedRoute><Highlights /></ProtectedRoute>} />
          <Route path="/riwayat"    element={<ProtectedRoute><ChatHistory /></ProtectedRoute>} />
          <Route path="/faskes"     element={<ProtectedRoute><Faskes /></ProtectedRoute>} />

          {/* Public (with navbar) */}
          <Route path="/*" element={<PublicLayout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
