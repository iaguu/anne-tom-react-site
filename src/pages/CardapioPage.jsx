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

import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import server from "../api/server";

const MENU_CACHE_KEY = "anne_tom_menu_cache_v1";

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

const OPENING_LABEL = "Terça a domingo das 19h às 23h (segunda fechado)";

const formatCurrency = (value) =>
  (Number(value) || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

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
const normalizeBadgesFromItem = (item) => {
  const rawBadges = Array.isArray(item.badges) ? item.badges : [];
  const name = item.name || item.nome || "";
  const category = item.category || item.categoria || "";
  const ingredientes = Array.isArray(item.ingredientes)
    ? item.ingredientes
    : [];

  const text = `${name} ${category} ${ingredientes.join(" ")}`.toLowerCase();

  const badgesSet = new Set();

  // --- mapeia badges que vierem escritos ---
  rawBadges.forEach((b) => {
    const v = String(b || "").toLowerCase();

    if (v.includes("veggie") || v.includes("veg")) {
      badgesSet.add("veggie");
    } else if (
      v.includes("picante") ||
      v.includes("pimenta") ||
      v.includes("hot") ||
      v.includes("spicy")
    ) {
      badgesSet.add("hot");
    } else if (v.includes("mais pedido") || v.includes("best")) {
      badgesSet.add("best");
    } else if (
      v.includes("promo") ||
      v.includes("combo") ||
      v.includes("oferta")
    ) {
      badgesSet.add("promo");
    } else if (v.includes("novo") || v.includes("lançamento")) {
      badgesSet.add("new");
    }
  });

  // --- heurísticas extras, caso o JSON não traga badge explícito ---

  // Picante: se tiver pimenta no texto
  if (text.includes("pimenta") || text.includes("apiment")) {
    badgesSet.add("hot");
  }

  // Veggie: se não achar carne mas achar queijos/legumes
  const hasMeat =
    /calabresa|bacon|frango|carne|presunto|lombo|lingui[çc]a|peru|pepperoni|mignon|costela|salma[oã]|camar[aã]o|atum|anchov|peixe|pernil/i.test(
      text
    );

  const hasVeggieHint =
    /mussarela|muçarela|mozarela|queijo|ricota|gorgonzola|parmes[aã]o|catupiry|br[oó]colis|milho|palmito|escaraola|r[uú]cula|tomate|berinjela|abobrinha|cebola|piment[aã]o|champignon|azeitona|alcaparra|alho/i.test(
      text
    );

  if (!hasMeat && hasVeggieHint) {
    badgesSet.add("veggie");
  }

  // Mais pedido: sabores clássicos
  const normName = (name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (
    /musa|calabresa|portuguesa|frango com catupiry|anne & tom|anne e tom|mucuripe|4 queijos|quatro queijos|marguerita|margherita/.test(
      normName
    )
  ) {
    badgesSet.add("best");
  }

  return Array.from(badgesSet);
};

// Normaliza o JSON vindo da API (compatível com menu.txt)
function normalizePizzasFromJson(json) {
  let items = [];

  if (!json) items = [];
  else if (Array.isArray(json)) items = json;
  else if (Array.isArray(json.products)) items = json.products;
  else if (Array.isArray(json.items)) items = json.items;
  else items = [];

  const safeNumber = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  return items
    .filter((item) => {
      // ❌ Não exibir pausados/inativos
      if (item.active === false) return false;
      if (item.isAvailable === false) return false;

      // Só pizzas no cardápio principal
      return item.type === "pizza";
    })
    .map((item) => {
      const categoria = item.category || item.categoria || "Outros";
      const categoriaUpper = String(categoria).toUpperCase();

      let precoBroto = safeNumber(
        item.priceBroto ?? item.preco_broto
      );
      let precoGrande = safeNumber(
        item.priceGrande ?? item.preco_grande
      );

      // 🔥 Regra: BIG ESFIHAS não exibem "broto"
      // (tratamos como tamanho único = "Grande")
      if (categoriaUpper.includes("ESFIHA")) {
        const unitPrice =
          precoGrande != null ? precoGrande : precoBroto;
        precoBroto = null;
        precoGrande = unitPrice;
      }

      // Normaliza badges para os códigos usados nas abas
      const badges = normalizeBadgesFromItem(item);

      return {
        id: String(item.id),
        nome: item.name || item.nome || "",
        categoria,
        ingredientes: Array.isArray(item.ingredientes)
          ? item.ingredientes
          : [],
        preco_broto: precoBroto,
        preco_grande: precoGrande,
        badges,
        extras: Array.isArray(item.extras) ? item.extras : [],
        sugestoes: Array.isArray(item.sugestoes)
          ? item.sugestoes
          : [],
      };
    });
}

const CardapioPage = () => {
  const { addItem, items, total } = useCart();
  const navigate = useNavigate();

  // ---- Estados Gerais ----
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("todas");
  const [badgeFilter, setBadgeFilter] = useState("all");
  const [menuData, setMenuData] = useState(null);

  const [loadingMenu, setLoadingMenu] = useState(false);
  const [menuError, setMenuError] = useState("");
  const [isUsingCachedMenu, setIsUsingCachedMenu] = useState(false);

  // ---- Horário de funcionamento ----
  const [isOpenNow, setIsOpenNow] = useState(isPizzariaOpen());

  useEffect(() => {
    const update = () => setIsOpenNow(isPizzariaOpen());
    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, []);

  // ---- Modal ----
  const [selectedPizza, setSelectedPizza] = useState(null);
  const [tamanho, setTamanho] = useState("grande");
  const [quantidade, setQuantidade] = useState(1);
  const [isMeioMeio, setIsMeioMeio] = useState(false);
  const [meioId, setMeioId] = useState("");
  const [extrasSelecionados, setExtrasSelecionados] = useState([]);
  const [obsPizza, setObsPizza] = useState("");

  // helper: impede adicionar se estiver fechado
  const ensureOpenOrWarn = () => {
    if (isOpenNow) return true;
    alert(
      `A Pizzaria Anne & Tom está fechada agora.\n\nHorário de funcionamento: ${OPENING_LABEL}.`
    );
    return false;
  };

  // Carregar cardápio da API, com cache local
  useEffect(() => {
    let isMounted = true;

const fetchMenu = async () => {
  try {
    setLoadingMenu(true);
    setMenuError("");
    setIsUsingCachedMenu(false);

    const res = await server.fetchMenu()

    if (!res.ok) {
      throw new Error(`Falha no menu (HTTP ${res.status})`);
    }

    const contentType = res.headers.get("content-type") || "";

    // se não for JSON, provavelmente voltou HTML de aviso
    if (!contentType.includes("application/json")) {
      const text = await res.text();
      console.error(
        "[Cardapio] Resposta não JSON da API (provavelmente HTML do Ngrok):",
        text.slice(0, 400)
      );
      throw new Error("Resposta da API não está em JSON.");
    }

    const data = await res.json();

    if (!isMounted) return;

    setMenuData(data);
    setIsUsingCachedMenu(false);

    // salva no localStorage
    try {
      const payload = {
        data,
        savedAt: new Date().toISOString(),
      };
      window.localStorage?.setItem(
        MENU_CACHE_KEY,
        JSON.stringify(payload)
      );
    } catch (storageErr) {
      console.warn(
        "[Cardapio] Não foi possível salvar cache local:",
        storageErr
      );
    }
  } catch (err) {
    console.error("[Cardapio] Erro ao buscar API de menu:", err);

    if (!isMounted) return;

    // tenta cache local
    try {
      const cachedRaw = window.localStorage?.getItem(MENU_CACHE_KEY);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw);
        setMenuData(cached.data);
        setIsUsingCachedMenu(true);
        setMenuError(
          "Não foi possível conectar à API. Usando cardápio salvo neste dispositivo."
        );
      } else {
        setMenuError("Erro ao carregar cardápio. Tente novamente.");
      }
    } catch (cacheErr) {
      console.error("[Cardapio] Erro ao ler cache local:", cacheErr);
      setMenuError("Erro ao carregar cardápio. Tente novamente.");
    }
  } finally {
    if (isMounted) setLoadingMenu(false);
  }
};


    fetchMenu();
    return () => {
      isMounted = false;
    };
  }, []);

  // Normaliza
  const pizzas = useMemo(
    () => normalizePizzasFromJson(menuData),
    [menuData]
  );

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

  const abrirModal = (pizza) => {
    setSelectedPizza(pizza);
    setQuantidade(1);
    setTamanho("grande");
    setIsMeioMeio(false);
    setMeioId("");
    setExtrasSelecionados([]);
    setObsPizza("");
  };

  const fecharModal = () => setSelectedPizza(null);

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
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100">
      {/* HEADER */}
      <header className="border-b bg-white/90 backdrop-blur">
        <div className="max-w-6xl mx-auto h-16 px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center bg-slate-900 text-white text-xs font-black rounded-full">
              A&T
            </div>
            <div>
              <p className="text-sm font-semibold">Pizzaria Anne & Tom</p>
              <p className="text-[11px] text-slate-500">Cardápio interno</p>
            </div>
          </Link>

          <button
            className="text-xs border rounded-full px-4 py-1.5 bg-white hover:bg-slate-100"
            onClick={() => navigate("/checkout")}
          >
            🧾 Checkout
          </button>
        </div>
      </header>

      {/* CONTEÚDO */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
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
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-2.5">
              <span className="text-lg">🔍</span>
              <input
                type="text"
                className="flex-1 bg-transparent outline-none text-sm md:text-base"
                placeholder="Buscar por nome ou ingrediente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="w-full md:w-56 border border-slate-200 text-sm md:text-base px-3 py-2 rounded-full bg-white"
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

          {loadingMenu && (
            <p className="text-xs text-slate-500">Carregando...</p>
          )}
          {menuError && (
            <p className="text-xs text-amber-700">{menuError}</p>
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
                className={`px-3 py-1.5 rounded-full text-xs md:text-sm border transition-colors ${
                  badgeFilter === tab.key
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {pizzasFiltradas.map((pizza) => (
              <button
                key={pizza.id}
                onClick={() => abrirModal(pizza)}
                className="text-left bg-white border border-slate-200 rounded-2xl p-5 flex gap-4 hover:shadow-lg transition-shadow"
              >
                {/* imagem */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-200 via-orange-300 to-red-300 flex items-center justify-center text-3xl">
                  🍕
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
                          {formatCurrency(pizza.preco_broto)}
                        </span>
                      </span>
                    )}
                    {pizza.preco_grande != null && (
                      <span>
                        Grande:{" "}
                        <span className="font-semibold">
                          {formatCurrency(pizza.preco_grande)}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}

            {!loadingMenu && pizzasFiltradas.length === 0 && (
              <p className="text-sm text-slate-500">
                Nenhum sabor encontrado.
              </p>
            )}
          </div>
        </section>
      </main>

      {/* MODAL */}
      {selectedPizza && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4 md:p-6">
          <div className="w-full max-w-xl max-h-[90vh]">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-cardapio-modal">
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
                        className={`px-4 py-2 rounded-full border text-sm ${
                          tamanho === "broto"
                            ? "bg-slate-900 text-white"
                            : "bg-white border-slate-300"
                        }`}
                      >
                        Broto ·{" "}
                        {formatCurrency(selectedPizza.preco_broto)}
                      </button>
                    )}

                    {selectedPizza.preco_grande != null && (
                      <button
                        onClick={() => setTamanho("grande")}
                        className={`px-4 py-2 rounded-full border text-sm ${
                          tamanho === "grande"
                            ? "bg-slate-900 text-white"
                            : "bg-white border-slate-300"
                        }`}
                      >
                        Grande ·{" "}
                        {formatCurrency(selectedPizza.preco_grande)}
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
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
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
                          {formatCurrency(
                            ext.preco ?? ext.price ?? 0
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {/* QUANTIDADE + TOTAL */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      className="w-9 h-9 border border-slate-300 rounded-full text-lg"
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
                      className="w-9 h-9 border border-slate-300 rounded-full text-lg"
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
                      {formatCurrency(precoTotal)}
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
                              {formatCurrency(precoSugestao)}
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
                    className="flex-1 px-6 py-3 rounded-full bg-slate-900 text-white text-sm md:text-base font-semibold hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={handleAddToCart}
                    disabled={!isOpenNow}
                  >
                    {isOpenNow
                      ? `Adicionar ao carrinho · ${formatCurrency(
                          precoTotal
                        )}`
                      : "Pizzaria fechada no momento"}
                  </button>

                  <button
                    onClick={fecharModal}
                    className="px-4 py-2 rounded-full border border-slate-300 text-xs md:text-sm"
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
              className="w-full flex items-center justify-between gap-3 rounded-full bg-slate-900 text-white py-3 px-5 shadow-xl text-sm md:text-base"
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/10 text-xs">
                  {totalItensCarrinho}
                </span>
                <span>Ver carrinho e finalizar pedido</span>
              </div>
              <div className="flex items-center gap-2 font-semibold">
                <span>{formatCurrency(total)}</span>
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
