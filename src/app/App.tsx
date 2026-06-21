import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home/Home";
import Chat from "@/pages/Chat/Chat";
import Evaluation from "@/pages/Evaluation/Evaluation";
import { useKeepAlive } from "@/shared/hooks/useKeepAlive";

function App() {
  // Keep the free-tier backend warm while the app is open.
  useKeepAlive();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/app" element={<Chat />} />
      <Route path="/app/evaluation" element={<Evaluation />} />
    </Routes>
  );
}

export default App;
