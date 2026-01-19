import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function LandingPage() {
  const navigate = useNavigate();

  // Variantes de animação
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="font-sans text-gray-800">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 px-6 text-center">
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.8 }}
          className="text-5xl font-bold mb-4"
        >
          Organize sua agenda em minutos
        </motion.h1>
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 1 }}
          className="text-xl mb-6 max-w-2xl mx-auto"
        >
          Um sistema simples e poderoso para profissionais e empresas que querem
          ganhar tempo e aumentar a produtividade.
        </motion.p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/solicitaracesso")}
          className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg transition cursor-pointer"
        >
          Começar teste grátis
        </motion.button>
      </section>

      {/* Benefícios */}
      <section className="py-16 px-6 bg-white text-center">
        <h2 className="text-3xl font-bold mb-10">Por que escolher nossa Agenda?</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { icon: "⏱️", title: "Economize tempo", desc: "Agendamentos automáticos e sem complicação." },
            { icon: "📱", title: "Acesse de qualquer lugar", desc: "Compatível com desktop e mobile." },
            { icon: "📊", title: "Relatórios claros", desc: "Visualize métricas e tome decisões rápidas." },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="p-6 shadow rounded-lg hover:shadow-xl transition transform hover:-translate-y-2"
            >
              <span className="text-4xl">{item.icon}</span>
              <h3 className="text-xl font-semibold mt-4">{item.title}</h3>
              <p className="mt-2">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Demonstração */}
      <section className="py-16 px-6 bg-gray-50 text-center">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          transition={{ duration: 0.8 }}
          className="text-3xl font-bold mb-10"
        >
          Veja como funciona
        </motion.h2>
        <motion.img
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          src="\src\assets\images\agenda.png"
          alt="Demonstração do sistema"
          className="rounded-lg shadow-lg mx-auto"
        />

      </section>

      {/* Prova social */}
      <section className="py-16 px-6 bg-white text-center">
        <h2 className="text-3xl font-bold mb-10">O que nossos clientes dizem</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { text: "A agenda revolucionou meu consultório. Nunca mais perdi um horário!", author: "Maria, Psicóloga" },
            { text: "Simples, rápido e eficiente. Meus clientes adoram a praticidade.", author: "João, Personal Trainer" },
            { text: "O dashboard me dá clareza total sobre meu negócio.", author: "Ana, Esteticista" },
          ].map((dep, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="p-6 shadow rounded-lg hover:shadow-lg transition"
            >
              <p>"{dep.text}"</p>
              <span className="block mt-4 font-semibold">— {dep.author}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-indigo-700 text-white py-20 px-6 text-center">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          transition={{ duration: 0.8 }}
          className="text-4xl font-bold mb-6"
        >
          Pronto para transformar sua rotina?
        </motion.h2>
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          transition={{ duration: 1 }}
          className="text-xl mb-8"
        >
          Teste grátis por 7 dias. Sem cartão de crédito.
        </motion.p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/solicitaracesso")}
          className="bg-green-500 hover:bg-green-600 text-white px-10 py-5 rounded-full text-lg font-semibold shadow-lg transition cursor-pointer"
        >
          Começar teste grátis agora
        </motion.button>
      </section>

      {/* Rodapé */}
      <footer className="bg-indigo-700 text-gray-300 py-8 text-center">
        <p>© {new Date().getFullYear()} Agenda SaaS. Todos os direitos reservados.</p>
        <p>Criado por: Gabriel Dias</p>
      </footer>
    </div>
  );
}