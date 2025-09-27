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

  const params = new URLSearchParams(location.search);
  const hospedeApto = params.get("apto");
  const hospedeSobrenome = params.get("sobrenome");

  useEffect(() => {
    if (!role && !hospedeApto) {
      navigate("/login");
      return;
    }

    // SignalR
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${apiUrl}/solicitacoesHub`)
      .withAutomaticReconnect()
      .build();

    connection.start().then(() => console.log("✅ Conectado ao SignalR"));

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

    // Busca inicial
    const url = hospedeApto
      ? `${apiUrl}/api/Solicitacoes/minhas?numeroApartamento=${hospedeApto}`
      : `${apiUrl}/api/Solicitacoes`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (hospedeApto && hospedeSobrenome) {
          const filtradas = data.filter(
            (s) =>
              s.quarto == hospedeApto &&
              s.sobrenome?.toLowerCase() === hospedeSobrenome.toLowerCase()
          );
          setSolicitacoes(filtradas);
        } else {
          setSolicitacoes(data);
        }
      })
      .catch((err) => console.error(err));

    return () => connection.stop();
  }, [hospedeApto, hospedeSobrenome, role, navigate]);

  const adicionarSolicitacao = async () => {
    try {
      const novaSolicitacao = {
        quarto: hospedeApto || Number(novoQuarto),
        tipoSolicitacao: novoTipo,
        status: hospedeApto ? "Pendente" : novoStatus,
        dataSolicitacao: new Date().toISOString(),
      };

      await fetch(`${apiUrl}/api/Solicitacoes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novaSolicitacao),
      });

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

      <button
        onClick={() => setShowForm(!showForm)}
        className="py-2 px-4 rounded-lg mb-4"
      >
        Adicionar Solicitação
      </button>

      {showForm && (
        <div className="form-container">
          <div className="inputs-row">
            {!hospedeApto && (
              <input
                type="number"
                placeholder="Quarto"
                value={novoQuarto}
                onChange={(e) => setNovoQuarto(e.target.value)}
              />
            )}
            <input
              type="text"
              placeholder="Tipo de Solicitação"
              value={novoTipo}
              onChange={(e) => setNovoTipo(e.target.value)}
            />
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
            <button onClick={() => setShowForm(false)}>Cancelar</button>
            <button onClick={adicionarSolicitacao}>Salvar</button>
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