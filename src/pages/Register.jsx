// O código foi totalmente comentado para o usuario não se registrar quando quiser tendo assim maior controle
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase"; 
import { doc, setDoc } from "firebase/firestore";

export default function Register() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [role, setRole] = useState("recepcionista"); // perfil padrão
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      await updateProfile(user, { displayName: nome });

      await setDoc(doc(db, "usuarios", user.uid), {
        nome,
        email,
        role, // salva perfil
        createdAt: new Date()
      });

      setSucesso("Usuário cadastrado com sucesso!");
      setNome(""); setEmail(""); setSenha("");

      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      console.error(error);
      if (error.code === "auth/email-already-in-use") {
        setErro("Usuário já cadastrado.");
      } else if (error.code === "auth/weak-password") {
        setErro("A senha deve ter pelo menos 6 caracteres.");
      } else {
        setErro("Erro ao cadastrar. Tente novamente.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Cadastro</h2>

          <form onSubmit={handleRegister} className="space-y-3">
            <input
              type="text"
              placeholder="Nome"
              className="input input-bordered w-full"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              className="input input-bordered w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Senha"
              className="input input-bordered w-full"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />

            <select
              className="select select-bordered w-full"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="admin">Admin</option>
              <option value="profissional">Profissional</option>
              <option value="recepcionista">Recepcionista</option>
            </select>

            {erro && <p className="text-error text-sm">{erro}</p>}
            {sucesso && <p className="text-success text-sm">{sucesso}</p>}

            <button type="submit" className="btn btn-primary w-full">
              Cadastrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}