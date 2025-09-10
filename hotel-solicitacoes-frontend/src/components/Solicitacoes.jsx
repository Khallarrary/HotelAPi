import { useState, useEffect } from "react";

export default function Solicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [novoQuarto, setNovoQuarto] = useState("");
  const [novoTipo, setNovoTipo] = useState("");
  const [novoStatus, setNovoStatus] = useState("");

  useEffect(() => {
    fetchSolicitacoes();
  }, []);

  const fetchSolicitacoes = async () => {
    try {
      const res = await fetch("https://localhost:7161/api/Solicitacoes");
      const data = await res.json();
      setSolicitacoes(data);
    } catch (err) {
      console.error(err);
    }
  };

  const adicionarSolicitacao = async () => {
    // função de POST
     try {
      const novaSolicitacao = {
        quarto: novoQuarto,
        tipoSolicitacao: novoTipo,
        status: novoStatus,
        dataSolicitacao: new Date() // envia a hora atual
      };

      await fetch("https://localhost:7161/api/Solicitacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novaSolicitacao)
      });

      setShowForm(false);
      setNovoQuarto("");
      setNovoTipo("");
      setNovoStatus("");
      fetchSolicitacoes(); // atualiza a lista
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="solicitacoes-container">
      <header><h1>Solicitações dos Hóspedes</h1></header>

     <button onClick={() => setShowForm(!showForm)}>
        Adicionar Solicitação
      </button>

      {showForm && (
  <div className="form-container">
    <div className="inputs-row">
      <input
        type="text"
        placeholder="Quarto"
        value={novoQuarto}
        onChange={(e) => setNovoQuarto(e.target.value)}
      />
      <input
        type="text"
        placeholder="Tipo de Solicitação"
        value={novoTipo}
        onChange={(e) => setNovoTipo(e.target.value)}
      />
      <input
        type="text"
        placeholder="Status"
        value={novoStatus}
        onChange={(e) => setNovoStatus(e.target.value)}
      />
    </div>

    <div className="form-buttons">
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