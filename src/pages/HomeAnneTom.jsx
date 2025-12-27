// src/pages/HomeAnneTom.jsx

import React, { useEffect, useMemo, useRef, useState } from "react";

import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useMenuData } from "../hooks/useMenuData";
import { formatCurrencyBRL } from "../utils/menu";
import { HOME_MENU_OVERRIDES, matchOverrides } from "../data/menuOverrides";

import { useAppAccessInfo } from "../hooks/useAppAccess";
import RetryBanner from "../components/ui/RetryBanner";

import SiteFooter from "../components/layout/SiteFooter";

const PIZZA_IMAGE_SRC = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 900 900'><rect fill='%23FAF6F0' width='900' height='900' rx='120'/><circle cx='450' cy='450' r='380' fill='%23f5c16c' stroke='%23a63f1b' stroke-width='50'/><circle cx='450' cy='450' r='270' fill='%23f9dd93'/><circle cx='450' cy='450' r='220' fill='%23f5c16c'/><circle cx='450' cy='450' r='190' fill='%238b2f0b'/><g stroke='%23f4b042' stroke-width='35'><line x1='450' y1='110' x2='450' y2='790'/><line x1='110' y1='450' x2='790' y2='450'/><line x1='190' y1='190' x2='710' y2='710'/><line x1='710' y1='190' x2='190' y2='710'/></g><g fill='%23f4b042'><circle cx='320' cy='340' r='35'/><circle cx='580' cy='300' r='30'/><circle cx='430' cy='560' r='32'/><circle cx='360' cy='520' r='26'/><circle cx='500' cy='420' r='28'/><circle cx='610' cy='520' r='24'/></g></svg>`;



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

  const { pizzas, loadingMenu, menuError, retry } = useMenuData();
  const { isAppWebView, isMobileBrowser, initialized } = useAppAccessInfo();
  const navigate = useNavigate();

  useEffect(() => {
    if (!initialized || !isAppWebView) return;
    navigate("/cardapio", { replace: true });
  }, [initialized, isAppWebView, navigate]);



  useEffect(() => {

    const onScroll = () => setScrolled(window.scrollY > 10);

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);

  }, []);

  

  const bestSellerItems = useMemo(() => {
    const overrides = matchOverrides(pizzas, HOME_MENU_OVERRIDES.bestSellers);
    if (overrides.length) return overrides.slice(0, 4);
    const best = pizzas.filter((pizza) => (pizza.badges || []).includes("best"));
    return best.slice(0, 4);
  }, [pizzas]);

  const veggieItems = useMemo(() => {
    const overrides = matchOverrides(pizzas, HOME_MENU_OVERRIDES.veggie);
    if (overrides.length) return overrides.slice(0, 3);
    const veggie = pizzas.filter((pizza) => (pizza.badges || []).includes("veggie"));
    return veggie.slice(0, 3);
  }, [pizzas]);

  const heroHighlights = useMemo(() => {
    if (HOME_MENU_OVERRIDES.heroHighlights.length) {
      return HOME_MENU_OVERRIDES.heroHighlights;
    }
    const highlights = [];
    if (bestSellerItems[0]) {
      highlights.push(`Mais pedidos: ${bestSellerItems[0].nome}`);
    }
    if (veggieItems[0]) {
      highlights.push(`Veggie em destaque: ${veggieItems[0].nome}`);
    }
    const newItem = pizzas.find((pizza) => (pizza.badges || []).includes("new"));
    if (newItem) {
      highlights.push(`Novidade: ${newItem.nome}`);
    }
    const promoItem = pizzas.find((pizza) => (pizza.badges || []).includes("promo"));
    if (promoItem) {
      highlights.push(`Promo: ${promoItem.nome}`);
    }
    return highlights.slice(0, 4);
  }, [bestSellerItems, veggieItems, pizzas]);

  const showDownloadAppSection = !isAppWebView && isMobileBrowser;




  return (

    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">

      <div className="animate-page-in">

        <Header scrolled={scrolled} />



        <main className="pt-16 sm:pt-18">

        <Hero imageLoaded={imageLoaded} setImageLoaded={setImageLoaded} highlights={heroHighlights} />

        {menuError && <RetryBanner message={menuError} onRetry={retry} />}

        {showDownloadAppSection && <DownloadAppSection />}



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

                text="Fermentação de 48h, borda crocante e miolo arejado para noites sem peso."

              />

              <FeatureCard

                icon="🧀"

                title="Recheio generoso"

                text="Queijos premium, ingredientes frescos e receitas autorais com carinho de bairro."

              />

              <FeatureCard

                icon="🚙"

                title="Entrega caprichada"

                text="Pedidos embalados com cuidado para chegar quentinhos e prontos para o seu sofá."

              />

            </div>

          </SectionWrapper>



          {/* MAIS VENDIDAS */}

          <BestSellers items={bestSellerItems} loading={loadingMenu} menuError={menuError} />



          {/* PIZZAS VEGGIE / LEVES */}

          <VeggieSection items={veggieItems} loading={loadingMenu} menuError={menuError} />



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



        <SiteFooter />

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

const Header = ({ scrolled }) => {
  const location = useLocation();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const moreRef = useRef(null);

  useEffect(() => {
    setIsMoreOpen(false);
    setIsMobileOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const onClick = (event) => {
      if (!moreRef.current) return;
      if (!moreRef.current.contains(event.target)) {
        setIsMoreOpen(false);
      }
    };

    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const isHashActive = (hash) =>
    location.pathname === "/" && location.hash === hash;

  const pillClass = (active) =>
    [
      "px-2 py-1 rounded-full transition",
      active
        ? "bg-slate-900 text-white"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    ].join(" ");

  const dropdownItemClass = (active) =>
    [
      "block w-full text-left px-3 py-2 rounded-lg transition",
      active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100",
    ].join(" ");

  return (
    <header
      className={
        "fixed top-0 inset-x-0 z-20 transition-all duration-300 " +
        (scrolled
          ? "bg-white/95 border-b border-slate-200 shadow-sm backdrop-blur"
          : "bg-white/90 border-b border-transparent")
      }
    >
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Logo + Local */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/logopizzaria.png"
            alt="Anne & Tom Pizzaria"
            className="w-10 h-10 object-contain"
          />
          <div className="leading-tight">
            <p className="text-[13px] font-semibold tracking-tight">
              Pizzaria Anne &amp; Tom
            </p>
            <p className="text-[11px] text-slate-500 -mt-0.5">
              Alto de Santana - Sao Paulo
            </p>
          </div>
        </Link>

        {/* Menu Desktop */}
        <nav className="hidden md:flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[12px] font-medium">
          <a href="#destaques" className={pillClass(isHashActive("#destaques"))}>
            Destaques
          </a>
          <a
            href="#mais-pedidas"
            className={pillClass(isHashActive("#mais-pedidas"))}
          >
            Mais vendidas
          </a>
          <a href="#veggie" className={pillClass(isHashActive("#veggie"))}>
            Pizzas veggie
          </a>
          <a
            href="#como-funciona"
            className={pillClass(isHashActive("#como-funciona"))}
          >
            Como funciona
          </a>
          <a
            href="#avaliacoes"
            className={pillClass(isHashActive("#avaliacoes"))}
          >
            Avaliacoes
          </a>

          <div className="relative" ref={moreRef}>
            <button
              type="button"
              className={pillClass(isMoreOpen)}
              onClick={() => setIsMoreOpen((prev) => !prev)}
              aria-haspopup="menu"
              aria-expanded={isMoreOpen}
            >
              Mais
              <span
                className={`ml-1 inline-block transition-transform duration-200 ${
                  isMoreOpen ? "rotate-180" : ""
                }`}
              >
                v
              </span>
            </button>

            <div
              className={`absolute right-0 mt-2 w-52 origin-top-right rounded-xl border border-slate-200 bg-white shadow-lg p-2 transition duration-150 ${
                isMoreOpen
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-95 pointer-events-none"
              }`}
            >
              <NavLink
                to="/sobre"
                className={({ isActive }) => dropdownItemClass(isActive)}
              >
                Sobre
              </NavLink>
              <NavLink
                to="/entrega"
                className={({ isActive }) => dropdownItemClass(isActive)}
              >
                Entrega
              </NavLink>
              <NavLink
                to="/promocoes"
                className={({ isActive }) => dropdownItemClass(isActive)}
              >
                Promocoes
              </NavLink>
              <NavLink
                to="/faq"
                className={({ isActive }) => dropdownItemClass(isActive)}
              >
                FAQ
              </NavLink>
              <NavLink
                to="/contato"
                className={({ isActive }) => dropdownItemClass(isActive)}
              >
                Contato
              </NavLink>
              <NavLink
                to="/cardapio"
                className={({ isActive }) => dropdownItemClass(isActive)}
              >
                Cardapio
              </NavLink>
            </div>
          </div>
        </nav>

        {/* Botoes */}
        <div className="flex items-center gap-2 pt-1 shrink-0">
          <Link
            to="/checkout"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 text-[11px] font-medium hover:bg-slate-50 transition whitespace-nowrap"
          >
            Ver Carrinho
          </Link>

          <Link
            to="/cardapio"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[12px] font-semibold shadow-sm hover:brightness-110 transition whitespace-nowrap"
          >
            Fazer Pedido
          </Link>

          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-full border border-slate-200 text-[11px]"
            aria-label="Abrir menu"
          >
            Menu
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition ${
          isMobileOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!isMobileOpen}
      >
        <button
          type="button"
          className={`absolute inset-0 bg-slate-900/40 transition-opacity ${
            isMobileOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsMobileOpen(false)}
          aria-label="Fechar menu"
        />
        <div
          className={`absolute right-0 top-0 h-full w-72 bg-white shadow-xl p-5 flex flex-col gap-4 transition-transform duration-200 ${
            isMobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Menu</p>
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="text-xs text-slate-500"
            >
              Fechar
            </button>
          </div>

          <div className="space-y-2 text-sm">
            <a href="#destaques" className={pillClass(isHashActive("#destaques"))}>
              Destaques
            </a>
            <a
              href="#mais-pedidas"
              className={pillClass(isHashActive("#mais-pedidas"))}
            >
              Mais vendidas
            </a>
            <a href="#veggie" className={pillClass(isHashActive("#veggie"))}>
              Pizzas veggie
            </a>
            <a
              href="#como-funciona"
              className={pillClass(isHashActive("#como-funciona"))}
            >
              Como funciona
            </a>
            <a
              href="#avaliacoes"
              className={pillClass(isHashActive("#avaliacoes"))}
            >
              Avaliacoes
            </a>
          </div>

          <div className="border-t border-slate-200 pt-3 space-y-2 text-sm">
            <NavLink
              to="/sobre"
              className={({ isActive }) => dropdownItemClass(isActive)}
            >
              Sobre
            </NavLink>
            <NavLink
              to="/entrega"
              className={({ isActive }) => dropdownItemClass(isActive)}
            >
              Entrega
            </NavLink>
            <NavLink
              to="/promocoes"
              className={({ isActive }) => dropdownItemClass(isActive)}
            >
              Promocoes
            </NavLink>
            <NavLink
              to="/faq"
              className={({ isActive }) => dropdownItemClass(isActive)}
            >
              FAQ
            </NavLink>
            <NavLink
              to="/contato"
              className={({ isActive }) => dropdownItemClass(isActive)}
            >
              Contato
            </NavLink>
            <NavLink
              to="/cardapio"
              className={({ isActive }) => dropdownItemClass(isActive)}
            >
              Cardapio
            </NavLink>
          </div>
        </div>
      </div>
    </header>
  );
};


/* HERO -------------------------------------------------------------- */

const Hero = ({ imageLoaded, setImageLoaded, highlights = [] }) => (

  <section className="bg-gradient-to-b from-amber-50 via-slate-50 to-slate-100">

    <div className="max-w-6xl mx-auto px-4 lg:px-6 py-12 lg:py-20 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">

      {/* TEXTO */}

      <div className="space-y-5 lg:space-y-7 animate-fade-up">

        <img

          src="/logopizzaria.png"

          alt="Anne & Tom Pizzaria"

          className="w-24 sm:w-28 h-auto object-contain"

        />

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



        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">

          <Link

            to="/cardapio"

            className="inline-flex items-center justify-center w-full sm:w-auto px-7 py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white text-sm md:text-base font-semibold shadow-sm hover:brightness-110 transition"

          >

            Pedir agora 🍕

          </Link>



          <a

            href="https://api.whatsapp.com/send?phone=5511932507007&text=Oi%20Anne%20%26%20Tom%2C%20quero%20fazer%20um%20pedido%20%F0%9F%8D%95"

            target="_blank"

            rel="noreferrer"

            className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 rounded-full border border-emerald-200 bg-white text-sm md:text-base text-emerald-700 hover:bg-emerald-50 transition"

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

        <div className="flex justify-center mt-6">
          <div className="relative w-full max-w-3xl rounded-3xl border border-slate-200 bg-gradient-to-r from-white via-slate-50 to-slate-100 px-6 py-6 text-center shadow-lg">
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 hidden rounded-full border border-amber-200 bg-white/80 p-4 shadow-sm md:block">
              <span className="text-amber-400 text-xl">★</span>
            </div>
            <p className="text-[13px] md:text-[14px] font-semibold uppercase tracking-[0.3em] text-slate-900">
              Mais de 15 mil pedidos entregues na Zona Norte
            </p>
            <p className="mt-2 text-[14px] leading-relaxed text-slate-600">
              Desde 2019, destacando-se como uma das pizzarias mais elogiadas com
              massa leve, ingredientes frescos e atendimento genuíno de bairro.
            </p>
          </div>
        </div>

        </div>

      </div>



      {/* IMAGEM */}

      <div className="relative flex justify-center lg:justify-end">

        <div className="w-full max-w-md aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-slate-100 animate-fade-in-image">

          {!imageLoaded && (

            <div className="w-full h-full bg-slate-200 animate-pulse" />

          )}



          <img

            src={PIZZA_IMAGE_SRC}

            alt="Pizza artesanal Anne & Tom"

            className={`w-full h-full object-cover transition-opacity duration-700 ${

              imageLoaded ? "opacity-100" : "opacity-0"

            }`}

            onLoad={() => setImageLoaded(true)}

            loading="lazy"

            decoding="async"

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

const BestSellers = ({ items = [], loading = false, menuError = "" }) => {
  const navigate = useNavigate();

  const handleOpen = (item) => {
    const params = new URLSearchParams();
    if (item?.id) {
      params.set("pizzaId", item.id);
    } else if (item?.name) {
      params.set("pizza", item.name);
    }
    const query = params.toString();
    navigate(query ? `/cardapio?${query}` : "/cardapio");
  };

  const fallbackItems = [
    {
      name: "Musa",
      desc: "Mucarela, tomate fresco, manjericao e toque de azeite.",
      badge: "Queridinha da casa",
      priceLabel: "a partir de R$ 60",
      icon: "*",
    },
    {
      name: "Namorados",
      desc: "Dois queijos, calabresa artesanal e cebola na medida.",
      badge: "Perfeita pra dividir",
      priceLabel: "a partir de R$ 69",
      icon: "<3",
    },
    {
      name: "Tres Coracoes",
      desc: "Trio de queijos marcantes com borda bem recheada.",
      badge: "Para amantes de queijo",
      priceLabel: "a partir de R$ 76",
      icon: "*",
    },
    {
      name: "Amor Perfeito",
      desc: "Sabor autoral com toque doce-salgado que surpreende.",
      badge: "Sabor autoral",
      priceLabel: "a partir de R$ 72",
      icon: "*",
    },
  ];

  const normalizedItems = items.length
    ? items.map((item) => {
        const price = item.preco_grande ?? item.preco_broto;
        return {
          id: item.id,
          name: item.nome,
          desc: (item.ingredientes || []).join(", ") || "Sabor da casa.",
          badge: "Mais pedidos",
          priceLabel: price
            ? `a partir de ${formatCurrencyBRL(price)}`
            : "Consulte no cardapio",
          icon: "*",
        };
      })
    : fallbackItems;

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

      {loading && (
        <p className="text-xs text-slate-500 text-center">
          Carregando sabores em destaque...
        </p>
      )}

      {menuError && !loading && (
        <p className="text-xs text-amber-700 text-center">{menuError}</p>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading && items.length === 0
          ? Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-5 h-40 animate-pulse"
              />
            ))
          : normalizedItems.map((item) => (
              <BestSellerCard key={item.id || item.name} item={item} onSelect={handleOpen} />
            ))}
      </div>

      <div className="flex justify-center pt-5">
        <Link
          to="/cardapio"
          className="inline-flex items-center justify-center px-7 py-3 rounded-full bg-slate-900 text-white text-sm md:text-base font-semibold hover:bg-slate-800 transition"
        >
          Ver cardapio completo
        </Link>
      </div>
    </SectionWrapper>
  );
};

const BestSellerCard = ({ item, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect?.(item)}
    className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-5 flex flex-col gap-2 hover:shadow-md hover:-translate-y-[2px] transition transform text-left"
  >
      <div className="flex items-center justify-between mb-1">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-50 text-[11px] font-medium text-amber-700">
          {item.badge}
        </span>
        <span className="text-lg font-bold text-amber-600" aria-hidden="true">
          {item.icon}
        </span>
      </div>
    <p className="text-sm md:text-base font-semibold text-slate-900">
      {item.name}
    </p>
    <p className="text-xs md:text-sm text-slate-500 leading-relaxed flex-1">
      {item.desc}
    </p>
    <p className="text-[12px] font-medium text-slate-700 mt-1">
      {item.priceLabel}
    </p>
    <span className="mt-2 text-[11px] text-amber-600 font-medium">
      Ver detalhes no cardapio ->
    </span>
  </button>
);

/* PIZZAS VEGGIE ------------------------------------------------------ */

const VeggieSection = ({ items = [], loading = false, menuError = "" }) => {
  const navigate = useNavigate();

  const handleOpen = (item) => {
    const params = new URLSearchParams();
    if (item?.id) {
      params.set("pizzaId", item.id);
    } else if (item?.name) {
      params.set("pizza", item.name);
    }
    const query = params.toString();
    navigate(query ? `/cardapio?${query}` : "/cardapio");
  };

  const fallbackItems = [
    {
      name: "Veggie Anne",
      icon: "*",
      desc: "Mucarela, brocolis, tomate seco e toque de alho.",
      tag: "Leve e bem temperada",
    },
    {
      name: "Quatro Queijos",
      icon: "*",
      desc: "Mucarela, provolone, parmesao e catupiry.",
      tag: "Classico sem carne",
    },
    {
      name: "Marguerita",
      icon: "*",
      desc: "Mucarela, tomate, manjericao fresco e azeite.",
      tag: "Veggie favorita",
    },
  ];

  const normalizedItems = items.length
    ? items.map((item) => ({
        id: item.id,
        name: item.nome,
        icon: "*",
        desc: (item.ingredientes || []).join(", ") || "Sabor leve e fresco.",
        tag: "Veggie",
      }))
    : fallbackItems;

  return (
    <SectionWrapper id="veggie" bg="bg-emerald-50/40" border="border-y border-emerald-100">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 mb-6">
        <SectionTitle
          eyebrow="Pizzas veggie e sem carne"
          title="Opcoes leves pra quem quer pegar mais leve"
          subtitle="Sabores sem carne, com bastante queijo e legumes bem escolhidos."
        />
        <div className="text-xs md:text-sm text-emerald-800 bg-emerald-100/70 border border-emerald-200 rounded-2xl px-4 py-2 max-w-xs">
          * <span className="font-semibold">Todas essas pizzas sao preparadas sem carne,</span> ideais pra quem prefere algo mais leve ou vegetariano.
        </div>
      </div>

      {loading && (
        <p className="text-xs text-emerald-700 text-center">
          Carregando opcoes veggie...
        </p>
      )}

      {menuError && !loading && (
        <p className="text-xs text-amber-700 text-center">{menuError}</p>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {loading && items.length === 0
          ? Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="bg-white rounded-2xl border border-emerald-100 shadow-sm px-4 py-5 h-36 animate-pulse"
              />
            ))
          : normalizedItems.map((item) => (
              <button
                key={item.id || item.name}
                type="button"
                onClick={() => handleOpen(item)}
                className="bg-white rounded-2xl border border-emerald-100 shadow-sm px-4 py-5 flex flex-col gap-2 hover:shadow-md hover:-translate-y-[2px] transition transform text-left"
              >
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-emerald-600">{item.icon}</span>
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
          </button>
        ))}
      </div>

      <div className="flex justify-center pt-5">
        <Link
          to="/cardapio"
          className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-emerald-300 bg-white text-sm md:text-base text-emerald-800 hover:bg-emerald-50 transition"
        >
          Ver apenas opcoes veggie no cardapio
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

  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-6 flex flex-col gap-3 items-center text-center hover:shadow-md hover:-translate-y-[1px] transition transform">

    <div className="text-3xl md:text-4xl">{icon}</div>

    <p className="text-sm md:text-base font-semibold text-slate-800">

      {title}

    </p>

    <p className="text-xs md:text-sm text-slate-500 leading-relaxed max-w-[260px]">

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



const APP_DOWNLOAD_WHATSAPP =
  "https://api.whatsapp.com/send?phone=5511932507007&text=Quero%20baixar%20o%20app%20Anne%20%26%20Tom";

const DownloadAppSection = () => (
  <section className="mx-4 lg:mx-0">
    <div className="max-w-6xl mx-auto transform rounded-3xl border border-slate-800 bg-slate-900 px-6 py-10 text-white shadow-2xl shadow-slate-900/30">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-300">
            App oficial
          </p>
          <h3 className="text-2xl font-black tracking-tight">
            Experiência ainda mais rápida no celular
          </h3>
          <p className="text-sm text-slate-300">
            Baixe o app da Anne &amp; Tom para receber notificações, salvar favoritos e abrir o cardápio com um toque sem carregar o site inteiro.
          </p>
        </div>
        <div className="grid w-full gap-3 sm:grid-cols-2">
          <a
            href={`${APP_DOWNLOAD_WHATSAPP}&text=Quero%20o%20link%20do%20app%20Android`}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/30 bg-white/10 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/20"
          >
            Android (Beta)
          </a>
          <a
            href={`${APP_DOWNLOAD_WHATSAPP}&text=Quero%20o%20link%20do%20app%20iOS`}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/30 bg-white/10 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/20"
          >
            iOS (em breve)
          </a>
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-400">
        Receba o link no WhatsApp e confirme sua instalação em segundos.
      </p>
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

  @media (prefers-reduced-motion: reduce) {
    .animate-page-in,
    .animate-fade-up,
    .animate-fade-in-image {
      animation-duration: 0.01s !important;
      animation-iteration-count: 1 !important;
      animation-fill-mode: both !important;
    }
  }

`;



export default HomeAnneTom;

