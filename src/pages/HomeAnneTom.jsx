// src/pages/HomeAnneTom.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

/* ===========================================================================
   HOME PAGE — ANNE & TOM
   Versão mais interativa, com:
   - Seção de Pizzas Veggie
   - Seção de Mais Vendidas
   - Ícones e textos um pouco maiores
   =========================================================================== */

const HomeAnneTom = () => {
  const [scrolled, setScrolled] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      <div className="animate-page-in">
        <Header scrolled={scrolled} />

        <main className="pt-20">
          <Hero imageLoaded={imageLoaded} setImageLoaded={setImageLoaded} />

          {/* DESTAQUES GERAIS */}
          <SectionWrapper
            id="destaques"
            bg="bg-white"
            border="border-t border-slate-100"
          >
            <SectionTitle
              eyebrow="Por que todo mundo comenta?"
              title="O que faz a Anne & Tom ser diferente?"
              subtitle="Detalhes que você sente no primeiro pedaço: da massa ao atendimento."
            />

            <div className="grid sm:grid-cols-3 gap-5">
              <FeatureCard
                icon="🥖"
                title="Massa levíssima"
                text="Fermentação lenta, massa descansada por 48h e borda crocante — mata a fome sem pesar."
              />
              <FeatureCard
                icon="🧀"
                title="Recheio generoso"
                text="Queijos selecionados, ingredientes frescos e combinações autorais que só tem aqui."
              />
              <FeatureCard
                icon="🚙"
                title="Entrega caprichada"
                text="Entrega pensada pra chegar quentinha e inteira, do forno até o seu sofá."
              />
            </div>
          </SectionWrapper>

          {/* MAIS VENDIDAS */}
          <BestSellers />

          {/* PIZZAS VEGGIE / LEVES */}
          <VeggieSection />

          {/* COMO FUNCIONA */}
          <HowItWorks />

          {/* AVALIAÇÕES */}
          <SectionWrapper
            id="avaliacoes"
            bg="bg-gradient-to-b from-white to-slate-100"
            border="border-y border-slate-100"
          >
            <SectionTitle
              eyebrow="Avaliações reais"
              title="Quem prova, recomenda"
              subtitle="Comentários de quem já transformou a noite de pizza em noite Anne & Tom."
            />

            <div className="grid md:grid-cols-3 gap-4">
              <Testimonial
                name="Lais Navarro"
                text="Pizza saborosa, chegou quentinha e no tempo combinado. Atendimento super atencioso."
              />
              <Testimonial
                name="Rachelle Françozo"
                text="Virou a pizzaria oficial de casa. Sabores autorais incríveis e massa muito leve."
              />
              <Testimonial
                name="Adriane R. Rosa"
                text="Produtos de ótima qualidade, cobertura caprichada e borda do jeito que eu gosto."
              />
            </div>
          </SectionWrapper>

          {/* BLOCO CONFRATERNIZAÇÃO */}
          <PartyBlock />

          {/* CTA FINAL */}
          <FinalCTA />
        </main>
      </div>

      {/* ANIMAÇÕES */}
      <style>{styles}</style>
    </div>
  );
};

/* ===========================================================================
   COMPONENTES
   =========================================================================== */

