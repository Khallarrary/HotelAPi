import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginFuncionario from "./components/Login/LoginFuncionario";
import LoginHospede from "./components/Login/LoginHospede";
import Solicitacoes from "./components/Solicitacoes";
import Dashboard from "./components/Dashboard"; 


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginFuncionario />} />
        <Route path="/hospede" element={<LoginHospede />} />
        <Route path="/solicitacoes" element={<Solicitacoes />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}