import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as signalR from "@microsoft/signalr";

export default function Solicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [novoQuarto, setNovoQuarto] = useState("");
  const [novoTipo, setNovoTipo] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");
  const [novoStatus, setNovoStatus] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const role = localStorage.getItem("role");
  const apiUrl = import.meta.env.VITE_API_URL;

  // Pega parâmetros do hóspede (quando logado por apto e sobrenome)
  const params = new URLSearchParams(location.search);
  const hospedeApto = params.get("apto");
  const hospedeSobrenome = params.get("sobrenome");

  useEffect(() => {
    if (!role && !hospedeApto) {
      navigate("/login");
      return;
    }

    // Conecta no SignalR
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${apiUrl}/solicitacoesHub`)
      .withAutomaticReconnect()
      .build();

    connection.start().then(() => {
      console.log("✅ Conectado ao SignalR");
    });

    // Eventos do servidor
    connection.on("NovaSolicitacao", (nova) => {
      if (!hospedeApto || nova.quarto == hospedeApto) {
        setSolicitacoes((prev) => [...prev, nova]);
      }
    });

    connection.on("StatusAtualizado", (atualizada) => {
      if (!hospedeApto || atualizada.quarto == hospedeApto) {
        setSolicitacoes((prev) =>
          prev.map((s) => (s.id === atualizada.id ? atualizada : s))
        );
      }
    });

    connection.on("SolicitacaoRemovida", (id) => {
      setSolicitacoes((prev) => prev.filter((s) => s.id !== id));
    });

    //  Busca 
    fetch(`${apiUrl}/api/Solicitacoes/`)
      .then((res) => res.json())
      .then((data) => {
        if (hospedeApto && hospedeSobrenome) {
  const filtradas = data.filter(
    (s) => s.quarto == hospedeApto && s.sobrenome.toLowerCase() === hospedeSobrenome.toLowerCase()
          );
          setSolicitacoes(filtradas);
        } else {
          setSolicitacoes(data);
        }
      });

    return () => {
      connection.stop();
    };
  }, [hospedeApto, role, navigate]);

  // Criar nova solicitação
  const adicionarSolicitacao = async () => {
    try {
      const novaSolicitacao = {
        quarto: hospedeApto || novoQuarto,
        tipoSolicitacao: novoTipo,
        descricao: novaDescricao,
        status: hospedeApto ? "Pendente" : novoStatus
      };

      await fetch(`${apiUrl}/api/Solicitacoes/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novaSolicitacao),
      });

      
      setShowForm(false);
      setNovoQuarto("");
      setNovoTipo("");
      setNovoStatus("");
      setNovaDescricao("");
    } catch (err) {
      console.error(err);
    }
  };

//Render
 return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-6 md:p-8">
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-6 sm:p-8 mb-6 text-white">
        <h2 className="text-2xl sm:text-3xl font-bold text-center">
          {hospedeApto
            ? `Apto ${hospedeApto} - Sr(a). ${hospedeSobrenome}`
            : "Minhas Solicitações"}
        </h2>
        <p className="text-blue-100 text-center mt-2 text-sm sm:text-base">Solicite o que precisar</p>
      </header>

      {/* Botão Adicionar */}
      <div className="mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:shadow-lg transition-all duration-200 shadow-md flex items-center justify-center gap-3 active:scale-95"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          {showForm ? 'Fechar' : '+ Adicionar Solicitação'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6 border border-blue-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Nova Solicitação</h3>
          
          <div className="space-y-5">
            {/* Quarto (apenas admin) */}
            {!hospedeApto && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  📍 Número do Quarto
                </label>
                <input
                  type="text"
                  placeholder="Ex: 101"
                  value={novoQuarto}
                  onChange={(e) => setNovoQuarto(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-4 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                />
              </div>
            )}

            {/* Tipo de Solicitação */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                 Tipo de Solicitação
              </label>
              <select
                value={novoTipo}
                onChange={(e) => setNovoTipo(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-4 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">Selecione...</option>
                <option value="Manutenção"> Manutenção</option>
                <option value="Governança"> Governança</option>
                <option value="Room Service"> Room Service</option>
              </select>
            </div>

            {/* Descrição */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-bold text-gray-700">
                   Descrição
                </label>
                <span className="text-xs font-semibold text-gray-500">
                  {novaDescricao.length}/500
                </span>
              </div>
              <textarea
                placeholder="Descreva o que você precisa..."
                value={novaDescricao}
                onChange={(e) => setNovaDescricao(e.target.value.slice(0, 500))}
                rows="4"
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-4 text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-gray-50"
              />
            </div>

            {/* Status (apenas admin) */}
            {!hospedeApto && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  ✅ Status
                </label>
                <input
                  type="text"
                  placeholder="Ex: Pendente"
                  value={novoStatus}
                  onChange={(e) => setNovoStatus(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-4 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                />
              </div>
            )}

            {/* Botões */}
            <div className="flex flex-col gap-3 pt-4">
              <button
                onClick={adicionarSolicitacao}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all duration-200 active:scale-95"
              >
                ✓ Enviar Solicitação
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-semibold text-base hover:bg-gray-300 transition-colors duration-200 active:scale-95"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Solicitações */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">Histórico</h3>
        
        {solicitacoes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12 text-center border border-blue-100">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h4 className="text-lg font-bold text-gray-700 mb-2">Nenhuma solicitação</h4>
            <p className="text-gray-500">Você ainda não fez nenhuma solicitação</p>
          </div>
        ) : (
          <div className="space-y-3">
            {solicitacoes.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 border-l-4 border-blue-500 hover:shadow-md transition-all"
              >
                {/* Cabeçalho do Card */}
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                        #{s.id}
                      </span>
                      <span className="text-lg font-bold text-gray-900">Apto {s.quarto}</span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">📅 {s.horaSolicitacao}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-bold whitespace-nowrap ${
                      s.status === "Concluído"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {s.status === "Concluído" ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className="inline-block w-2 h-2 bg-yellow-800 rounded-full animate-pulse"></span>
                    )}
                    {s.status}
                  </span>
                </div>

                {/* Tipo */}
                <div className="mb-3">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold ${
                      s.tipoSolicitacao === "Manutenção"
                        ? "bg-orange-100 text-orange-800"
                        : s.tipoSolicitacao === "Governança"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {s.tipoSolicitacao === "Manutenção"
                      ? "🔧"
                      : s.tipoSolicitacao === "Governança"
                      ? "🧹"
                      : "🍽️"}{" "}
                    {s.tipoSolicitacao}
                  </span>
                </div>

                {/* Descrição */}
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                  {s.descricao || "-"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);
}