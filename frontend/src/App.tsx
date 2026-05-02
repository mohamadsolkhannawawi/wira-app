import { Navigate, Route, Routes } from "react-router-dom";
import { NotFoundPage } from "./pages/NotFoundPage.tsx";
import { OverviewPage } from "./pages/OverviewPage.tsx";
import { LoginPage } from "./pages/LoginPage.tsx";
import { RegisterPage } from "./pages/RegisterPage.tsx";
import { HistoryPage } from "./pages/HistoryPage.tsx";
import { ComparePage } from "./pages/ComparePage.tsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<OverviewPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/compare" element={<ComparePage />} />
      <Route path="*" element={<NotFoundPage />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
