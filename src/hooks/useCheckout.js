// src/hooks/useCheckout.js
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

/* ================= CONFIG: API DESKTOP ================== */

const API_URL = "http://localhost:3030";

/* ================= CONFIG: TAXA POR BAIRRO ================== */

const TAXAS_POR_BAIRRO = {
  Santana: 6,
  "Alto de Santana": 7,
  Tucuruvi: 7,
  Mandaqui: 7,
  "Santa Teresinha": 7,
  "Casa Verde": 8,
  "Vila Guilherme": 9,
  "Outros bairros": 10,
};

const getTaxaPorBairro = (bairro) => {
  if (!bairro) return 0;
  if (TAXAS_POR_BAIRRO[bairro] != null) return TAXAS_POR_BAIRRO[bairro];
  if (TAXAS_POR_BAIRRO["Outros bairros"] != null) {
    return TAXAS_POR_BAIRRO["Outros bairros"];
  }
  return 0;
};

/* ================= WHATSAPP BUILDER ================== */

const montarTextoWhatsApp = (itens, cliente, totalFinal, pagamento) => {
  const itensStr = itens
    .map((i) => {
      const totalItem = (i.precoUnitario * i.quantidade)
        .toFixed(2)
        .replace(".", ",");

      const meio = i.meio ? ` · meio a meio com ${i.meio}` : "";
      const obsPizza = i.obsPizza ? `\n    Obs: ${i.obsPizza}` : "";
      const extrasTexto =
        Array.isArray(i.extras) && i.extras.length > 0
          ? `\n    Adicionais: ${i.extras.join(", ")}`
          : "";

      return `• ${i.quantidade}x ${i.nome} (${i.tamanho}${meio}) — R$ ${totalItem}${obsPizza}${extrasTexto}`;
    })
    .join("\n");

  return (
    `🍕 *Pedido Anne & Tom*` +
    `\n\n*Itens:*` +
    `\n${itensStr}` +
    `\n\n*Subtotal:* R$ ${cliente.subtotal.toFixed(2).replace(".", ",")}` +
    `\n*Taxa de entrega:* R$ ${cliente.taxaEntrega
      .toFixed(2)
      .replace(".", ",")}` +
    `\n*Desconto:* - R$ ${cliente.desconto.toFixed(2).replace(".", ",")}` +
    `\n\n*Total final:* R$ ${totalFinal.toFixed(2).replace(".", ",")}` +
    `\n*Pagamento:* ${pagamento.toUpperCase()}` +
    `\n\n*Cliente:* ${cliente.nome}` +
    `\n*Telefone:* ${cliente.telefone}` +
    `\n*CEP:* ${cliente.cep}` +
    `\n*Endereço:* ${cliente.endereco}` +
    `\n*Bairro:* ${cliente.bairro}` +
    (cliente.obsGerais ? `\n\n*Observações gerais:* ${cliente.obsGerais}` : "")
  );
};

/* ============ ENVIO PARA O DESKTOP (API NGROK) ============ */

async function enviarParaDesktop(items, dados, totalFinal, pagamento) {
  try {
    const payload = {
      source: "website",
      type: dados.retirada ? "pickup" : "delivery",
      status: "open",
      createdAt: new Date().toISOString(),

      customerId: dados.customerId || null,

      customerSnapshot: {
        id: dados.customerId || null,
        name: dados.nome,
        phone: dados.telefone?.replace(/\D/g, ""),
        address: {
          cep: dados.cep,
          street: dados.endereco,
          neighborhood: dados.bairro,
        },
      },

      payment: {
        method: pagamento,
        changeFor: pagamento === "dinheiro" ? dados.troco || null : null,
        status: "pending",
      },

      delivery: {
        mode: dados.retirada ? "pickup" : "delivery",
        fee: dados.taxaEntrega,
      },

      items: items.map((i) => ({
        lineId: `${Date.now()}-${Math.random()}`,
        productId: i.idPizza || i.id,
        name: i.nome,
        size: i.tamanho,
        quantity: i.quantidade,
        unitPrice: i.precoUnitario,
        lineTotal: i.precoUnitario * i.quantidade,
        isHalfHalf: !!i.meio,
        halfDescription: i.meio || "",
        extras: Array.isArray(i.extras) ? i.extras : [],
      })),

      totals: {
        subtotal: dados.subtotal,
        deliveryFee: dados.taxaEntrega,
        discount: dados.desconto,
        finalTotal: totalFinal,
      },
    };

    console.log("📦 Enviando para desktop:", payload);

    const res = await fetch(`${API_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error("❌ Erro ao enviar:", res.status, txt);
      return { ok: false };
    }

    const data = await res.json();
    console.log("✅ Pedido salvo no desktop:", data);
    return { ok: true, data };
  } catch (err) {
    console.error("⚠ Falha na conexão API → desktop:", err);
    return { ok: false, error: err };
  }
}

/* ============ BUSCA DE CLIENTE POR TELEFONE (API DESKTOP) ============ */

async function checkCustomerByPhone(phoneRaw) {
  const phoneDigits = (phoneRaw || "").replace(/\D/g, "");

  if (!phoneDigits || phoneDigits.length < 10) {
    return { found: false, customer: null };
  }

  try {
    const res = await fetch(
      `${API_URL}/api/customers/by-phone?phone=${encodeURIComponent(
        phoneDigits
      )}`
    );

    if (res.status === 404) {
      return { found: false, customer: null };
    }

    if (!res.ok) {
      const txt = await res.text();
      console.error("❌ Erro ao buscar cliente:", res.status, txt);
      return { found: false, customer: null };
    }

    const customer = await res.json();
    return { found: true, customer };
  } catch (err) {
    console.error("⚠ Falha ao consultar cliente:", err);
    return { found: false, customer: null, error: true };
  }
}

/* ============ SALVAR / CADASTRAR CLIENTE (POST) ============ */

async function salvarCliente(dadosCliente) {
  if (!dadosCliente?.telefone || !dadosCliente?.nome) return null;

  const phoneDigits = (dadosCliente.telefone || "").replace(/\D/g, "");

  const payload = {
    source: "website",
    name: dadosCliente.nome,
    phone: phoneDigits,
    address: {
      cep: dadosCliente.cep || "",
      street: dadosCliente.endereco || "",
      neighborhood: dadosCliente.bairro || "",
    },
  };

  try {
    const res = await fetch(`${API_URL}/api/customers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error("❌ Erro ao salvar cliente:", res.status, txt);
      return null;
    }

    const customer = await res.json();
    console.log("✅ Cliente salvo/atualizado:", customer);
    return customer;
  } catch (err) {
    console.error("⚠ Falha na conexão API → customers:", err);
    return null;
  }
}

