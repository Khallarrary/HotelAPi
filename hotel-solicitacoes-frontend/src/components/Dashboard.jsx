import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";

export default function Dashboard() {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [novoQuarto, setNovoQuarto] = useState("");
  const [novoTipo, setNovoTipo] = useState("");
  const [novoStatus, setNovoStatus] = useState("");

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    // Conexão com SignalR
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${apiUrl}/solicitacoesHub`)
      .withAutomaticReconnect()
      .build();

    connection
      .start()
      .then(() => console.log("✅ Conectado ao SignalR (Dashboard)"))
      .catch((err) => console.error("Erro SignalR:", err));

    connection.on("NovaSolicitacao", (nova) => {
      setSolicitacoes((prev) => [...prev, nova]);
    });

    connection.on("StatusAtualizado", (atualizada) => {
      setSolicitacoes((prev) =>
        prev.map((s) => (s.id === atualizada.id ? atualizada : s))
      );
    });

    connection.on("SolicitacaoRemovida", (id) => {
      setSolicitacoes((prev) => prev.filter((s) => s.id !== id));
    });

    // Busca inicial de todas as solicitações
    fetch(`${apiUrl}/api/Solicitacoes`)
      .then((res) => res.json())
      .then((data) => setSolicitacoes(data))
      .catch((err) => console.error(err));

    return () => connection.stop();
  }, []);

  const atualizarStatus = async (id, status) => {
    try {
      const response = await fetch(`${apiUrl}/api/Solicitacoes/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(status),
      });
      if (!response.ok) throw new Error("Erro ao atualizar status");
    } catch (err) {
      console.error(err);
    }
  };

  const adicionarSolicitacao = async () => {
    if (!novoQuarto || !novoTipo || !novoStatus) {
      alert("Preencha todos os campos!");
      return;
    }

    try {
      const nova = {
        quarto: Number(novoQuarto),
        tipoSolicitacao: novoTipo,
        status: novoStatus,
        dataSolicitacao: new Date().toISOString(),
      };

      const response = await fetch(`${apiUrl}/api/Solicitacoes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nova),
      });

      if (!response.ok) throw new Error("Erro ao salvar solicitação");

      setShowForm(false);
      setNovoQuarto("");
      setNovoTipo("");
      setNovoStatus("");
    } catch (err) {
      console.error(err);
      alert("Ocorreu um erro ao salvar a solicitação.");
    }
  };

  const gerarRelatorioEZerar = async () => {
    try {
      const response = await fetch(
        `${apiUrl}/api/Solicitacoes/gerar-relatorio-e-zerar`,
        { method: "POST" }
      );

      if (!response.ok) throw new Error("Erro ao gerar relatório");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Relatorio_Solicitacoes_${new Date().toISOString()}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      setSolicitacoes([]);
    } catch (err) {
      console.error(err);
      alert("Ocorreu um erro ao gerar o relatório.");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-4">
        Solicitações dos Hóspedes
      </h2>

      <button
        className="bg-yellow-600 text-white py-2 px-4 rounded-lg mb-4 mx-auto block hover:bg-yellow-700 transition"
        onClick={() => setShowForm(!showForm)}
      >
        Adicionar Solicitação
      </button>

      <button
        className="bg-red-600 text-white py-2 px-4 rounded-lg mb-4 mx-auto block hover:bg-red-700 transition"
        onClick={gerarRelatorioEZerar}
      >
        Gerar Relatório e Zerar
      </button>

      {showForm && (
        <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-md mx-auto mb-4">
          <input
            type="number"
            placeholder="Quarto"
            value={novoQuarto}
            onChange={(e) => setNovoQuarto(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 text-center font-bold focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          <input
            type="text"
            placeholder="Tipo de Solicitação"
            value={novoTipo}
            onChange={(e) => setNovoTipo(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 text-center font-bold focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          <input
            type="text"
            placeholder="Status"
            value={novoStatus}
            onChange={(e) => setNovoStatus(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 text-center font-bold focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />

          <div className="flex justify-between">
            <button
              className="bg-gray-300 px-4 py-2 rounded-lg text-white hover:bg-gray-400 transition"
              onClick={() => setShowForm(false)}
            >
              Cancelar
            </button>
            <button
              className="bg-yellow-600 px-4 py-2 rounded-lg text-white hover:bg-yellow-700 transition"
              onClick={adicionarSolicitacao}
            >
              Salvar
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="table-auto w-full border border-gray-300 text-center">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">Quarto</th>
              <th className="border px-4 py-2">Tipo</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Hora</th>
              <th className="border px-4 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {solicitacoes.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{s.id}</td>
                <td className="border px-4 py-2">{s.quarto}</td>
                <td className="border px-4 py-2">{s.tipoSolicitacao}</td>
                <td
                  className={`border px-4 py-2 font-bold ${
                    s.status === "Concluído" ? "text-yellow-500" : ""
                  }`}
                >
                  {s.status}
                </td>
                <td className="border px-4 py-2">{s.horaSolicitacao}</td>
                <td className="border px-4 py-2">
                  <button
                    className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition"
                    onClick={() => atualizarStatus(s.id, "Concluído")}
                  >
                    Concluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}