import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginFuncionario() {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  function handleLogin(e) {
    e.preventDefault();

    // Aqui você colocaria a validação real (API + banco)
    if (usuario === "admin" && senha === "123") {
      navigate("/dashboard");
    } else {
      alert("Credenciais inválidas!");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Login Funcionário</h2>
        <form onSubmit={handleLogin} className="flex flex-col">
          <input
            placeholder="Usuário"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-700"
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
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
  )
}