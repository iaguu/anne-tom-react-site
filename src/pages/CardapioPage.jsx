// ===============================================
// CARDÁPIO INTERNO • ANNE & TOM
// Versão completa com:
// - Badges de destaque
// - Extras dinâmicos da API
// - Sugestões para upsell
// - Meio a meio
// - Busca, categorias
// - Modal profissional
// - Cache local do cardápio
// - Bloqueio por horário de funcionamento
// ===============================================

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatCurrencyBRL } from "../utils/menu";
import { useMenuData } from "../hooks/useMenuData";
import RetryBanner from "../components/ui/RetryBanner";
import { useAppAccessInfo } from "../hooks/useAppAccess";

// Horários oficiais (Tripadvisor):
// Domingo: 19:00–23:00
// Segunda: fechado
// Terça a Sábado: 19:00–23:00
const OPENING_HOURS = {
  0: { open: 18 * 60, close: 23 * 60 }, // Domingo
  1: null, // Segunda fechado
  2: { open: 18 * 60, close: 24 * 60 },
  3: { open: 18 * 60, close: 23 * 60 },
  4: { open: 18 * 60, close: 23 * 60 },
  5: { open: 18 * 60, close: 23 * 60 },
  6: { open: 18 * 60, close: 23 * 60 }, // Sábado
};

const FILTER_STORAGE_KEY = "anne_tom_cardapio_filters_v1";

const OPENING_LABEL = "Terça a domingo das 19h às 23h (segunda fechado)";

function isPizzariaOpen(now = new Date()) {
  const dow = now.getDay(); // 0-dom, 1-seg...
  const rule = OPENING_HOURS[dow];
  if (!rule) return false;
  const minutes = now.getHours() * 60 + now.getMinutes();
  return minutes >= rule.open && minutes < rule.close;
}

// Abas por destaque / promoções / categorias especiais
const BADGE_TABS = [
  { key: "all", label: "Todos" },
  { key: "best", label: "Mais pedidos" },
  { key: "new", label: "Novidades" },
  { key: "veggie", label: "Veggie" },
  { key: "hot", label: "Picantes" },
  { key: "esfiha", label: "Big Esfihas" },
  { key: "promo", label: "Combos & Promoções" },
  { key: "doces", label: "Pizzas doces" },
];

