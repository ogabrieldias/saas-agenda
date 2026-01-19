import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { onAuthStateChanged, getAuth, signOut } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import LogoutButton from "./LogoutButton.jsx";


function getDeviceId() {
  let id = localStorage.getItem("deviceId");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("deviceId", id);
  }
  return id;
}

function Navbar() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState("light");
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const deviceId = getDeviceId();

        // Verifica se a sessão está ativa para este device
        const q = query(
          collection(db, "sessions"),
          where("userId", "==", currentUser.uid),
          where("active", "==", true)
        );
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const session = snapshot.docs[0].data();
          if (session.deviceId === deviceId) {
            // Sessão válida → carrega perfil
            setUser(currentUser);
            const snap = await getDoc(doc(db, "usuarios", currentUser.uid));
            if (snap.exists()) {
              setRole(snap.data().role);
              localStorage.setItem("role", snap.data().role);
            }
          } else {
            // Sessão ativa em outro dispositivo → força logout
            await signOut(auth);
            setUser(null);
            setRole(null);
            localStorage.removeItem("role");
            navigate("/login");
          }
        } else {
          // Nenhuma sessão ativa → força logout
          await signOut(auth);
          setUser(null);
          setRole(null);
          localStorage.removeItem("role");
          navigate("/login");
        }
      } else {
        setUser(null);
        setRole(null);
        localStorage.removeItem("role");
      }
    });
    return () => unsubscribe();
  }, [auth, navigate]);

  // Troca tema
  const changeTheme = (theme) => {
    setSelectedTheme(theme);
    document.querySelector("html").setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  };

  // Carrega tema salvo
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setSelectedTheme(savedTheme);
      document.querySelector("html").setAttribute("data-theme", savedTheme);
    }
  }, []);

  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </div>
          <ul tabIndex="-1"
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
            {user ? (
              <>
                {(role === "admin" || role === "profissional") && (
                  <li><Link to="/calendar">Calendário</Link></li>
                )}
                {(role === "admin" || role === "recepcionista") && (
                  <li><Link to="/agendamento">Agendamento</Link></li>
                )}
                {(role === "admin" || role === "recepcionista") && (
                  <li><Link to="/clientes">Clientes</Link></li>
                )}
                {role === "admin" && (
                  <>
                    <li><Link to="/profissionais">Profissionais</Link></li>
                    <li><Link to="/servicos">Serviços</Link></li>
                    <li><Link to="/dashboard">Relatório</Link></li>
                    <li><Link to="/cadastromembro">Cadastro de Membros</Link></li>
                    
                  </>
                )}
              </>
            ) : (
              <>
                {/* <li><Link to="/register">Register</Link></li> */}
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/landingpage">Landing Page</Link></li>
                <li><Link to="/solicitaracesso">Solicitar Acesso</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>

      <div className="navbar-center">
        <Link to="/" className="btn btn-ghost text-xl">
          Agenda App
        </Link>
      </div>

      <div className="navbar-end flex items-center gap-2">
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost">
            Tema: <span className="font-bold">{selectedTheme}</span>
          </label>
          <ul tabIndex={0}
            className="menu dropdown-content bg-base-100 rounded-box w-40 p-2 shadow">
            <li><button onClick={() => changeTheme("light")}>🌞 Light</button></li>
            <li><button onClick={() => changeTheme("luxury")}>💎 Luxury</button></li>
            <li><button onClick={() => changeTheme("synthwave")}>🎶 Synthwave</button></li>
            <li><button onClick={() => changeTheme("forest")}>🌲 Forest</button></li>
          </ul>
        </div>

        {user && <LogoutButton />}
      </div>
    </div>
  );
}

export default Navbar;