/* HEADER -------------------------------------------------------------- */
/* HEADER -------------------------------------------------------------- */
const Header = ({ scrolled }) => (
  <header
    className={
      "fixed top-0 inset-x-0 z-20 transition-all duration-300 " +
      (scrolled
        ? "bg-white/95 border-b border-slate-200 shadow-sm backdrop-blur"
        : "bg-white/90 border-b border-transparent")
    }
  >
    <div className="max-w-6xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
      {/* Logo + Local */}
      <Link to="/" className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-[11px] font-black text-white">
          A&T
        </div>
        <div className="leading-tight">
          <p className="text-[13px] font-semibold tracking-tight">
            Pizzaria Anne &amp; Tom
          </p>
          <p className="text-[11px] text-slate-500 -mt-0.5">
            Alto de Santana • São Paulo
          </p>
        </div>
      </Link>

      {/* Menu Desktop – menor */}
      <nav className="hidden md:flex items-center gap-5 text-[12px] font-medium text-slate-600">
        <a href="#destaques" className="hover:text-slate-900 transition">
          Destaques
        </a>
        <a href="#mais-pedidas" className="hover:text-slate-900 transition">
          Mais vendidas
        </a>
        <a href="#veggie" className="hover:text-slate-900 transition">
          Pizzas veggie
        </a>
        <a href="#como-funciona" className="hover:text-slate-900 transition">
          Como funciona
        </a>
        <a href="#avaliacoes" className="hover:text-slate-900 transition">
          Avaliações
        </a>
        <Link to="/cardapio" className="hover:text-slate-900 transition">
          Cardápio
        </Link>
      </nav>

      {/* Botões – levemente menores */}
      <div className="flex items-center gap-2">
        <Link
          to="/checkout"
          className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 text-[11px] font-medium hover:bg-slate-50 transition"
        >
          🧾 Ver Carrinho
        </Link>

        <Link
          to="/cardapio"
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[12px] font-semibold shadow-sm hover:brightness-110 transition"
        >
          🍕 Fazer Pedido
        </Link>
      </div>
    </div>
  </header>
);


