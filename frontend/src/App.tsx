import { Navigate, Route, Routes } from "react-router-dom";
import { NotFoundPage } from "./pages/NotFoundPage.tsx";
import { OverviewPage } from "./pages/OverviewPage.tsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<OverviewPage />} />
      <Route path="*" element={<NotFoundPage />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
