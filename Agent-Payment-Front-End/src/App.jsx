import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/DashBoard";
import Enseignants from "./pages/Enseignants";
import Bulletins from "./pages/Bulletins";
import Configuration from "./pages/Configuration";
import Agents from "./pages/Agents";
import Payments from "./pages/Payments";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayouts";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/enseignants" element={<Enseignants />} />
          <Route path="/bulletins" element={<Bulletins />} />
          <Route path="/configuration" element={<Configuration />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/payments" element={<Payments />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;