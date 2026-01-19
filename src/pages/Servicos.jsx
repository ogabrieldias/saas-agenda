import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  deleteDoc,
  getDocs,
  doc
} from "firebase/firestore";

export default function Servicos() {
  const [servicos, setServicos] = useState([]);
  const [nome, setNome] = useState("");
  const [duracao, setDuracao] = useState("");
  const [preco, setPreco] = useState("");
  const [userUid, setUserUid] = useState(null);

  // Estados para filtro
  const [filtroCampo, setFiltroCampo] = useState("nome");
  const [filtroValor, setFiltroValor] = useState("");

  // 🔎 Recupera usuário logado e carrega serviços da subcoleção do usuário
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserUid(user.uid);
        const userDoc = doc(db, "usuarios", user.uid);
        const snap = await getDocs(collection(userDoc, "servicos"));
        setServicos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } else {
        setUserUid(null);
        setServicos([]);
      }
    });
    return () => unsub();
  }, []);

  const salvarServico = async (e) => {
    e.preventDefault();
    if (!nome.trim() || !duracao.trim() || !preco.trim()) return;

    try {
      const servRef = collection(doc(db, "usuarios", userUid), "servicos");

      const novoDoc = await addDoc(servRef, {
        nome,
        duracao,
        preco,
        createdAt: new Date(),
        createdBy: userUid
      });

      setServicos([...servicos, { id: novoDoc.id, nome, duracao, preco }]);
      setNome("");
      setDuracao("");
      setPreco("");
    } catch (error) {
      console.error("Erro ao salvar serviço:", error);
    }
  };

  const removerServico = async (id) => {
    try {
      const servDoc = doc(db, "usuarios", userUid, "servicos", id);
      await deleteDoc(servDoc);
      setServicos(servicos.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Erro ao remover serviço:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Cadastro de Serviços</h1>
      <form onSubmit={salvarServico} className="space-y-3 mb-6">
        <input
          type="text"
          placeholder="Nome do serviço"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="input input-bordered w-full"
        />
        <input
          type="text"
          placeholder="Duração (ex: 60min)"
          value={duracao}
          onChange={(e) => setDuracao(e.target.value)}
          className="input input-bordered w-full"
        />
        <input
          type="number"
          placeholder="Preço"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          className="input input-bordered w-full"
        />
        <button type="submit" className="btn btn-primary w-full">Salvar</button>
      </form>

      <h2 className="text-xl font-semibold mb-3">Lista de Serviços</h2>
      <div className="flex gap-2 mb-4">
        <select
          value={filtroCampo}
          onChange={(e) => setFiltroCampo(e.target.value)}
          className="select select-bordered"
        >
          <option value="nome">Nome</option>
          <option value="duracao">Duração</option>
          <option value="preco">Preço</option>
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
        {servicos
          .filter((s) => {
            switch (filtroCampo) {
              case "nome":
                return s.nome.toLowerCase().includes(filtroValor);
              case "duracao":
                return s.duracao.toLowerCase().includes(filtroValor);
              case "preco":
                return s.preco.toString().toLowerCase().includes(filtroValor);
              default:
                return true;
            }
          })
          .map((s) => (
            <li
              key={s.id}
              className="flex justify-between items-center p-2 bg-base-200 rounded"
            >
              <span>
                {s.nome} — {s.duracao} — R$ {s.preco}
              </span>
              <button
                className="btn btn-error btn-sm"
                onClick={() => removerServico(s.id)}
              >
                Remover
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
}
