import { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, collection, getDocs, query, where } from "firebase/firestore";

ChartJS.register(Title, Tooltip, Legend, ArcElement, BarElement, CategoryScale, LinearScale);

export default function RelatoriosDashboard() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [adminSelecionado, setAdminSelecionado] = useState("");
  const [nomeUsuario, setNomeUsuario] = useState("");

  // 🔎 Recupera usuário logado
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setNomeUsuario(user.displayName || user.email);
      } else {
        setNomeUsuario("");
      }
    });
    return () => unsub();
  }, []);

  // 🔎 Carrega lista de administradores
  useEffect(() => {
    const carregarAdmins = async () => {
      const usuariosSnap = await getDocs(
        query(collection(db, "usuarios"), where("role", "in", ["admin", "admin2"]))
      );
      setAdmins(usuariosSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    carregarAdmins();
  }, []);

  // 🔎 Carrega dados conforme admin selecionado
  useEffect(() => {
    const carregarDados = async () => {
      let todosAgendamentos = [];
      let todosClientes = [];
      let todosProfissionais = [];
      let todosServicos = [];

      for (const admin of admins) {
        if (!adminSelecionado || adminSelecionado === admin.id) {
          const userDoc = doc(db, "usuarios", admin.id);

          const clientesSnap = await getDocs(collection(userDoc, "clientes"));
          todosClientes.push(...clientesSnap.docs.map((d) => ({ id: d.id, ...d.data(), adminId: admin.id })));

          const profSnap = await getDocs(collection(userDoc, "profissionais"));
          todosProfissionais.push(...profSnap.docs.map((d) => ({ id: d.id, ...d.data(), adminId: admin.id })));

          const servSnap = await getDocs(collection(userDoc, "servicos"));
          todosServicos.push(...servSnap.docs.map((d) => ({ id: d.id, ...d.data(), adminId: admin.id })));

          const agendSnap = await getDocs(collection(userDoc, "agendamentos"));
          todosAgendamentos.push(...agendSnap.docs.map((d) => ({ id: d.id, ...d.data(), adminId: admin.id })));
        }
      }

      setClientes(todosClientes);
      setProfissionais(todosProfissionais);
      setServicos(todosServicos);
      setAgendamentos(todosAgendamentos);
    };

    if (admins.length > 0) carregarDados();
  }, [admins, adminSelecionado]);

  // 📊 Métricas
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  const atendimentosMes = agendamentos.filter((a) => {
    const dataAgendamento = new Date(`${a.data}T${a.hora}`);
    return (
      dataAgendamento.getMonth() === mesAtual &&
      dataAgendamento.getFullYear() === anoAtual
    );
  });

  const receitaTotal = atendimentosMes.reduce((total, a) => {
    const servico = servicos.find((s) => s.id === a.servicoId);
    return total + (servico ? Number(servico.preco) : 0);
  }, 0);

  // Contagem de serviços
  const servicoContagem = {};
  atendimentosMes.forEach((a) => {
    if (a.servicoId) {
      servicoContagem[a.servicoId] = (servicoContagem[a.servicoId] || 0) + 1;
    }
  });
  const servicoLabels = Object.keys(servicoContagem).map(
    (id) => servicos.find((s) => s.id === id)?.nome || "Desconhecido"
  );
  const servicoData = Object.values(servicoContagem);

  // Contagem de profissionais
  const profissionalContagem = {};
  atendimentosMes.forEach((a) => {
    if (a.profissionalId) {
      profissionalContagem[a.profissionalId] =
        (profissionalContagem[a.profissionalId] || 0) + 1;
    }
  });
  const profissionalLabels = Object.keys(profissionalContagem).map(
    (id) => profissionais.find((p) => p.id === id)?.nome || "Desconhecido"
  );
  const profissionalData = Object.values(profissionalContagem);

  return (
    <div className="p-6">
      {nomeUsuario && <h2 className="text-xl mb-2">Bem-vindo, {nomeUsuario}</h2>}
      <h1 className="text-3xl font-bold mb-6">📊 Dashboard de Relatórios</h1>

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

      {/* Cards Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="p-4 bg-base-200 rounded shadow">
          <h2 className="text-lg font-semibold">Atendimentos no mês</h2>
          <p className="text-2xl font-bold">{atendimentosMes.length}</p>
        </div>
        <div className="p-4 bg-base-200 rounded shadow">
          <h2 className="text-lg font-semibold">Receita estimada</h2>
          <p className="text-2xl font-bold">R$ {receitaTotal.toFixed(2)}</p>
        </div>
        <div className="p-4 bg-base-200 rounded shadow">
          <h2 className="text-lg font-semibold">Serviços cadastrados</h2>
          <p className="text-2xl font-bold">{servicos.length}</p>
        </div>
        <div className="p-4 bg-base-200 rounded shadow">
          <h2 className="text-lg font-semibold">Profissionais ativos</h2>
          <p className="text-2xl font-bold">{profissionais.length}</p>
        </div>
        <div className="p-4 bg-base-200 rounded shadow">
          <h2 className="text-lg font-semibold">Clientes cadastrados</h2>
          <p className="text-2xl font-bold">{clientes.length}</p>
        </div>
      </div>

      {/* Gráficos em grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Gráfico de Serviços */}
        <div className="p-4 bg-base-200 rounded shadow h-96">
          <h2 className="text-xl font-semibold mb-3">Serviços mais agendados</h2>
          <Bar
            data={{
              labels: servicoLabels,
              datasets: [
                {
                  label: "Quantidade de Agendamentos",
                  data: servicoData,
                  backgroundColor: "rgba(75, 192, 192, 0.6)",
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false, // ✅ adapta ao card
              plugins: { legend: { display: false } },
            }}
          />
        </div>

        {/* Gráfico de Profissionais */}
        <div className="p-4 bg-base-200 rounded shadow h-96">
          <h2 className="text-xl font-semibold mb-3">Profissionais com mais atendimentos</h2>
          <Pie
            data={{
              labels: profissionalLabels,
              datasets: [
                {
                  label: "Atendimentos",
                  data: profissionalData,
                  backgroundColor: [
                    "rgba(255, 99, 132, 0.6)",
                    "rgba(54, 162, 235, 0.6)",
                    "rgba(255, 206, 86, 0.6)",
                    "rgba(75, 192, 192, 0.6)",
                    "rgba(153, 102, 255, 0.6)",
                    "rgba(255, 159, 64, 0.6)",
                  ],
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false, // ✅ adapta ao card
              plugins: {
                legend: {
                  position: "bottom", // legenda abaixo para melhor distribuição
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
