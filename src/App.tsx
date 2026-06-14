import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Chat from "./pages/Chat/Chat";
import Evaluation from "./pages/Evaluation/Evaluation";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/app" element={<Chat />} />
      <Route path="/app/evaluation" element={<Evaluation />} />
    </Routes>
  );
}

export default App;
