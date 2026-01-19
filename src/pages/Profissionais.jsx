import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs
} from "firebase/firestore";

export default function Profissionais() {
  const [profissionais, setProfissionais] = useState([]);
  const [nome, setNome] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [erro, setErro] = useState("");
  const [editando, setEditando] = useState(null);
  const [userUid, setUserUid] = useState(null);

  // 🔎 Recupera usuário logado e carrega profissionais da subcoleção
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserUid(user.uid);
        const userDoc = doc(db, "usuarios", user.uid);
        const snap = await getDocs(collection(userDoc, "profissionais"));
        setProfissionais(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } else {
        setUserUid(null);
        setProfissionais([]);
      }
    });
    return () => unsub();
  }, []);

  const salvarProfissional = async (e) => {
    e.preventDefault();
    setErro("");

    if (!nome.trim() || !especialidade.trim()) {
      setErro("Nome e especialidade são obrigatórios.");
      return;
    }

    try {
      const profRef = collection(doc(db, "usuarios", userUid), "profissionais");

      if (editando) {
        const profDoc = doc(profRef, editando);
        await updateDoc(profDoc, { nome, especialidade });
        setProfissionais(profissionais.map((p) =>
          p.id === editando ? { ...p, nome, especialidade } : p
        ));
        setEditando(null);
      } else {
        const novoDoc = await addDoc(profRef, {
          nome,
          especialidade,
          createdAt: new Date(),
          createdBy: userUid
        });
        setProfissionais([...profissionais, { id: novoDoc.id, nome, especialidade }]);
      }

      setNome("");
      setEspecialidade("");
    } catch (error) {
      console.error("Erro ao salvar profissional:", error);
      setErro("Erro ao salvar profissional. Verifique as regras do Firestore.");
    }
  };

  const removerProfissional = async (id) => {
    try {
      const profDoc = doc(db, "usuarios", userUid, "profissionais", id);
      await deleteDoc(profDoc);
      setProfissionais(profissionais.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Erro ao remover profissional:", error);
    }
  };

  const editarProfissional = (profissional) => {
    setNome(profissional.nome);
    setEspecialidade(profissional.especialidade);
    setEditando(profissional.id);
  };

  const cancelarEdicao = () => {
    setEditando(null);
    setNome("");
    setEspecialidade("");
    setErro("");
  };

  // Estados para filtro
  const [filtroCampo, setFiltroCampo] = useState("nome");
  const [filtroValor, setFiltroValor] = useState("");

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Cadastro de Profissionais</h1>

      <form onSubmit={salvarProfissional} className="space-y-3 mb-6">
        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="input input-bordered w-full"
        />
        <input
          type="text"
          placeholder="Especialidade"
          value={especialidade}
          onChange={(e) => setEspecialidade(e.target.value)}
          className="input input-bordered w-full"
        />

        {erro && <p className="text-error text-sm">{erro}</p>}

        <button type="submit" className="btn btn-primary w-full">
          {editando ? "Atualizar Profissional" : "Salvar Profissional"}
        </button>

        {editando && (
          <button
            type="button"
            className="btn btn-secondary w-full mt-2"
            onClick={cancelarEdicao}
          >
            Voltar
          </button>
        )}
      </form>

      <h2 className="text-xl font-semibold mb-3">Lista de Profissionais</h2>
      <div className="flex gap-2 mb-4">
        <select
          value={filtroCampo}
          onChange={(e) => setFiltroCampo(e.target.value)}
          className="select select-bordered"
        >
          <option value="nome">Nome</option>
          <option value="especialidade">Especialidade</option>
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
        {profissionais
          .filter((p) => {
            switch (filtroCampo) {
              case "nome":
                return p.nome.toLowerCase().includes(filtroValor);
              case "especialidade":
                return p.especialidade.toLowerCase().includes(filtroValor);
              default:
                return true;
            }
          })
          .map((p) => (
            <li
              key={p.id}
              className="flex justify-between items-center p-3 bg-base-200 rounded"
            >
              <span>
                {p.nome} — {p.especialidade}
              </span>
              <div className="space-x-2">
                <button
                  className="btn btn-info btn-sm"
                  onClick={() => editarProfissional(p)}
                >
                  Editar
                </button>
                {!editando && (
                  <button
                    className="btn btn-error btn-sm"
                    onClick={() => removerProfissional(p.id)}
                  >
                    Remover
                  </button>
                )}
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
}
