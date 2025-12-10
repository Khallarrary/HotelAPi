import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as signalR from "@microsoft/signalr";

export default function Solicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [novoQuarto, setNovoQuarto] = useState("");
  const [novoTipo, setNovoTipo] = useState("");
  const [novoStatus, setNovoStatus] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const role = localStorage.getItem("role");
  const apiUrl = import.meta.env.VITE_API_URL;

  // 🔹 Pega parâmetros do hóspede (quando logado por apto e sobrenome)
  const params = new URLSearchParams(location.search);
  const hospedeApto = params.get("apto");
  const hospedeSobrenome = params.get("sobrenome");

  useEffect(() => {
    if (!role && !hospedeApto) {
      navigate("/login");
      return;
    }

    // 1 - Conecta no SignalR
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${apiUrl}/solicitacoesHub`)
      .withAutomaticReconnect()
      .build();

    connection.start().then(() => {
      console.log("✅ Conectado ao SignalR");
    });

    // 2 - Eventos do servidor
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

    // 3 - Busca inicial
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

  // 🔹 Criar nova solicitação
  const adicionarSolicitacao = async () => {
    try {
      const novaSolicitacao = {
        quarto: hospedeApto || novoQuarto,
        tipoSolicitacao: novoTipo,
        status: hospedeApto ? "Pendente" : novoStatus,
        dataSolicitacao: new Date().toISOString(),
      };

      await fetch(`${apiUrl}/api/Solicitacoes/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novaSolicitacao),
      });

      // Não precisa chamar fetchSolicitacoes(), o SignalR vai atualizar sozinho
      setShowForm(false);
      setNovoQuarto("");
      setNovoTipo("");
      setNovoStatus("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="solicitacoes-container">
      <header>
        <h2 className="text-center mb-4 text-xl font-bold">
          {hospedeApto
            ? `Solicitações - Apto ${hospedeApto}, Sr(a). ${hospedeSobrenome}`
            : "Solicitações dos Hóspedes"}
        </h2>
      </header>

      {/* Botão de adicionar*/}
           <button
            onClick={() => setShowForm(!showForm)}
            className=" py-2 px-4 rounded-lg "
          >
            Adicionar Solicitação
          </button> 

      {showForm && (
        <div className="form-container">
          <div className="inputs-row">
            {!hospedeApto && (
              <input
                type="text"
                placeholder="Quarto"
                value={novoQuarto}
                onChange={(e) => setNovoQuarto(e.target.value)}
              />
            )}

            <div className="flex justify-center mb-4">
              <input
                type="text"
                placeholder="Tipo de Solicitação"
                value={novoTipo}
                onChange={(e) => setNovoTipo(e.target.value)}
                className="border rounded-lg py-2 px-4 w-full max-w-sm text-center"
              />
            </div>

            {!hospedeApto && (
              <input
                type="text"
                placeholder="Status"
                value={novoStatus}
                onChange={(e) => setNovoStatus(e.target.value)}
              />
            )}
          </div>

          <div className="form-buttons flex gap-4 justify-center mt-4">
            <button
              onClick={() => setShowForm(false)}
              className="py-2 px-4 rounded-lg "
            >
              Cancelar
            </button>
            <button
              onClick={adicionarSolicitacao}
              className=" py-2 px-4 rounded-lg "
            >
              Salvar
            </button>
          </div>
        </div>
      )}

      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Id</th>
            <th>Quarto</th>
            <th>Tipo de Solicitação</th>
            <th>Status</th>
            <th>Hora</th>
          </tr>
        </thead>
        <tbody>
          {solicitacoes.map((s) => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.quarto}</td>
              <td>{s.tipoSolicitacao}</td>
              <td>{s.status}</td>
              <td>{s.horaSolicitacao}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}