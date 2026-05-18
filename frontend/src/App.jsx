import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import DocumentsPage from "./pages/DocumentsPage";
import ChatPage from "./pages/ChatPage";
import AdminUsagePage from "./pages/AdminUsagePage";
import RegisterPage from "./pages/RegisterPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />


        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admin/usage" element={<AdminUsagePage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/chat" element={<ChatPage />} />
        </Route>


        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;