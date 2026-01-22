import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Imagens (substitua pelos seus arquivos)
import agendaImg from "../assets/videos/agenda.mp4";
import heroImg from "../assets/images/agenda.png";
import feature1Img from "../assets/images/agendamento.png";
import feature2Img from "../assets/images/clientes.png";
import feature3Img from "../assets/images/dashboard.png";
import testimonial1Img from "../assets/avatar/ana-pereira.png";
import testimonial2Img from "../assets/avatar/marcos-oliveira.webp";
import testimonial3Img from "../assets/avatar/roberto-souza.webp";


gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const cardsRef = useRef([]);
  const demoImgRef = useRef(null);

  useEffect(() => {
    // Hero zoom/fade
    gsap.from(heroRef.current, {
      scale: 1.2,
      opacity: 0,
      duration: 1.5,
      ease: "power3.out",
    });

    // Stagger nos cards
    gsap.from(cardsRef.current, {
      scrollTrigger: {
        trigger: cardsRef.current,
        start: "top 80%",
      },
      y: 50,
      opacity: 0,
      stagger: 0.2,
      duration: 1,
      ease: "power3.out",
    });

    // Parallax na imagem de demonstração
    gsap.from(demoImgRef.current, {
      scrollTrigger: {
        trigger: demoImgRef.current,
        start: "top 90%",
      },
      y: 100,
      opacity: 0,
      scale: 0.9,
      duration: 1.2,
      ease: "power3.out",
    });
  }, []);

  return (
    <div className="font-sans text-gray-800">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-32 px-6 text-center overflow-hidden"
      >
        <img
          src={heroImg}
          alt="Hero background"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative z-10">
          <h1 className="text-6xl font-extrabold mb-6 tracking-tight">
            Organize sua agenda em minutos
          </h1>
          <p className="text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            Um sistema simples e poderoso para profissionais e empresas que querem
            ganhar tempo e aumentar a produtividade.
          </p>
          <button
            onClick={() => navigate("/solicitaracesso")}
            className="btn btn-success btn-lg rounded-full shadow-xl px-10 py-5 text-xl hover:scale-110 transition-transform"
          >
            Começar teste grátis
          </button>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-20 px-6 bg-white text-center">
        <h2 className="text-4xl font-bold mb-12">Por que escolher nossa Agenda?</h2>
        <div
          ref={cardsRef}
          className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto"
        >
          {[
            { img: feature1Img, title: "Economize tempo", desc: "Agendamentos automáticos e sem complicação." },
            { img: feature2Img, title: "Acesse de qualquer lugar", desc: "Compatível com desktop e mobile." },
            { img: feature3Img, title: "Relatórios claros", desc: "Visualize métricas e tome decisões rápidas." },
          ].map((item, i) => (
            <div
              key={i}
              className="p-8 shadow-xl rounded-xl bg-base-100 hover:scale-105 transform transition duration-300"
            >
              <img src={item.img} alt={item.title} className="w-95 h-45 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold mt-2">{item.title}</h3>
              <p className="mt-4 text-lg opacity-80">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demonstração */}
      <section className="py-20 px-6 bg-gray-50 text-center">
        <h2 className="text-4xl font-bold mb-12">Veja como funciona</h2>
        <video
          ref={demoImgRef}
          src={agendaImg}
          controls
          autoPlay
          loop
          muted
          className="rounded-2xl shadow-2xl mx-auto max-w-4xl"
        />
      </section>




      {/* Prova social */}
      <section className="py-20 px-6 bg-white text-center">
        <h2 className="text-4xl font-bold mb-12">O que nossos clientes dizem</h2>
        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {[
            { 
              text: "A agenda revolucionou meu consultório. Nunca mais perdi um horário!", 
              author: "Ana, Psicóloga", 
              img: testimonial1Img 
            },
            { 
              text: "Simples, rápido e eficiente. Meus clientes adoram a praticidade.", 
              author: "Marcos, Personal Trainer", 
              img: testimonial2Img 
            },
            { 
              text: "O dashboard me dá clareza total sobre meu negócio.", 
              author: "Roberto, Esteticista", 
              img: testimonial3Img 
            },
          ].map((dep, i) => (
            <div
              key={i}
              className="p-8 shadow-lg rounded-xl bg-base-100 hover:scale-105 transition duration-300"
            >
              <img
                src={dep.img}
                alt={`Foto de ${dep.author}`}
                className="w-16 h-16 mx-auto rounded-full mb-4 object-cover"
              />
              <p className="text-lg italic opacity-90">"{dep.text}"</p>
              <span className="block mt-6 font-semibold text-indigo-600">— {dep.author}</span>
            </div>
          ))}
        </div>
      </section>


      {/* CTA Final */}
      <section className="bg-indigo-700 text-white py-24 px-6 text-center relative overflow-hidden">
        <h2 className="text-5xl font-extrabold mb-8">
          Pronto para transformar sua rotina?
        </h2>
        <p className="text-2xl mb-10 opacity-90">
          Teste grátis por 7 dias. Sem cartão de crédito.
        </p>
        <button
          onClick={() => navigate("/solicitaracesso")}
          className="btn btn-success btn-lg rounded-full shadow-xl px-12 py-6 text-xl hover:scale-110 transition-transform"
        >
          Começar teste grátis agora
        </button>
      </section>

      {/* Rodapé */}
      <footer className="bg-indigo-700 text-gray-300 py-10 text-center">
        <p>© {new Date().getFullYear()} Agenda SaaS. Todos os direitos reservados.</p>
        <p className="mt-2">Criado por: Gabriel Dias</p>
      </footer>
    </div>
  );
}
