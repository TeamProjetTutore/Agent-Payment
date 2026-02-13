import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import DashBoard from "./pages/DashBoard";
import Agents from "./pages/Agents";
import Payments from "./pages/Payments";
import Debts from "./pages/Debts";
import Reports from "./pages/Reports";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayouts";
import { UIProvider } from "./context/UIContext";

function App() {
  return (
    <UIProvider>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashBoard />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/debts" element={<Debts />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </UIProvider>
);
}

export default App;
