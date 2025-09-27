import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginHospede() {
  const [apartamento, setApartamento] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const navigate = useNavigate();

  function handleLogin(e) {
    e.preventDefault();

    if (apartamento && sobrenome) {
      // Leva o hóspede para a página de solicitações sem consulta no banco
      navigate(`/solicitacoes?apto=${apartamento}&sobrenome=${sobrenome}`);
    } else {
      alert("Informe apartamento e sobrenome!");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Acesso Hóspede</h2>
        <form onSubmit={handleLogin} className="flex flex-col">
          <input
            placeholder="Apartamento"
            value={apartamento}
            onChange={(e) => setApartamento(e.target.value)}
            className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-700"
          />
          <input
            placeholder="Sobrenome"
            value={sobrenome}
            onChange={(e) => setSobrenome(e.target.value)}
            className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-700"
          />
          <button
            type="submit"
            className="w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}