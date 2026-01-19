import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { updateProfile } from "firebase/auth";
import { onAuthStateChanged, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc, getDocs, collection } from "firebase/firestore";
import { signOut } from "firebase/auth"

export default function CadastroMembro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [role, setRole] = useState("recepcionista");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [userUid, setUserUid] = useState(null);
  const [plano, setPlano] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserUid(user.uid);
        const userDoc = await getDoc(doc(db, "usuarios", user.uid));
        if (userDoc.exists()) {
          setPlano(userDoc.data().plano || "basico");
        }
      }
    });
    return () => unsub();
  }, []);

  const handleCadastrarMembro = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (!nome.trim() || !email.trim() || !senha.trim()) {
      setErro("Preencha todos os campos.");
      return;
    }

    try {
      // 1️⃣ Verifica limite do plano
      const membrosRef = collection(doc(db, "usuarios", userUid), "membros");
      const membrosSnap = await getDocs(membrosRef);
      const qtdMembros = membrosSnap.size;

      if (plano === "basico" && qtdMembros >= 3) {
        setErro("Plano Básico permite até 3 membros.");
        return;
      }
      if (plano === "intermediario" && qtdMembros >= 10) {
        setErro("Plano Intermediário permite até 10 membros.");
        return;
      }

      // 2️⃣ Cria usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const membroUser = userCredential.user;

      // Atualiza o displayName para o nome informado
      await updateProfile(membroUser, { displayName: nome });

      // 3️⃣ Salva perfil em "usuarios"
      await setDoc(doc(db, "usuarios", membroUser.uid), {
        nome,
        email,
        role,
        plano, // herda o plano do admin
        createdAt: new Date().toISOString(),
      });


      // 4️⃣ Salva também na subcoleção "membros" do admin
      await setDoc(doc(membrosRef, membroUser.uid), {
        nome,
        email,
        role,
        createdAt: new Date().toISOString(),
      });

      // 🔴 Desloga o membro recém-criado para não derrubar o admin 
      await signOut(auth); 
      
      // Mensagem de sucesso
      setSucesso("Membro cadastrado com sucesso!");
      
      setNome("");
      setEmail("");
      setSenha("");
      setRole("recepcionista");
    } catch (error) {
      console.error("Erro ao cadastrar membro:", error);
      setErro("Erro ao salvar membro. Verifique as permissões.");
    }
  };

  return (
    <div className="p-6 justify-items-center">
      <h1 className="text-2xl font-bold mb-4">Cadastro de Membros</h1>
      <p className="mb-2">
        Plano atual: <strong>{plano.toUpperCase()}</strong>
      </p>

      <form onSubmit={handleCadastrarMembro} className="space-y-3 max-w-md">
        <input
          type="text"
          placeholder="Nome do membro"
          className="input input-bordered w-full"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email do membro"
          className="input input-bordered w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Senha do membro"
          className="input input-bordered w-full"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        <select
          className="select select-bordered w-full"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="recepcionista">Recepcionista</option>
          <option value="profissional">Profissional</option>
        </select>

        {erro && <p className="text-error text-sm">{erro}</p>}
        {sucesso && <p className="text-success text-sm">{sucesso}</p>}

        <button type="submit" className="btn btn-primary w-full">
          Cadastrar Membro
        </button>
      </form>
    </div>
  );
}
