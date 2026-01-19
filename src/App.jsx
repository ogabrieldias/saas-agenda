import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Agendamento from "./pages/Agendamento.jsx";
import CalendarPage from "./pages/CalendarPage.jsx";
import Clientes from "./pages/Clientes.jsx";
import Profissionais from "./pages/Profissionais.jsx";
import Servicos from "./pages/Servicos.jsx";
import Navbar from "./components/layout/Navbar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CadastroMembro from "./pages/CadastroMembro.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import SolicitarAcesso from "./pages/SolicitarAcesso.jsx";
import AgendamentoDetalhe from "./pages/AgendamentoDetalhe.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/landingpage" element={<LandingPage />} />
        <Route path="/solicitaracesso" element={<SolicitarAcesso />} />

        {/* Rota de detalhes com parâmetros */}
        <Route
          path="/agendamento/detalhe/:adminId/:id"
          element={
            <PrivateRoute allowedRoles={["admin", "recepcionista", "profissional"]}>
              <AgendamentoDetalhe />
            </PrivateRoute>
          }
        />

        {/* Rota dinâmica para edição */}
        <Route
          path="/agendamento/:adminId/:id"
          element={
            <PrivateRoute allowedRoles={["admin", "recepcionista"]}>
              <Agendamento />
            </PrivateRoute>
          }
        />

        {/* Rota padrão para lista/criação */}
        <Route
          path="/agendamento"
          element={
            <PrivateRoute allowedRoles={["recepcionista", "admin"]}>
              <Agendamento />
            </PrivateRoute>
          }
        />

        <Route
          path="/calendar"
          element={
            <PrivateRoute allowedRoles={["profissional", "admin"]}>
              <CalendarPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/clientes"
          element={
            <PrivateRoute allowedRoles={["recepcionista", "admin"]}>
              <Clientes />
            </PrivateRoute>
          }
        />
        <Route
          path="/profissionais"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <Profissionais />
            </PrivateRoute>
          }
        />
        <Route
          path="/servicos"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <Servicos />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/cadastromembro"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <CadastroMembro />
            </PrivateRoute>
          }
        />
        <Route
          path="/landingpage"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <LandingPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