/* ================= HOOK PRINCIPAL ================== */

export function useCheckout() {
  const {
    items,
    total,
    updateQuantity,
    removeItem,
    clearCart,
    addItem,
  } = useCart();

  const navigate = useNavigate();

  // 0: Carrinho | 1: Dados | 2: Revisão | 3: Pagamento
  const [passo, setPasso] = useState(0);
  const [pagamento, setPagamento] = useState("pix");
  const [cupom, setCupom] = useState("");

  const [dados, setDados] = useState({
    nome: "",
    telefone: "",
    cep: "",
    endereco: "",
    bairro: "",
    obsGerais: "",
    retirada: false,
    subtotal: total,
    taxaEntrega: 0,
    desconto: 0,
    customerId: null,
  });

  // auto | existing | novo
  const [tipoCliente, setTipoCliente] = useState("auto");

  const [clienteExistente, setClienteExistente] = useState(null);
  const [checandoCliente, setChecandoCliente] = useState(false);
  const [erroClienteApi, setErroClienteApi] = useState("");

  const [buscandoCep, setBuscandoCep] = useState(false);
  const [erroCep, setErroCep] = useState("");

  const [enviando, setEnviando] = useState(false);

  const etapas = ["Carrinho", "Dados", "Revisão", "Pagamento"];

  /* =========== LOCALSTORAGE CLIENTE =========== */

  useEffect(() => {
    try {
      const salvo = localStorage.getItem("checkout_cliente");
      if (salvo) {
        const parsed = JSON.parse(salvo);
        setDados((d) => ({ ...d, ...parsed }));
      }
    } catch {
      // ignora
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const toSave = {
      nome: dados.nome,
      telefone: dados.telefone,
      cep: dados.cep,
      endereco: dados.endereco,
      bairro: dados.bairro,
      obsGerais: dados.obsGerais,
      retirada: dados.retirada,
      customerId: dados.customerId || null,
    };
    try {
      localStorage.setItem("checkout_cliente", JSON.stringify(toSave));
    } catch {
      // ignora
    }
  }, [
    dados.nome,
    dados.telefone,
    dados.cep,
    dados.endereco,
    dados.bairro,
    dados.obsGerais,
    dados.retirada,
    dados.customerId,
  ]);

  /* =========== DERIVADOS =========== */

  const subtotal = total;
  const taxaEntrega = dados.retirada ? 0 : getTaxaPorBairro(dados.bairro);
  const desconto = dados.desconto || 0;
  const totalFinal = useMemo(
    () => subtotal + taxaEntrega - desconto,
    [subtotal, taxaEntrega, desconto]
  );

  const totalItens = useMemo(
    () => items.reduce((acc, i) => acc + i.quantidade, 0),
    [items]
  );

  const semItens = items.length === 0;

  const podeEnviar =
    !semItens &&
    dados.nome.trim() &&
    dados.telefone.trim() &&
    (dados.retirada || dados.endereco.trim()) &&
    !enviando;

  /* =========== CUPOM =========== */

  const aplicarCupom = () => {
    if (cupom.trim().toUpperCase() === "PRIMEIRA") {
      setDados((d) => ({ ...d, desconto: 5 }));
    } else {
      setDados((d) => ({ ...d, desconto: 0 }));
    }
  };

  /* =========== CEP =========== */

  const buscarCep = async () => {
    const cepLimpo = (dados.cep || "").replace(/\D/g, "");
    if (cepLimpo.length !== 8) {
      setErroCep("CEP inválido. Use 8 dígitos.");
      return;
    }
    setErroCep("");
    setBuscandoCep(true);

    try {
      const resp = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const json = await resp.json();
      if (json.erro) {
        setErroCep("CEP não encontrado.");
      } else {
        const enderecoFormatado = `${json.logradouro || ""}, ${
          json.bairro || ""
        } - ${json.localidade || ""}/${json.uf || ""}`.trim();
        setDados((d) => ({
          ...d,
          endereco: enderecoFormatado,
          bairro: json.bairro || d.bairro,
        }));
      }
    } catch (e) {
      setErroCep("Erro ao buscar CEP. Tente novamente.");
    } finally {
      setBuscandoCep(false);
    }
  };

  /* =========== BUSCA DE CLIENTE POR TELEFONE =========== */

  const onBuscarClientePorTelefone = async (telefoneAtual) => {
    setErroClienteApi("");
    setClienteExistente(null);

    const phoneDigits = (telefoneAtual || "").replace(/\D/g, "");
    if (!phoneDigits || phoneDigits.length < 10) {
      return;
    }

    setChecandoCliente(true);

    const resultado = await checkCustomerByPhone(telefoneAtual);

    setChecandoCliente(false);

    if (resultado.error) {
      setErroClienteApi("Não foi possível consultar o cadastro agora.");
      return;
    }

    if (!resultado.found || !resultado.customer) {
      setErroClienteApi(
        "Cliente não encontrado. Complete seus dados para finalizar o cadastro."
      );
      setDados((d) => ({ ...d, customerId: null }));
      return;
    }

    const c = resultado.customer;
    setClienteExistente(c);

    setDados((d) => ({
      ...d,
      customerId: c.id || d.customerId || null,
      nome: c.name || d.nome,
      telefone: c.phone || d.telefone,
      cep: c.address?.cep || d.cep,
      endereco: c.address?.street || d.endereco || "",
      bairro: c.address?.neighborhood || d.bairro,
    }));
  };

  /* =========== NAVEGAÇÃO ENTRE ETAPAS =========== */

  const avancar = () => setPasso((p) => Math.min(p + 1, 3));
  const voltar = () => setPasso((p) => Math.max(p - 1, 0));
  const irParaStep = (idx) =>
    setPasso((p) => {
      if (idx < 0 || idx > 3) return p;
      return idx;
    });

  /* =========== ENVIO FINAL DO PEDIDO =========== */

  const enviarPedido = async () => {
    if (!podeEnviar) return;
    setEnviando(true);

    try {
      // 1) garante cliente salvo
      let customerIdAtual = dados.customerId || null;
      if (!customerIdAtual) {
        const clienteSalvo = await salvarCliente(dados);
        if (clienteSalvo && clienteSalvo.id) {
          customerIdAtual = clienteSalvo.id;
          setDados((d) => ({ ...d, customerId: clienteSalvo.id }));
        }
      }

      // 2) monta dados completos
      const payloadCliente = {
        ...dados,
        customerId: customerIdAtual,
        subtotal,
        taxaEntrega,
        desconto,
      };

      const orderSummary = {
        items,
        subtotal,
        taxaEntrega,
        desconto,
        totalFinal,
        dados: payloadCliente,
        waText: montarTextoWhatsApp(
          items,
          {
            ...payloadCliente,
            subtotal,
            taxaEntrega,
            desconto,
          },
          totalFinal,
          pagamento
        ),
      };

      // 3) envia para desktop
      await enviarParaDesktop(items, payloadCliente, totalFinal, pagamento);

      // 4) salva resumo local
      try {
        localStorage.setItem("lastOrderSummary", JSON.stringify(orderSummary));
      } catch {
        // ignora
      }

      // 5) limpa carrinho + navega
      clearCart();
      navigate("/confirmacao", { state: { orderSummary } });
    } finally {
      setEnviando(false);
    }
  };

  return {
    // cart
    items,
    total,
    totalItens,

    // etapas
    passo,
    etapas,
    avancar,
    voltar,
    irParaStep,

    // dados cliente
    dados,
    setDados,
    tipoCliente,
    setTipoCliente,

    // estados de API cliente
    clienteExistente,
    checandoCliente,
    erroClienteApi,
    onBuscarClientePorTelefone,

    // CEP
    buscarCep,
    buscandoCep,
    erroCep,

    // cupom
    cupom,
    setCupom,
    aplicarCupom,

    // pagamento
    pagamento,
    setPagamento,

    // totais
    subtotal,
    taxaEntrega,
    desconto,
    totalFinal,
    podeEnviar,
    enviando,

    // cart actions
    updateQuantity,
    removeItem,
    addItem,

    // envio
    enviarPedido,
  };
}
