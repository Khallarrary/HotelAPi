import { useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";

const STATUS = {
  PENDENTE: "Pendente",
  CONCLUIDO: "Concluído",
};

export default function Dashboard() {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [novoQuarto, setNovoQuarto] = useState("");
  const [novoTipo, setNovoTipo] = useState("");
  const [novoStatus, setNovoStatus] = useState(STATUS.PENDENTE);
  const [novaDescricao, setNovaDescricao] = useState("");

  const apiUrl = import.meta.env.VITE_API_URL;
  const connectionRef = useRef(null);

  //SignalIr
  useEffect(() => {
    if (!apiUrl || connectionRef.current) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${apiUrl}/solicitacoesHub`)
      .withAutomaticReconnect()
      .build();

    connectionRef.current = connection;

    connection.start().catch(console.error);

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

    fetch(`${apiUrl}/api/Solicitacoes`)
      .then((res) => res.json())
      .then(setSolicitacoes)
      .catch(console.error);

    return () => {
      connection.stop();
      connectionRef.current = null;
    };
  }, [apiUrl]);

  //Ações
      const adicionarSolicitacao = async () => {
    if (!novoQuarto || !novoTipo || !novaDescricao.trim()) {
      alert("Preencha todos os campos!");
      return;
    }

    const nova = {
      quarto: Number(novoQuarto),
      tipoSolicitacao: novoTipo,
      status: novoStatus,
      descricao: novaDescricao,
    };

    await fetch(`${apiUrl}/api/Solicitacoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nova),
    });

    setShowForm(false);
    setNovoQuarto("");
    setNovoTipo("");
    setNovoStatus(STATUS.PENDENTE);
    setNovaDescricao("");
  };

  const atualizarStatus = async (id) => {
    await fetch(`${apiUrl}/api/Solicitacoes/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(STATUS.CONCLUIDO),
    });
  };

   const gerarRelatorioEZerar = async () => {
    try {
      const res = await fetch(
        `${apiUrl}/api/Solicitacoes/gerar-relatorio`,
        { method: "POST" }
      );

      if (!res.ok) throw new Error();

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `Relatorio_Solicitacoes_${new Date().toISOString()}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      setSolicitacoes([]);
    } catch {
      alert("Erro ao gerar relatório");
    }
  };

  //Render
  return (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
    <div className="max-w-7xl mx-auto">
      
      {/* Header */}
      <header className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-blue-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Sistema de Solicitações</h1>
            <p className="text-gray-500 mt-1">Gerenciamento dos hóspedes</p>
          </div>
        </div>
      </header>

      {/* Status */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-md border border-blue-100">
          <p className="text-gray-500 text-sm font-medium">Total</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{solicitacoes.length}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-md border border-amber-100">
          <p className="text-gray-500 text-sm font-medium">Pendentes</p>
          <p className="text-3xl font-bold text-amber-600 mt-2">{solicitacoes.filter(s => s.status === STATUS.PENDENTE).length}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-md border border-emerald-100">
          <p className="text-gray-500 text-sm font-medium">Concluídos</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">{solicitacoes.filter(s => s.status === STATUS.CONCLUIDO).length}</p>
        </div>
      </div>

      {/* Butoes */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Nova Solicitação
        </button>

        <button
          onClick={gerarRelatorioEZerar}
          className="bg-gradient-to-r from-slate-600 to-slate-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Gerar Relatório e Zerar
        </button>
      </div>

      {/* Listas */}
      <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-lg font-semibold text-gray-800">Solicitações</h2>
        </div>
        
        <div className="divide-y divide-gray-100">
          {solicitacoes.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">Nenhuma solicitação</p>
            </div>
          ) : (
            solicitacoes.map((sol) => (
              <div key={sol.id} className="p-5 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800">Quarto {sol.quarto}</h3>
                    <p className="text-gray-600 mt-1">{sol.descricao}</p>
                    <p className="text-sm text-gray-500 mt-2">{sol.tipoSolicitacao}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      sol.status === STATUS.PENDENTE
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {sol.status}
                    </span>
                    {sol.status === STATUS.PENDENTE && (
                      <button
                        onClick={() => atualizarStatus(sol.id)}
                        className="px-4 py-2 bg-emerald-500 text-white text-sm rounded-lg hover:bg-emerald-600 transition-colors"
                      >
                        Concluir
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold">Nova Solicitação</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número do Quarto</label>
                <input
                  type="number"
                  value={novoQuarto}
                  onChange={(e) => setNovoQuarto(e.target.value)}
                  placeholder="Ex: 101"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={novoTipo}
                  onChange={(e) => setNovoTipo(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Selecione</option>
                  <option value="Manutenção">Manutenção</option>
                  <option value="Governança">Governança</option>
                  <option value="Room Service">Room Service</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={novaDescricao}
                  onChange={(e) => setNovaDescricao(e.target.value)}
                  rows="3"
                  placeholder="Descreva..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={adicionarSolicitacao}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);
}