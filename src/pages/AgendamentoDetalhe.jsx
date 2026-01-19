import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

export default function AgendamentoDetalhe() {
  const navigate = useNavigate();
  const { adminId, id } = useParams();

  const [agendamento, setAgendamento] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [profissional, setProfissional] = useState(null);
  const [servico, setServico] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      try {
        const agendRef = doc(db, "usuarios", adminId, "agendamentos", id);
        const snap = await getDoc(agendRef);
        if (!snap.exists()) {
          setLoading(false);
          return;
        }
        const a = { id: snap.id, ...snap.data() };
        setAgendamento(a);

        const userDoc = doc(db, "usuarios", adminId);
        const [clientesSnap, profSnap, servSnap] = await Promise.all([
          getDocs(collection(userDoc, "clientes")),
          getDocs(collection(userDoc, "profissionais")),
          getDocs(collection(userDoc, "servicos")),
        ]);

        const clientes = clientesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const profissionais = profSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        const servicos = servSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

        setCliente(clientes.find((c) => c.id === a.clienteId) || null);
        setProfissional(profissionais.find((p) => p.id === a.profissionalId) || null);
        setServico(servicos.find((s) => s.id === a.servicoId) || null);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, [adminId, id]);

  if (loading) return <div className="p-6">Carregando...</div>;
  if (!agendamento) return <div className="p-6">Agendamento não encontrado.</div>;

  const formatarDataBR = (dataStr) => {
    if (!dataStr) return "";
    const [ano, mes, dia] = dataStr.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Detalhes do agendamento</h1>
        <div className="flex gap-2">
          <button className="btn" onClick={() => navigate("/calendar")}>Voltar ao calendário</button>
          <button
            className="btn btn-primary"
            onClick={() => navigate(`/agendamento/${adminId}/${id}`)}
          >
            Editar
          </button>
        </div>
      </div>

      <div className="bg-base-200 p-4 rounded space-y-2">
        <p><strong>Título:</strong> {agendamento.titulo}</p>
        <p><strong>Data:</strong> {formatarDataBR(agendamento.data)} às {agendamento.hora}</p>
        <p><strong>Status:</strong> {agendamento.status}</p>
        <p><strong>Cliente:</strong> {cliente ? cliente.nome : "Não definido"}</p>
        <p><strong>Profissional:</strong> {profissional ? profissional.nome : "Não definido"}</p>
        <p><strong>Serviço:</strong> {servico ? `${servico.nome} — ${servico.duracao} — R$ ${servico.preco}` : "Não definido"}</p>
        {agendamento.observacoes && <p><strong>Observações:</strong> {agendamento.observacoes}</p>}
      </div>
    </div>
  );
}
