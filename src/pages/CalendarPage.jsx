import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Firebase
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, collection, getDocs, query, where, getDoc } from "firebase/firestore";

const locales = { "pt-BR": ptBR };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

export default function CalendarPage() {
  const navigate = useNavigate();

  const [date, setDate] = useState(new Date());
  const [view, setView] = useState("month");
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [planoUsuario, setPlanoUsuario] = useState("");

  // filtros
  const [filtroProfissional, setFiltroProfissional] = useState("");
  const [filtroServico, setFiltroServico] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");

  // estados para dados do Firestore
  const [admins, setAdmins] = useState([]);
  const [adminSelecionado, setAdminSelecionado] = useState("");
  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [servicos, setServicos] = useState([]);

  // 🔎 Recupera usuário logado
  useEffect(() => {
    console.log("[Auth] Iniciando listener de autenticação...");
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("[Auth] Usuário logado:", { uid: user.uid, email: user.email });
        setNomeUsuario(user.displayName || user.email);

        try {
          const userDocRef = doc(db, "usuarios", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const dados = userDoc.data();
            console.log("[Auth] Documento do usuário encontrado:", dados);
            setNomeUsuario(dados.nome || user.email);
            setPlanoUsuario(dados.plano || "basico");
          } else {
            console.warn("[Auth] Documento do usuário NÃO encontrado. Usando dados do auth.");
            setPlanoUsuario("basico");
          }
        } catch (err) {
          console.error("[Auth] Erro ao buscar documento do usuário:", err);
        }
      } else {
        console.log("[Auth] Nenhum usuário logado.");
        setNomeUsuario("");
        setPlanoUsuario("");
      }
    });
    return () => {
      console.log("[Auth] Removendo listener de autenticação.");
      unsub();
    };
  }, []);

  // 🔎 Carrega lista de administradores
  useEffect(() => {
    const carregarAdmins = async () => {
      console.log("[Admins] Buscando admins...");
      try {
        const usuariosSnap = await getDocs(
          query(collection(db, "usuarios"), where("role", "in", ["admin", "admin2"]))
        );
        const lista = usuariosSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        console.log("[Admins] Encontrados:", lista.length, lista);
        setAdmins(lista);
      } catch (err) {
        console.error("[Admins] Erro ao buscar admins:", err);
      }
    };
    carregarAdmins();
  }, []);

  // 🔎 Carrega dados conforme admin selecionado
  useEffect(() => {
    const carregarDados = async () => {
      console.log("[Dados] Iniciando carga. Admin selecionado:", adminSelecionado);
      let todosAgendamentos = [];
      let todosClientes = [];
      let todosProfissionais = [];
      let todosServicos = [];

      for (const admin of admins) {
        if (!adminSelecionado || adminSelecionado === admin.id) {
          console.log(`[Dados] Carregando subcoleções para admin ${admin.id}...`);
          const userDoc = doc(db, "usuarios", admin.id);

          try {
            const clientesSnap = await getDocs(collection(userDoc, "clientes"));
            todosClientes.push(...clientesSnap.docs.map((d) => ({ id: d.id, ...d.data(), adminId: admin.id })));
          } catch (err) {
            console.error(`[Dados] Erro clientes ${admin.id}:`, err);
          }

          try {
            const profSnap = await getDocs(collection(userDoc, "profissionais"));
            todosProfissionais.push(...profSnap.docs.map((d) => ({ id: d.id, ...d.data(), adminId: admin.id })));
          } catch (err) {
            console.error(`[Dados] Erro profissionais ${admin.id}:`, err);
          }

          try {
            const servSnap = await getDocs(collection(userDoc, "servicos"));
            todosServicos.push(...servSnap.docs.map((d) => ({ id: d.id, ...d.data(), adminId: admin.id })));
          } catch (err) {
            console.error(`[Dados] Erro serviços ${admin.id}:`, err);
          }

          try {
            const agendSnap = await getDocs(collection(userDoc, "agendamentos"));
            todosAgendamentos.push(...agendSnap.docs.map((d) => ({ id: d.id, ...d.data(), adminId: admin.id })));
          } catch (err) {
            console.error(`[Dados] Erro agendamentos ${admin.id}:`, err);
          }
        }
      }

      setClientes(todosClientes);
      setProfissionais(todosProfissionais);
      setServicos(todosServicos);
      setAgendamentos(todosAgendamentos);
      console.log("[Dados] Totais:", {
        clientes: todosClientes.length,
        profissionais: todosProfissionais.length,
        servicos: todosServicos.length,
        agendamentos: todosAgendamentos.length,
      });
    };

    if (admins.length > 0) carregarDados();
  }, [admins, adminSelecionado]);

  // Converte agendamentos em eventos
  const events = useMemo(() => {
    const mapped = agendamentos.map((a) => {
      const start = new Date(`${a.data}T${a.hora}`);
      const end = new Date(start.getTime() + 60 * 60 * 1000);

      const cliente = clientes.find((c) => c.id === a.clienteId);
      const profissional = profissionais.find((p) => p.id === a.profissionalId);
      const servico = servicos.find((s) => s.id === a.servicoId);

      return {
        id: a.id,
        title: `${a.titulo} — ${cliente ? cliente.nome : "Cliente"} atendido por ${
          profissional ? profissional.nome : "Profissional"
        } — Serviço: ${servico ? servico.nome : "Não definido"} às ${a.hora}`,
        start,
        end,
        status: a.status,
        profissionalId: a.profissionalId,
        servicoId: a.servicoId,
        cliente: cliente ? cliente.nome : "",
        profissional: profissional ? profissional.nome : "",
        servico: servico ? servico.nome : "",
        adminId: a.adminId,
      };
    });
    console.log("[Events] Mapeados:", mapped.length, mapped);
    return mapped;
  }, [agendamentos, clientes, profissionais, servicos]);

  // aplica filtros
  const eventsFiltrados = useMemo(() => {
    const filtrados = events.filter(
      (e) =>
        (!filtroProfissional || e.profissionalId === filtroProfissional) &&
        (!filtroServico || e.servicoId === filtroServico) &&
        (!filtroStatus || e.status === filtroStatus)
    );
    console.log("[Events] Após filtros:", filtrados.length);
    return filtrados;
  }, [events, filtroProfissional, filtroServico, filtroStatus]);

  return (
    <div className="p-6">
      {nomeUsuario && (
        <h2 className="text-xl mb-2">
          Bem-vindo, {nomeUsuario} — Plano: {planoUsuario.toUpperCase()}
        </h2>
      )}
      <h1 className="text-2xl font-bold mb-4">Calendário de Agendamentos</h1>

      {/* Seletor de administrador */}
      <div className="mb-4">
        <select
          value={adminSelecionado}
          onChange={(e) => setAdminSelecionado(e.target.value)}
          className="select select-bordered"
        >
          <option value="">Todos os administradores</option>
          {admins.map((a) => (
          <option key={a.id} value={a.id}>
            {a.nome} ({a.role})
          </option>
        ))}
      </select>
    </div>

    {/* Filtros */}
    <div className="flex gap-4 mb-4">
      <select
        value={filtroProfissional}
        onChange={(e) => {
          console.log("[UI] Alterando filtroProfissional:", e.target.value);
          setFiltroProfissional(e.target.value);
        }}
        className="select select-bordered"
      >
        <option value="">Todos os profissionais</option>
        {profissionais.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nome}
          </option>
        ))}
      </select>

      <select
        value={filtroServico}
        onChange={(e) => {
          console.log("[UI] Alterando filtroServico:", e.target.value);
          setFiltroServico(e.target.value);
        }}
        className="select select-bordered"
      >
        <option value="">Todos os serviços</option>
        {servicos.map((s) => (
          <option key={s.id} value={s.id}>
            {s.nome}
          </option>
        ))}
      </select>

      <select
        value={filtroStatus}
        onChange={(e) => {
          console.log("[UI] Alterando filtroStatus:", e.target.value);
          setFiltroStatus(e.target.value);
        }}
        className="select select-bordered"
      >
        <option value="">Todos os status</option>
        <option value="pendente">Pendente</option>
        <option value="confirmado">Confirmado</option>
        <option value="concluido">Concluído</option>
        <option value="cancelado">Cancelado</option>
      </select>
    </div>

    {/* Calendário */}
    <Calendar
      localizer={localizer}
      events={eventsFiltrados}
      startAccessor="start"
      endAccessor="end"
      style={{ height: 500 }}
      views={["month", "week", "day"]}
      toolbar={true}
      date={date}
      view={view}
      onNavigate={(newDate) => {
        console.log("[Calendar] Navegar para data:", newDate);
        setDate(newDate);
      }}
      onView={(newView) => {
        console.log("[Calendar] Alterar view:", newView);
        setView(newView);
      }}
      eventPropGetter={(event) => {
        let backgroundColor = "#6b7280";
        if (event.status === "pendente") backgroundColor = "#facc15";
        if (event.status === "confirmado") backgroundColor = "#3b82f6";
        if (event.status === "concluido") backgroundColor = "#22c55e";
        if (event.status === "cancelado") backgroundColor = "#ef4444";
        const style = { backgroundColor, color: "white" };
        return { style };
      }}
      onSelectEvent={(event) => {
        console.log("[Calendar] Evento selecionado:", event);
        if (!event.adminId || !event.id) {
          console.warn("[Calendar] Evento sem adminId ou id. Navegação abortada.", event);
          return;
        }
        // ✅ Agora navega para a página de detalhes
        const path = `/agendamento/detalhe/${event.adminId}/${event.id}`;
        console.log("[Calendar] Navegando para detalhes:", path);
        navigate(path);
      }}
    />
  </div>
);
}
