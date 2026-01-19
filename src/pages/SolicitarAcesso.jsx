import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

export default function SolicitarAcesso() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [telefone, setTelefone] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [erro, setErro] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");


  
  
    if (!nome.trim() || !email.trim()) {
      setErro("Nome e email são obrigatórios.");
      return;
    }

    try {
      await addDoc(collection(db, "solicitacoes"), {
        nome,
        email,
        empresa,
        telefone,
        mensagem,
        status: "pendente",
        createdAt: new Date().toISOString(),
      });

      setSucesso("Solicitação enviada com sucesso! Aguarde aprovação.");
      setNome("");
      setEmail("");
      setEmpresa("");
      setTelefone("");
      setMensagem("");
    } catch (error) {
      console.error("Erro ao salvar solicitação:", error);
      setErro("Erro ao enviar solicitação. Tente novamente.");
    }
  };
  const formatarTelefone = (valor) => {
    let numeros = valor.replace(/\D/g, "");
    if (!numeros.startsWith("55")) {
      numeros = "55" + numeros;
    }
    numeros = numeros.slice(0, 13);
    if (numeros.length >= 12) {
      return `+55 ${numeros.slice(2, 4)} ${numeros.slice(4, 9)}-${numeros.slice(9, 13)}`;
    }
    return "+55 " + numeros.slice(2);
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200">
      <div className="card w-full max-w-lg bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Solicitar Acesso</h2>
          <p className="mb-4 text-sm text-gray-600">
            Preencha o formulário abaixo para solicitar acesso ao sistema. Sua
            solicitação será analisada e você receberá um retorno por email.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Nome completo"
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
              type="text"
              placeholder="Empresa"
              className="input input-bordered w-full"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
            />
            <input
              type="text"
              placeholder="Telefone"
              className="input input-bordered w-full"
              value={telefone}
              onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
            />
            <textarea
              placeholder="Mensagem (opcional)"
              className="textarea textarea-bordered w-full"
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
            />

            {erro && <p className="text-error text-sm">{erro}</p>}
            {sucesso && <p className="text-success text-sm">{sucesso}</p>}

            <button type="submit" className="btn btn-primary w-full">
              Enviar Solicitação
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}