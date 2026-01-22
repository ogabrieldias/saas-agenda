  import { useState, useEffect } from "react";
  import { useNavigate } from "react-router-dom";
  import { useParams, useLocation } from "react-router-dom";
  import { auth, db } from "../firebase";
  import { onAuthStateChanged } from "firebase/auth";
  import {
    doc,
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    getDoc
  } from "firebase/firestore";

  export default function Agendamento() {
    const [agendamentos, setAgendamentos] = useState([]);
    const [titulo, setTitulo] = useState("");
    const [data, setData] = useState("");
    const [hora, setHora] = useState("");
    const [clienteId, setClienteId] = useState("");
    const [profissionalId, setProfissionalId] = useState("");
    const [servicoId, setServicoId] = useState("");
    const [status, setStatus] = useState("pendente");
    const [clientes, setClientes] = useState([]);
    const [profissionais, setProfissionais] = useState([]);
    const [servicos, setServicos] = useState([]);
    const [editId, setEditId] = useState(null);
    const [userUid, setUserUid] = useState(null);
    const [editando, setEditando] = useState(null);
    const navigate = useNavigate();

    const { id } = useParams();
    const { state } = useLocation();
    // Se você estiver navegando a partir de múltiplos admins no calendário, pode vir adminId no state
    const adminIdFromState = state?.adminId || null;

    // 🔎 Recupera usuário logado e carrega dados das subcoleções
    useEffect(() => {
      const unsub = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setUserUid(user.uid);
          const baseUserId = adminIdFromState || user.uid; // usa adminId do evento se vier do calendário multi-admin
          const userDoc = doc(db, "usuarios", baseUserId);

          const clientesSnap = await getDocs(collection(userDoc, "clientes"));
          setClientes(clientesSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

          const profSnap = await getDocs(collection(userDoc, "profissionais"));
          setProfissionais(profSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

          const servSnap = await getDocs(collection(userDoc, "servicos"));
          setServicos(servSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

          const agendSnap = await getDocs(collection(userDoc, "agendamentos"));
          setAgendamentos(agendSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        } else {
          setUserUid(null);
          setClientes([]);
          setProfissionais([]);
          setServicos([]);
          setAgendamentos([]);
        }
      });
      return () => unsub();
    }, [adminIdFromState]);

    // 🔎 Se veio um id pela URL e já temos userUid (ou adminIdFromState), carrega direto por ID
    useEffect(() => {
      const carregarAgendamentoPorId = async () => {
        const baseUserId = adminIdFromState || userUid;
        if (!id || !baseUserId) return;

        try {
          const agendDocRef = doc(db, "usuarios", baseUserId, "agendamentos", id);
          const snap = await getDoc(agendDocRef);

          if (snap.exists()) {
            const a = { id: snap.id, ...snap.data() };
            setEditId(a.id);
            setTitulo(a.titulo || "");
            setData(a.data || "");
            setHora(a.hora || "");
            setClienteId(a.clienteId || "");
            setProfissionalId(a.profissionalId || "");
            setServicoId(a.servicoId || "");
            setStatus(a.status || "pendente");
          } else {
            console.warn("Agendamento não encontrado pelo ID:", id);
          }
        } catch (err) {
          console.error("Erro ao carregar agendamento por ID:", err);
        }
      };

      carregarAgendamentoPorId();
    }, [id, userUid, adminIdFromState]);

    // 🔎 Fallback: se a lista já estiver carregada, também tenta preencher via find
    useEffect(() => {
      if (id && agendamentos.length > 0 && !editId) {
        const agendamento = agendamentos.find((a) => a.id === id);
        if (agendamento) {
          setEditId(agendamento.id);
          setTitulo(agendamento.titulo);
          setData(agendamento.data);
          setHora(agendamento.hora);
          setClienteId(agendamento.clienteId);
          setProfissionalId(agendamento.profissionalId);
          setServicoId(agendamento.servicoId);
          setStatus(agendamento.status);
        }
      }
    }, [id, agendamentos, editId]);

    // Limpar editId e estados assim que a URL não tiver mais id
    useEffect(() => {
      if (!id) {
        console.log("[Router] Sem id na URL, limpando edição.");
        setEditId(null);
        setTitulo("");
        setData("");
        setHora("");
        setClienteId("");
        setProfissionalId("");
        setServicoId("");
        setStatus("pendente");
      }
    }, [id]);

    const adicionarOuEditarAgendamento = async (e) => {
      e.preventDefault();
      if (!titulo || !data || !hora || !clienteId || !profissionalId || !servicoId) {
        alert("Preencha todos os campos!");
        return;
      }

      try {
        const baseUserId = adminIdFromState || userUid;
        const userDoc = doc(db, "usuarios", baseUserId);
        const agendRef = collection(userDoc, "agendamentos");

        if (editId) {
          const agendDoc = doc(agendRef, editId);
          await updateDoc(agendDoc, { titulo, data, hora, clienteId, profissionalId, servicoId, status });
          setAgendamentos(agendamentos.map((a) =>
            a.id === editId ? { ...a, titulo, data, hora, clienteId, profissionalId, servicoId, status } : a
          ));
          setEditId(null);
        } else {
          const novoDoc = await addDoc(agendRef, {
            titulo,
            data,
            hora,
            clienteId,
            profissionalId,
            servicoId,
            status,
            createdAt: new Date()
          });
          setAgendamentos([...agendamentos, { id: novoDoc.id, titulo, data, hora, clienteId, profissionalId, servicoId, status }]);
        }
        setEditId(null);
        setTitulo(""); setData(""); setHora("");
        setClienteId(""); setProfissionalId(""); setServicoId("");
        setStatus("pendente");

        // 🔎 navegar para rota sem :id 
        navigate("/agendamento");
      } catch (error) {
        console.error("Erro ao salvar agendamento:", error);
      }
    };

    const removerAgendamento = async (agendamento) => {
      const confirmacao = window.confirm(
      `Tem certeza que deseja excluir o serviço "${agendamento.titulo}"?`
    );
    if (!confirmacao) return;

      try {
        const baseUserId = adminIdFromState || userUid;
        const userDoc = doc(db, "usuarios", baseUserId);
        const agendDoc = doc(userDoc, "agendamentos", agendamento.id);
        await deleteDoc(agendDoc);
        setAgendamentos(agendamentos.filter((a) => a.id !== agendamento.id));
      } catch (error) {
        console.error("Erro ao remover agendamento:", error);
      }
    };

    const iniciarEdicao = (agendamento) => {
      setTitulo(agendamento.titulo);
      setData(agendamento.data);
      setHora(agendamento.hora);
      setClienteId(agendamento.clienteId);
      setProfissionalId(agendamento.profissionalId);
      setServicoId(agendamento.servicoId);
      setStatus(agendamento.status);
      setEditId(agendamento.id);
    };

    const cancelarEdicao = () => {
      console.log("[Editar] Cancelando edição. Limpando estados e voltando para /agendamento");
      
      setEditando(null);
      setTitulo("");
      setData("");
      setHora("");
      setClienteId("");
      setProfissionalId("");
      setServicoId("");
      setStatus("");
      setEditId("");
      navigate("/agendamento"); // ✅ volta para rota sem :id
    };

    const atualizarStatus = async (idParaAtualizar, novoStatus) => {
      try {
        const baseUserId = adminIdFromState || userUid;
        const userDoc = doc(db, "usuarios", baseUserId);
        const agendDoc = doc(userDoc, "agendamentos", idParaAtualizar);
        await updateDoc(agendDoc, { status: novoStatus });
        setAgendamentos(agendamentos.map((a) =>
          a.id === idParaAtualizar ? { ...a, status: novoStatus } : a
        ));
      } catch (error) {
        console.error("Erro ao atualizar status:", error);
      }
    };

    // Estados para filtro
    const [filtroCampo, setFiltroCampo] = useState("titulo");
    const [filtroValor, setFiltroValor] = useState("");

    function formatarDataBR(dataStr) {
      if (!dataStr) return "";
      const [ano, mes, dia] = dataStr.split("-");
      return `${dia}/${mes}/${ano}`;
    }

    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Agendamento</h1>

        {/* Formulário */}
        <form onSubmit={adicionarOuEditarAgendamento} className="space-y-3 mb-6">
          <input
            type="text"
            placeholder="Título"
            className="input input-bordered w-full"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
          <input
            type="date"
            className="input input-bordered w-full"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />
          <input
            type="time"
            className="input input-bordered w-full"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
          />

          {clientes.length > 0 ? (
            <select
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="">Selecione o Cliente</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          ) : (
            <p className="text-warning">⚠️ Cadastre clientes antes de agendar.</p>
          )}

          {profissionais.length > 0 ? (
            <select
              value={profissionalId}
              onChange={(e) => setProfissionalId(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="">Selecione o Profissional</option>
              {profissionais.map((p) => (
                <option key={p.id} value={p.id}>{p.nome} — {p.especialidade}</option>
              ))}
            </select>
          ) : (
            <p className="text-warning">⚠️ Cadastre profissionais antes de agendar.</p>
          )}

          {servicos.length > 0 ? (
            <select
              value={servicoId}
              onChange={(e) => setServicoId(e.target.value)}
              className="select select-bordered w-full"
            >
              <option value="">Selecione o Serviço</option>
              {servicos.map((s) => (
                <option key={s.id} value={s.id}>{s.nome} — {s.duracao} — R$ {s.preco}</option>
              ))}
            </select>
          ) : (
            <p className="text-warning">⚠️ Cadastre serviços antes de agendar.</p>
          )}

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="select select-bordered w-full"
          >
            <option value="pendente">Pendente</option>
            <option value="confirmado">Confirmado</option>
            <option value="concluido">Concluído</option>
            <option value="cancelado">Cancelado</option>
          </select>

          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary flex-1">
              {editId ? "Salvar Edição" : "Adicionar Agendamento"}
            </button>

            {editId && (
              <button
                type="button"
                className="btn btn-secondary flex-1"
                onClick={cancelarEdicao}
              >
                Voltar
              </button>
            )}
          </div>
        </form>

        {/* Lista e filtros */}
        <h2 className="text-xl font-semibold mb-3">Agendamentos</h2>
        <div className="flex gap-2 mb-4">
          <select
            value={filtroCampo}
            onChange={(e) => setFiltroCampo(e.target.value)}
            className="select select-bordered"
          >
            <option value="titulo">Título</option>
            <option value="cliente">Cliente</option>
            <option value="profissional">Profissional</option>
            <option value="servico">Serviço</option>
            <option value="data">Data</option>
            <option value="hora">Hora</option>
            <option value="status">Status</option>
          </select>

          <input
            type="text"
            placeholder={`Pesquisar por ${filtroCampo}...`}
            className="input input-bordered flex-1"
            value={filtroValor}
            onChange={(e) => setFiltroValor(e.target.value.toLowerCase())}
          />
        </div>

        <ul className="space-y-2">
          {agendamentos
            .filter((a) => {
              const cliente = clientes.find((c) => c.id === a.clienteId)?.nome || "";
              const profissional = profissionais.find((p) => p.id === a.profissionalId)?.nome || "";
              const servico = servicos.find((s) => s.id === a.servicoId)?.nome || "";

              switch (filtroCampo) {
                case "titulo":
                  return a.titulo.toLowerCase().includes(filtroValor);
                case "cliente":
                  return cliente.toLowerCase().includes(filtroValor);
                case "profissional":
                  return profissional.toLowerCase().includes(filtroValor);
                case "servico":
                  return servico.toLowerCase().includes(filtroValor);
                case "data":
                  return a.data.toLowerCase().includes(filtroValor);
                case "hora":
                  return a.hora.toLowerCase().includes(filtroValor);
                case "status":
                  return a.status.toLowerCase().includes(filtroValor);
                default:
                  return true;
              }
            })
            .map((a) => {
              const cliente = clientes.find((c) => c.id === a.clienteId);
              const profissional = profissionais.find((p) => p.id === a.profissionalId);
              const servico = servicos.find((s) => s.id === a.servicoId);

              return (
                <li
                  key={a.id}
                  className="flex justify-between items-center p-3 bg-base-200 rounded"
                >
                  <span>
                    {a.titulo} — {formatarDataBR(a.data)} às {a.hora}
                    <br />
                    Cliente: {cliente ? cliente.nome : "Não definido"} | Profissional:{" "}
                    {profissional ? profissional.nome : "Não definido"}
                    <br />
                    Serviço:{" "}
                    {servico
                      ? `${servico.nome} — ${servico.duracao} — R$ ${servico.preco}`
                      : "Não definido"}
                    <div className="flex gap-2 pt-[15px]">
                      <button
                        className={`btn btn-xs ${
                          a.status === "pendente" ? "btn-warning" : "btn-outline"
                        }`}
                        onClick={() => atualizarStatus(a.id, "pendente")}
                      >
                        Pendente
                      </button>
                      <button
                        className={`btn btn-xs ${
                          a.status === "confirmado" ? "btn-info" : "btn-outline"
                        }`}
                        onClick={() => atualizarStatus(a.id, "confirmado")}
                      >
                        Confirmado
                      </button>
                      <button
                        className={`btn btn-xs ${
                          a.status === "concluido" ? "btn-success" : "btn-outline"
                        }`}
                        onClick={() => atualizarStatus(a.id, "concluido")}
                      >
                        Concluído
                      </button>
                      <button
                        className={`btn btn-xs ${
                          a.status === "cancelado" ? "btn-error" : "btn-outline"
                        }`}
                        onClick={() => atualizarStatus(a.id, "cancelado")}
                      >
                        Cancelado
                      </button>
                    </div>
                  </span>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => iniciarEdicao(a)}
                      >
                        Editar
                      </button>
                      {editId !== a.id && (
                        <button
                          className="btn btn-error btn-sm"
                          onClick={() => removerAgendamento(a)}
                        >
                          Remover
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
        </ul>
      </div>
    );
  }