// Label bonitinho para categoria
const prettyCategory = (c) => {
  if (!c) return "";
  if (c === "todas") return "Todas";
  const lower = String(c).toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

// Converte badges "humanos" do JSON em códigos usados nas abas
// e também tenta inferir por nome/categoria/ingredientes
const CardapioPage = () => {
  const { addItem, items, total } = useCart();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  // ---- Estados Gerais ----
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("todas");
  const [badgeFilter, setBadgeFilter] = useState("all");
  const [showBackToTop, setShowBackToTop] = useState(false);
  // ---- Horário de funcionamento ----
  const [isOpenNow, setIsOpenNow] = useState(isPizzariaOpen());

  const { isAppWebView, initialized: appInfoReady } = useAppAccessInfo();
  const [showAppToast, setShowAppToast] = useState(false);

  const { pizzas, loadingMenu, menuError, isUsingCachedMenu, retry } =
    useMenuData();

  useEffect(() => {
    try {
      const raw = window.localStorage?.getItem(FILTER_STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved?.categoria) setCategoria(saved.categoria);
      if (saved?.badgeFilter) setBadgeFilter(saved.badgeFilter);
      if (typeof saved?.search === "string") setSearch(saved.search);
    } catch (_err) {
      // ignore
    }
  }, []);

  const targetPizzaId = searchParams.get("pizzaId");
  const targetPizzaName = searchParams.get("pizza");

  useEffect(() => {
    try {
      const payload = { categoria, badgeFilter, search };
      window.localStorage?.setItem(FILTER_STORAGE_KEY, JSON.stringify(payload));
    } catch (_err) {
      // ignore
    }
  }, [categoria, badgeFilter, search]);

  useEffect(() => {
    const update = () => setIsOpenNow(isPizzariaOpen());
    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!appInfoReady || !isAppWebView) return undefined;
    setShowAppToast(true);
    const timer = window.setTimeout(() => setShowAppToast(false), 3500);
    return () => window.clearTimeout(timer);
  }, [appInfoReady, isAppWebView]);

  // ---- Modal ----
  const [selectedPizza, setSelectedPizza] = useState(null);
  const cardRefs = useRef({});
  const modalRef = useRef(null);
  const [tamanho, setTamanho] = useState("grande");
  const [quantidade, setQuantidade] = useState(1);
  const [isMeioMeio, setIsMeioMeio] = useState(false);
  const [meioId, setMeioId] = useState("");
  const [extrasSelecionados, setExtrasSelecionados] = useState([]);
  const [obsPizza, setObsPizza] = useState("");
  const [focusExtras, setFocusExtras] = useState(false);
  const [extrasOpen, setExtrasOpen] = useState(false);
  const extrasRef = useRef(null);

  const [highlightedPizzaId, setHighlightedPizzaId] = useState(null);

  // helper: impede adicionar se estiver fechado
  const ensureOpenOrWarn = () => {
    if (isOpenNow) return true;
    alert(
      `A Pizzaria Anne & Tom está fechada agora.\n\nHorário de funcionamento: ${OPENING_LABEL}.`
    );
    return false;
  };

  // Categorias dinamicas
  const categorias = useMemo(() => {
    const set = new Set(pizzas.map((p) => p.categoria).filter(Boolean));
    return ["todas", ...Array.from(set)];
  }, [pizzas]);

  // Filtro principal (categoria + busca + aba de badges)
  const pizzasFiltradas = useMemo(() => {
    const termo = search.toLowerCase();

    return pizzas.filter((p) => {
      const categoriaUpper = String(p.categoria || "").toUpperCase();

      const okCat =
        categoria === "todas" || p.categoria === categoria;

      const texto = `${p.nome} ${p.categoria} ${(p.ingredientes || []).join(
        " "
      )}`.toLowerCase();
      const okBusca = texto.includes(termo);

      const badges = p.badges || [];

      let okBadge = true;
      if (badgeFilter === "all") {
        okBadge = true;
      } else if (badgeFilter === "promo") {
        okBadge = /PROMO|COMBO|OFERTA/.test(categoriaUpper);
      } else if (badgeFilter === "esfiha") {
        okBadge = categoriaUpper.includes("ESFIHA");
      } else if (badgeFilter === "doces") {
        okBadge = categoriaUpper.includes("DOCE");
      } else {
        // best, new, veggie, hot → via badges
        okBadge = badges.includes(badgeFilter);
      }

      return okCat && okBusca && okBadge;
    });
  }, [pizzas, categoria, search, badgeFilter]);

  // Pizza do meio
  const meioPizza = useMemo(() => {
    if (!meioId) return null;
    return pizzas.find((p) => p.id === meioId) || null;
  }, [meioId, pizzas]);

  // Preço base
  const precoBase =
    selectedPizza?.[
      tamanho === "broto" ? "preco_broto" : "preco_grande"
    ] || 0;

  // Preço meio a meio
  let precoUnitario = precoBase;
  if (selectedPizza && isMeioMeio && meioPizza) {
    const precoMeio =
      tamanho === "broto"
        ? meioPizza.preco_broto || 0
        : meioPizza.preco_grande || 0;
    precoUnitario = Math.max(precoBase, precoMeio);
  }

  // Preço extras
  const extrasDaPizza = selectedPizza?.extras || [];
  const extrasTotais = extrasDaPizza
    .filter((e) => extrasSelecionados.includes(e.id))
    .reduce((acc, e) => acc + (Number(e.preco) || 0), 0);

  // Total
  const precoTotal = (precoUnitario + extrasTotais) * quantidade;

  const abrirModal = (pizza, options = {}) => {
    if (options.highlight) {
      setHighlightedPizzaId(pizza.id);
      window.setTimeout(() => setHighlightedPizzaId(null), 2000);
    }
    const wantsExtras = Boolean(options.focusExtras);
    setFocusExtras(wantsExtras);
    setExtrasOpen(wantsExtras);
    setSelectedPizza(pizza);
    setQuantidade(1);
    setTamanho("grande");
    setIsMeioMeio(false);
    setMeioId("");
    setExtrasSelecionados([]);
    setObsPizza("");
  };

  useEffect(() => {
    if (!pizzas.length || selectedPizza) return;

    let found = null;
    if (targetPizzaId) {
      found = pizzas.find((pizza) => pizza.id === targetPizzaId);
    }

    if (!found && targetPizzaName) {
      const nameLower = targetPizzaName.toLowerCase();
      found = pizzas.find((pizza) =>
        String(pizza.nome || "").toLowerCase().includes(nameLower)
      );
    }

    if (found) {
      const node = cardRefs.current?.[found.id];
      if (node && node.scrollIntoView) {
        node.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      abrirModal(found, { highlight: true });
    }
  }, [pizzas, targetPizzaId, targetPizzaName, selectedPizza]);

  const fecharModal = useCallback(() => {
    setSelectedPizza(null);
    setFocusExtras(false);
    setExtrasOpen(false);

    if (searchParams.has("pizzaId") || searchParams.has("pizza")) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("pizzaId");
      nextParams.delete("pizza");
      setSearchParams(nextParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!selectedPizza) return undefined;

    const modalNode = modalRef.current;
    const focusableSelector =
      "a, button, input, textarea, select, [tabindex]:not([tabindex='-1'])";

    const focusables = modalNode
      ? Array.from(modalNode.querySelectorAll(focusableSelector)).filter(
          (el) => !el.hasAttribute("disabled")
        )
      : [];

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (first && first.focus) {
      first.focus();
    } else if (modalNode && modalNode.focus) {
      modalNode.focus();
    }

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        fecharModal();
      }

      if (event.key !== "Tab") return;

      if (!first || !last) {
        event.preventDefault();
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [selectedPizza, fecharModal]);

  useEffect(() => {
    if (!selectedPizza || !focusExtras || !extrasOpen) return;
    const node = extrasRef.current;
    if (node && node.scrollIntoView) {
      node.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedPizza, focusExtras, extrasOpen]);

  const handleAddToCart = () => {
    if (!selectedPizza) return;
    if (!ensureOpenOrWarn()) return;

    let nomeFinal = selectedPizza.nome;
    if (isMeioMeio && meioPizza)
      nomeFinal = `${selectedPizza.nome} / ${meioPizza.nome}`;

    const extrasNomes = extrasDaPizza
      .filter((e) => extrasSelecionados.includes(e.id))
      .map((e) => e.nome);

    addItem({
      id: `pizza-${selectedPizza.id}-${Date.now()}`,
      nome: nomeFinal,
      tamanho,
      quantidade,
      precoUnitario: precoUnitario + extrasTotais,
      meio: meioPizza?.nome || null,
      extras: extrasNomes,
      obsPizza: obsPizza.trim() || null,
    });

    fecharModal();
  };

  // total de itens no carrinho (para barra flutuante)
  const totalItensCarrinho = items.reduce(
    (acc, item) => acc + (Number(item.quantidade) || 0),
    0
  );

  return (
    <div className="premium-page min-h-screen">
      {/* HEADER */}
      <header className="premium-panel border-b bg-white/90 backdrop-blur">
        <div className="max-w-6xl mx-auto h-16 px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/logopizzaria.png"
              alt="Anne & Tom Pizzaria"
              className="w-10 h-10 object-contain"
            />
            <div>
              <p className="text-sm font-semibold">Pizzaria Anne & Tom</p>
              <p className="text-[11px] text-slate-500">Cardápio interno</p>
            </div>
          </Link>

          <button
            className="premium-button-ghost text-xs px-4 py-1.5"
            onClick={() => navigate("/checkout")}
          >
            🧾 Checkout
          </button>
        </div>
      </header>

      {showAppToast && (
        <div className="fixed left-1/2 top-24 z-40 w-[min(95%,360px)] -translate-x-1/2 rounded-2xl bg-slate-900 px-4 py-2 text-center text-xs font-semibold text-white shadow-lg">
          Você está no cardápio interno da Anne &amp; Tom.
        </div>
      )}

      {/* CONTEÚDO */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {menuError && <RetryBanner message={menuError} onRetry={retry} />}

        {/* Título */}
        <section className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-black">
            Escolha suas pizzas
          </h1>

          <p className="text-base text-slate-600">
            Clique para ver detalhes, montar meio a meio e adicionar extras.
          </p>

          {/* Banner de horário */}
          <div className="text-xs md:text-sm flex flex-wrap gap-2 items-center">
            <span className="px-2 py-1 rounded-full bg-slate-900 text-white text-[11px] uppercase tracking-wide">
              {isOpenNow ? "Aberto agora" : "Fechado no momento"}
            </span>
            <span className="text-slate-600">{OPENING_LABEL}</span>
            {isUsingCachedMenu && (
              <span className="text-[11px] text-amber-600">
                (Usando cardápio salvo no dispositivo)
              </span>
            )}
          </div>

          {/* BUSCA + CATEGORIA */}
          <div
            className="premium-panel sticky top-20 z-10 bg-white/90 backdrop-blur border border-slate-200 rounded-2xl px-4 py-4"
            style={{ top: "calc(72px + env(safe-area-inset-top, 0px))" }}
          >
          <label htmlFor="cardapio-search" className="sr-only">
            Buscar cardápio
          </label>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="premium-input flex-1">
              <span className="text-lg">🔍</span>
              <input
                id="cardapio-search"
                type="text"
                className="premium-input-field flex-1 text-sm md:text-base"
                placeholder="Buscar por nome ou ingrediente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="premium-select w-full md:w-56 text-sm md:text-base"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              {categorias.map((c) => (
                <option key={c} value={c}>
                  {prettyCategory(c)}
                </option>
              ))}
            </select>
          </div>
        </div>

          {loadingMenu && (
            <p className="text-xs text-slate-500">Carregando...</p>
          )}
          {menuError && (
            <p
              className="text-xs text-amber-700"
              role="status"
              aria-live="polite"
            >
              {menuError}
            </p>
          )}
        </section>

        {/* LISTA */}
        <section className="space-y-4 pb-16">
          <h2 className="text-xs uppercase font-semibold text-slate-500 tracking-wide">
            Sabores disponíveis
          </h2>

          {/* ABAS DE DESTAQUE */}
          <div className="flex flex-wrap gap-2 mb-2">
            {BADGE_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setBadgeFilter(tab.key)}
                className={`premium-pill min-h-[44px] text-xs md:text-sm ${
                  badgeFilter === tab.key ? "premium-pill--active" : ""
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {pizzasFiltradas.map((pizza) => {
              const priceParts = [];
              if (pizza.preco_grande != null) {
                priceParts.push(`Grande ${formatCurrencyBRL(pizza.preco_grande)}`);
              }
              if (pizza.preco_broto != null) {
                priceParts.push(`Broto ${formatCurrencyBRL(pizza.preco_broto)}`);
              }
              const ariaLabel = `${pizza.nome} ${
                priceParts.length ? `– ${priceParts.join(" / ")}` : ""
              } | ${prettyCategory(pizza.categoria)}`;

              return (
                <button
                  key={pizza.id}
                  ref={(node) => {
                    if (node) cardRefs.current[pizza.id] = node;
                  }}
                  onClick={() => abrirModal(pizza)}
                  aria-label={ariaLabel}
                  className={`premium-card text-left bg-white border rounded-2xl p-5 flex gap-4 hover:shadow-lg transition-shadow ${highlightedPizzaId === pizza.id ? "border-amber-400 ring-2 ring-amber-200" : "border-slate-200"}`}
                >
                  {/* imagem */}
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-200 via-orange-300 to-red-300 flex items-center justify-center text-3xl">
                  <span aria-hidden="true">🍕</span>
                  </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs uppercase text-slate-400">
                      {prettyCategory(pizza.categoria)}
                    </p>

                    <h3 className="text-base md:text-lg font-semibold">
                      {pizza.nome}
                    </h3>

                    {/* INGREDIENTES */}
                    <p className="text-xs md:text-sm text-slate-500 mt-1">
                      {pizza.ingredientes?.join(", ")}
                    </p>

                    {/* BADGES */}
                    <div className="flex gap-1 flex-wrap mt-2">
                      {pizza.extras?.length > 0 && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            abrirModal(pizza, { focusExtras: true });
                          }}
                          className="px-2 py-0.5 text-[11px] bg-slate-100 text-slate-600 rounded-full"
                        >
                          Adicionais
                        </button>
                      )}
                      {pizza.badges?.includes("best") && (
                        <span className="px-2 py-0.5 text-[11px] bg-amber-100 text-amber-700 rounded-full">
                          ⭐ Mais pedido
                        </span>
                      )}
                      {pizza.badges?.includes("new") && (
                        <span className="px-2 py-0.5 text-[11px] bg-sky-100 text-sky-600 rounded-full">
                          🆕 Novo
                        </span>
                      )}
                      {pizza.badges?.includes("hot") && (
                        <span className="px-2 py-0.5 text-[11px] bg-red-100 text-red-600 rounded-full">
                          🌶️ Picante
                        </span>
                      )}
                      {pizza.badges?.includes("veggie") && (
                        <span className="px-2 py-0.5 text-[11px] bg-emerald-100 text-emerald-700 rounded-full">
                          🥬 Veggie
                        </span>
                      )}
                      {pizza.badges?.includes("promo") && (
                        <span className="px-2 py-0.5 text-[11px] bg-purple-100 text-purple-700 rounded-full">
                          💥 Promo
                        </span>
                      )}
                    </div>
                  </div>

                  {/* PREÇOS */}
                  <div className="text-sm mt-3 font-medium text-slate-800">
                    {pizza.preco_broto != null && (
                      <span className="mr-3 block md:inline">
                        Broto:{" "}
                        <span className="font-semibold">
                          {formatCurrencyBRL(pizza.preco_broto)}
                        </span>
                      </span>
                    )}
                    {pizza.preco_grande != null && (
                      <span>
                        Grande:{" "}
                        <span className="font-semibold">
                          {formatCurrencyBRL(pizza.preco_grande)}
                        </span>
                      </span>
                    )}
                  </div>
                  </div>
                </button>
              );
            })}

            {!loadingMenu && pizzasFiltradas.length === 0 && (
              <p className="text-sm text-slate-500">
                Nenhum sabor encontrado.
              </p>
            )}
          </div>
        </section>
      </main>
      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="premium-button-ghost fixed bottom-6 right-6 z-30 text-xs px-4 py-2 shadow-lg"
        >
          Voltar ao topo
        </button>
      )}


      {/* MODAL */}
      {selectedPizza && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4 md:p-6">
          <div className="w-full max-w-xl max-h-[90vh]">
            <div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              tabIndex={-1}
              className="premium-card bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-cardapio-modal"
            >
              {/* topo (imagem) */}
              <div className="h-40 bg-slate-100 flex items-center justify-center shrink-0">
                <div className="w-32 h-32 bg-gradient-to-br from-amber-200 via-orange-300 to-red-300 rounded-full flex items-center justify-center text-4xl">
                  🍕
                </div>
              </div>

              {/* conteúdo scrollável */}
              <div className="p-6 space-y-5 overflow-y-auto">
                <div>
                  <h2 className="text-xl font-bold">
                    {selectedPizza.nome}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {selectedPizza.ingredientes?.join(", ")}
                  </p>
                </div>

                {/* TAMANHO */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                    Tamanho
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPizza.preco_broto != null && (
                      <button
                        onClick={() => setTamanho("broto")}
                        className={`premium-pill text-sm ${
                          tamanho === "broto" ? "premium-pill--active" : ""
                        }`}
                      >
                        Broto ·{" "}
                        {formatCurrencyBRL(selectedPizza.preco_broto)}
                      </button>
                    )}

                    {selectedPizza.preco_grande != null && (
                      <button
                        onClick={() => setTamanho("grande")}
                        className={`premium-pill text-sm ${
                          tamanho === "grande" ? "premium-pill--active" : ""
                        }`}
                      >
                        Grande ·{" "}
                        {formatCurrencyBRL(selectedPizza.preco_grande)}
                      </button>
                    )}
                  </div>
                </div>

                {/* MEIO A MEIO */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                    Pizza meio a meio
                  </p>
                  <label className="flex items-center justify-between px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm">
                    <span>
                      {isMeioMeio
                        ? "Meio a meio ativado"
                        : "Ativar meio a meio"}
                    </span>
                    <input
                      type="checkbox"
                      checked={isMeioMeio}
                      onChange={(e) => {
                        setIsMeioMeio(e.target.checked);
                        if (!e.target.checked) setMeioId("");
                      }}
                    />
                  </label>

                  {isMeioMeio && (
                    <select
                      className="premium-select w-full text-sm"
                      value={meioId}
                      onChange={(e) => setMeioId(e.target.value)}
                    >
                      <option value="">Selecione o segundo sabor</option>
                      {pizzas
                        .filter((p) => p.id !== selectedPizza.id)
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nome}
                          </option>
                        ))}
                    </select>
                  )}
                </div>

                {/* EXTRAS */}
                {selectedPizza.extras?.length > 0 && (
                  <div className="space-y-2">
                    <button
                      type="button"
                      aria-expanded={extrasOpen}
                      onClick={() => {
                        setExtrasOpen((prev) => !prev);
                        setFocusExtras(true);
                      }}
                      className="text-xs font-medium text-slate-600 uppercase tracking-wide underline-offset-4 focus-visible:underline"
                    >
                      {extrasOpen ? "Ocultar adicionais" : "Mostrar adicionais"}
                    </button>
                    {extrasOpen && (
                      <div ref={extrasRef} className="space-y-2">
                        <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                          Adicionais
                        </p>

                        {selectedPizza.extras.map((ext) => (
                          <label
                            key={ext.id}
                            className="flex items-center justify-between px-3 py-2 border border-slate-300 bg-white rounded-xl text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={extrasSelecionados.includes(ext.id)}
                                onChange={() => {
                                  setExtrasSelecionados((prev) =>
                                    prev.includes(ext.id)
                                      ? prev.filter((x) => x !== ext.id)
                                      : [...prev, ext.id]
                                  );
                                }}
                              />
                              <span>{ext.nome}</span>
                            </div>
                            <span>
                              +{" "}
                              {formatCurrencyBRL(
                                ext.preco ?? ext.price ?? 0
                              )}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* QUANTIDADE + TOTAL */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      className="premium-button-ghost w-9 h-9 text-lg"
                      onClick={() =>
                        setQuantidade((q) => Math.max(1, q - 1))
                      }
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-semibold text-base">
                      {quantidade}
                    </span>
                    <button
                      className="premium-button-ghost w-9 h-9 text-lg"
                      onClick={() => setQuantidade((q) => q + 1)}
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                      Total
                    </p>
                    <p className="text-lg font-semibold">
                      {formatCurrencyBRL(precoTotal)}
                    </p>
                  </div>
                </div>

                {/* OBS */}
                <textarea
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  placeholder="Observações (sem cebola, ponto da borda...)"
                  value={obsPizza}
                  onChange={(e) => setObsPizza(e.target.value)}
                />

                {/* SUGESTÕES */}
                {selectedPizza.sugestoes?.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                      Sugestão para acompanhar
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedPizza.sugestoes.map((s) => {
                        const precoSugestao = Number(
                          s.preco ??
                            s.price ??
                            s.valor ??
                            s.preco_grande ??
                            s.preco_broto ??
                            0
                        );
                        const idBase =
                          s.id ??
                          s.codigo ??
                          s.code ??
                          s.slug ??
                          s.nome ??
                          s.name ??
                          "item";

                        return (
                          <button
                            key={idBase}
                            className="px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl flex justify-between items-center text-sm hover:bg-slate-100"
                            onClick={() => {
                              if (!ensureOpenOrWarn()) return;
                              addItem({
                                id: `sugestao-${idBase}-${Date.now()}`,
                                nome: s.nome || s.name || "Item",
                                tamanho: "unico",
                                quantidade: 1,
                                precoUnitario: precoSugestao,
                              });
                            }}
                          >
                            <span className="truncate max-w-[160px]">
                              {s.nome || s.name}
                            </span>
                            <span className="font-semibold">
                              {formatCurrencyBRL(precoSugestao)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* BOTÕES */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    className="premium-button flex-1 px-6 py-3 text-sm md:text-base disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={handleAddToCart}
                    disabled={!isOpenNow}
                  >
                    {isOpenNow
                      ? `Adicionar ao carrinho · ${formatCurrencyBRL(
                          precoTotal
                        )}`
                      : "Pizzaria fechada no momento"}
                  </button>

                  <button
                    onClick={fecharModal}
                    className="premium-button-ghost px-4 py-2 text-xs md:text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ANIMAÇÃO */}
          <style>{`
            .animate-cardapio-modal {
              animation: modal 0.25s ease-out;
            }
            @keyframes modal {
              from { opacity: 0; transform: translateY(20px) scale(.96); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>
        </div>
      )}

      {/* BARRA FLUTUANTE DO CARRINHO */}
      {items.length > 0 && (
        <div className="fixed inset-x-0 bottom-3 z-30 flex justify-center pointer-events-none">
          <div className="pointer-events-auto max-w-6xl w-full px-4">
            <button
              onClick={() => navigate("/checkout")}
              className="premium-button w-full flex items-center justify-between gap-3 py-3 px-5 shadow-xl text-sm md:text-base"
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-black/10 text-xs">
                  {totalItensCarrinho}
                </span>
                <span>Ver carrinho e finalizar pedido</span>
              </div>
              <div className="flex items-center gap-2 font-semibold">
                <span>{formatCurrencyBRL(total)}</span>
                <span className="text-xs md:text-sm opacity-80">
                  Ir para checkout →
                </span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardapioPage;