/* HERO -------------------------------------------------------------- */
const Hero = ({ imageLoaded, setImageLoaded }) => (
  <section className="bg-gradient-to-b from-amber-50 via-slate-50 to-slate-100">
    <div className="max-w-6xl mx-auto px-4 lg:px-6 py-12 lg:py-20 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
      {/* TEXTO */}
      <div className="space-y-5 lg:space-y-7 animate-fade-up">
        <p className="uppercase text-[12px] tracking-[0.24em] text-amber-600">
          ZONA NORTE • SÃO PAULO
        </p>

        <h1 className="text-4xl sm:text-5xl lg:text-[3.2rem] font-black leading-tight text-slate-900">
          Pizza artesanal com massa leve, muito recheio e clima de pizzaria de
          bairro.
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-xl">
          Forno bem quente, massa descansada por 48h e ingredientes frescos.
          Você monta o pedido pelo cardápio interno e recebe a pizza do jeitinho
          que combinou.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            to="/cardapio"
            className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white text-sm md:text-base font-semibold shadow-sm hover:brightness-110 transition"
          >
            Pedir agora 🍕
          </Link>

          <a
            href="https://api.whatsapp.com/send?phone=5511932507007&text=Oi%20Anne%20%26%20Tom%2C%20quero%20fazer%20um%20pedido%20%F0%9F%8D%95"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-emerald-200 bg-white text-sm md:text-base text-emerald-700 hover:bg-emerald-50 transition"
          >
            💬 Pedir pelo WhatsApp
          </a>
        </div>

        {/* PROVA SOCIAL */}
        <div className="flex items-center gap-4 pt-3">
          <div className="flex -space-x-2">
            <AvatarBubble />
            <AvatarBubble shade="400" />
            <AvatarBubble shade="500" />
          </div>
          <p className="text-[12px] md:text-sm text-slate-500">
            Mais de{" "}
            <span className="font-semibold text-slate-800">
              1.500 pedidos entregues
            </span>{" "}
            em Santana e região.
          </p>
        </div>
      </div>

      {/* IMAGEM */}
      <div className="relative flex justify-center lg:justify-end">
        <div className="w-full max-w-md aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-slate-100 animate-fade-in-image">
          {!imageLoaded && (
            <div className="w-full h-full bg-slate-200 animate-pulse" />
          )}

          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkSMiKaN6KCRR0PVCV-zjtIYToLPuFEN1_Gw&s"
            alt="Pizza artesanal Anne & Tom"
            className={`w-full h-full object-cover transition-opacity duration-700 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
          />
        </div>

        {/* BALÃO */}
        <div className="hidden sm:block absolute -bottom-5 -left-4 bg-white/95 border border-slate-200 rounded-2xl px-4 py-3 shadow-md text-[12px] backdrop-blur">
          <p className="font-semibold text-slate-800">Massa descansada 48h</p>
          <p className="text-slate-500">Crocante por fora, macia por dentro.</p>
        </div>
      </div>
    </div>
  </section>
);

/* MAIS VENDIDAS ------------------------------------------------------ */
const BestSellers = () => {
  const items = [
    {
      name: "Musa",
      desc: "Muçarela, tomate fresco, manjericão e toque de azeite.",
      badge: "Queridinha da casa",
      price: "a partir de R$ 60",
      icon: "⭐",
    },
    {
      name: "Namorados",
      desc: "Dois queijos, calabresa artesanal e cebola na medida.",
      badge: "Perfeita pra dividir",
      price: "a partir de R$ 69",
      icon: "❤️",
    },
    {
      name: "Três Corações",
      desc: "Trio de queijos marcantes com borda bem recheada.",
      badge: "Para amantes de queijo",
      price: "a partir de R$ 76",
      icon: "💛",
    },
    {
      name: "Amor Perfeito",
      desc: "Sabor autoral com toque doce-salgado que surpreende.",
      badge: "Sabor autoral",
      price: "a partir de R$ 72",
      icon: "💘",
    },
  ];

  return (
    <SectionWrapper
      id="mais-pedidas"
      bg="bg-slate-50"
      border="border-y border-slate-100"
    >
      <SectionTitle
        eyebrow="Mais vendidas"
        title="Sabores que saem toda noite"
        subtitle="Alguns dos sabores que mais aparecem nos pedidos do dia a dia."
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <BestSellerCard key={item.name} item={item} />
        ))}
      </div>

      <div className="flex justify-center pt-5">
        <Link
          to="/cardapio"
          className="inline-flex items-center justify-center px-7 py-3 rounded-full bg-slate-900 text-white text-sm md:text-base font-semibold hover:bg-slate-800 transition"
        >
          Ver cardápio completo
        </Link>
      </div>
    </SectionWrapper>
  );
};

const BestSellerCard = ({ item }) => (
  <button
    type="button"
    className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-5 flex flex-col gap-2 hover:shadow-md hover:-translate-y-[2px] transition transform text-left"
  >
    <div className="flex items-center justify-between mb-1">
      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-50 text-[11px] font-medium text-amber-700">
        {item.badge}
      </span>
      <span className="text-2xl">{item.icon}</span>
    </div>
    <p className="text-sm md:text-base font-semibold text-slate-900">
      {item.name}
    </p>
    <p className="text-xs md:text-sm text-slate-500 leading-relaxed flex-1">
      {item.desc}
    </p>
    <p className="text-[12px] font-medium text-slate-700 mt-1">
      {item.price}
    </p>
    <span className="mt-2 text-[11px] text-amber-600 font-medium">
      Ver detalhes no cardápio →
    </span>
  </button>
);

/* PIZZAS VEGGIE ------------------------------------------------------ */
const VeggieSection = () => {
  const items = [
    {
      name: "Veggie Anne",
      icon: "🥬",
      desc: "Muçarela, brócolis, tomate seco e toque de alho.",
      tag: "Leve e bem temperada",
    },
    {
      name: "Quatro Queijos",
      icon: "🧀",
      desc: "Muçarela, provolone, parmesão e catupiry.",
      tag: "Clássico sem carne",
    },
    {
      name: "Marguerita",
      icon: "🍅",
      desc: "Muçarela, tomate, manjericão fresco e azeite.",
      tag: "Veggie favorita",
    },
  ];

  return (
    <SectionWrapper
      id="veggie"
      bg="bg-emerald-50/40"
      border="border-y border-emerald-100"
    >
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 mb-6">
        <SectionTitle
          eyebrow="Pizzas veggie e sem carne"
          title="Opções leves pra quem quer pegar mais leve"
          subtitle="Sabores sem carne, com bastante queijo e legumes bem escolhidos."
        />
        <div className="text-xs md:text-sm text-emerald-800 bg-emerald-100/70 border border-emerald-200 rounded-2xl px-4 py-2 max-w-xs">
          🥗{" "}
          <span className="font-semibold">
            Todas essas pizzas são preparadas sem carne,
          </span>{" "}
          ideais pra quem prefere algo mais leve ou vegetariano.
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item.name}
            className="bg-white rounded-2xl border border-emerald-100 shadow-sm px-4 py-5 flex flex-col gap-2 hover:shadow-md hover:-translate-y-[2px] transition transform"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{item.icon}</span>
              <p className="text-sm md:text-base font-semibold text-slate-900">
                {item.name}
              </p>
            </div>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
              {item.desc}
            </p>
            <span className="mt-1 text-[11px] text-emerald-700 font-medium">
              {item.tag}
            </span>
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-5">
        <Link
          to="/cardapio"
          className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-emerald-300 bg-white text-sm md:text-base text-emerald-800 hover:bg-emerald-50 transition"
        >
          Ver apenas opções veggie no cardápio 🥬
        </Link>
      </div>
    </SectionWrapper>
  );
};

/* COMO FUNCIONA ------------------------------------------------------ */
const HowItWorks = () => (
  <SectionWrapper
    id="como-funciona"
    bg="bg-white"
    border="border-y border-slate-100"
  >
    <SectionTitle
      eyebrow="Sem complicação"
      title="Como funciona o pedido"
      subtitle="Você monta tudo pelo cardápio interno e finaliza em poucos toques."
    />

    <div className="grid md:grid-cols-3 gap-5">
      <StepCard
        index="1"
        title="Escolha os sabores"
        text="Abra o cardápio interno, veja os detalhes de cada sabor e escolha o tamanho ideal."
      />
      <StepCard
        index="2"
        title="Monte o carrinho"
        text="Adicione pizzas, bebidas e complementos. Tudo já sai calculado bonitinho."
      />
      <StepCard
        index="3"
        title="Finalize e envie"
        text="Revise o resumo no checkout e envie direto para o WhatsApp da pizzaria."
      />
    </div>
  </SectionWrapper>
);

const StepCard = ({ index, title, text }) => (
  <div className="bg-slate-50 rounded-2xl border border-slate-100 px-5 py-6 flex flex-col gap-2">
    <span className="w-8 h-8 flex items-center justify-center rounded-full bg-amber-500 text-[12px] font-bold text-white">
      {index}
    </span>
    <p className="text-sm md:text-base font-semibold text-slate-800">
      {title}
    </p>
    <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
      {text}
    </p>
  </div>
);

/* PARTY / CONFRATERNIZAÇÃO ------------------------------------------ */
const PartyBlock = () => (
  <section className="bg-gradient-to-r from-rose-50 via-amber-50 to-emerald-50 border-y border-amber-100">
    <div className="max-w-6xl mx-auto px-4 lg:px-6 py-10 lg:py-14 grid lg:grid-cols-[1.4fr_1fr] gap-8 items-center">
      <div className="space-y-3">
        <p className="uppercase text-[11px] tracking-[0.2em] text-rose-600">
          CONFRATERNIZAÇÃO • REUNIÃO • ANIVERSÁRIO
        </p>
        <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">
          Vai fazer encontro com a galera? Deixa a pizza por nossa conta.
        </h2>
        <p className="text-sm md:text-base text-slate-600 max-w-xl">
          Monte um pedido com vários sabores, combos e bebidas. A gente te ajuda
          a calcular quantas pizzas precisa, monta o resumo e combina tudo pelo
          WhatsApp.
        </p>

        <ul className="text-xs md:text-sm text-slate-600 space-y-1 pt-1">
          <li>• Sugestão de quantidade por número de pessoas</li>
          <li>• Opções mais em conta para grupos grandes</li>
          <li>• Horário combinado pra chegar na hora certa</li>
        </ul>

        <div className="flex flex-wrap gap-3 pt-3">
          <a
            href="https://api.whatsapp.com/send?phone=5511932507007&text=Oi%20Anne%20%26%20Tom%2C%20quero%20montar%20um%20pedido%20para%20confraterniza%C3%A7%C3%A3o%20%F0%9F%8E%89"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-emerald-500 text-white text-sm md:text-base font-semibold shadow-sm hover:bg-emerald-600 transition"
          >
            Falar sobre pedido grande 🎉
          </a>
          <Link
            to="/cardapio"
            className="inline-flex items-center justify-center px-5 py-3 rounded-full border border-slate-200 bg-white text-sm md:text-base text-slate-800 hover:bg-slate-50 transition"
          >
            Ver opções de sabores
          </Link>
        </div>
      </div>

      <div className="hidden lg:flex justify-end">
        <div className="w-full max-w-xs rounded-3xl bg-white/80 border border-slate-100 shadow-sm p-4 space-y-2 text-xs md:text-sm text-slate-600 backdrop-blur">
          <p className="text-[12px] font-semibold text-slate-800">
            Exemplo de pedido para 12 pessoas:
          </p>
          <ul className="space-y-1">
            <li>• 4 pizzas grandes de sabores mistos</li>
            <li>• 2 pizzas doces</li>
            <li>• Refrigerantes e água</li>
          </ul>
          <p className="text-[11px] text-slate-500 mt-1">
            A gente te ajuda a ajustar os sabores certinho pro seu grupo.
          </p>
        </div>
      </div>
    </div>
  </section>
);

/* COMPONENTES PEQUENOS ---------------------------------------------- */
const AvatarBubble = ({ shade = "300" }) => (
  <div
    className={`w-8 h-8 rounded-full bg-slate-${shade} border border-white`}
  />
);

const SectionWrapper = ({ children, id, bg, border }) => (
  <section id={id} className={`${bg} ${border}`}>
    <div className="max-w-6xl mx-auto px-4 lg:px-6 py-12 lg:py-16 space-y-6">
      {children}
    </div>
  </section>
);

const SectionTitle = ({ eyebrow, title, subtitle }) => (
  <div className="text-center space-y-3 max-w-3xl mx-auto">
    {eyebrow && (
      <p className="uppercase text-[11px] tracking-[0.2em] text-amber-600">
        {eyebrow}
      </p>
    )}
    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
      {title}
    </h2>
    <p className="text-sm md:text-base text-slate-500">{subtitle}</p>
  </div>
);

const FeatureCard = ({ icon, title, text }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-6 flex flex-col gap-2 hover:shadow-md hover:-translate-y-[1px] transition transform">
    <div className="text-3xl md:text-4xl">{icon}</div>
    <p className="text-sm md:text-base font-semibold text-slate-800">
      {title}
    </p>
    <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
      {text}
    </p>
  </div>
);

const Testimonial = ({ name, text }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-5 flex flex-col gap-2">
    <p className="text-[12px] text-amber-500">★★★★★</p>
    <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
      “{text}”
    </p>
    <p className="text-xs md:text-sm font-semibold text-slate-800 mt-1">
      {name}
    </p>
  </div>
);

/* CTA FINAL ---------------------------------------------------------- */
const FinalCTA = () => (
  <section className="bg-slate-900">
    <div className="max-w-6xl mx-auto px-4 lg:px-6 py-12 lg:py-16 text-center space-y-4 text-white">
      <h2 className="text-2xl lg:text-3xl font-black tracking-tight">
        Bora pedir uma Anne &amp; Tom hoje?
      </h2>

      <p className="text-sm md:text-base text-slate-200 max-w-2xl mx-auto">
        Monte seu pedido pelo cardápio interno, revise tudo no checkout e envie
        em segundos para o WhatsApp. Noite de pizza resolvida.
      </p>

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <Link
          to="/cardapio"
          className="px-6 md:px-7 py-3 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 text-sm md:text-base font-semibold shadow-sm hover:brightness-110 transition"
        >
          Montar meu pedido 🍕
        </Link>

        <Link
          to="/checkout"
          className="px-5 md:px-6 py-3 rounded-full border border-slate-500 bg-slate-800 text-sm md:text-base text-slate-50 hover:bg-slate-700 transition"
        >
          Ver resumo do carrinho 🧾
        </Link>
      </div>
    </div>
  </section>
);

/* ===========================================================================
   ANIMAÇÕES
   =========================================================================== */

const styles = `
  .animate-page-in {
    animation: pageIn 0.35s ease-out;
  }
  .animate-fade-up {
    animation: fadeUp 0.45s ease-out;
  }
  .animate-fade-in-image {
    animation: fadeInImage 0.6s ease-out;
  }

  @keyframes pageIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeInImage {
    from { opacity: 0; transform: scale(1.02); }
    to   { opacity: 1; transform: scale(1); }
  }
`;

export default HomeAnneTom;
