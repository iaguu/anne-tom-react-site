import axios from 'axios';

const runtimeConfig =
  typeof window !== "undefined"
    ? window.__ANNE_TOM_CONFIG__ || window.__APP_CONFIG__
    : undefined;
const apiKey = process.env.REACT_APP_AT_API_KEY;
const publicToken = process.env.REACT_APP_PUBLIC_API_TOKEN;
// Chave pública fixa para integração AxionPAY
const axionApiKey = "change-me-public";
// axionBearer removido (não utilizado)
// Endpoints fixos para AxionPAY via API AnneTom
const axionBaseUrl = "https://api.annetom.com/api/axionpay";

const toResponse = (response) => ({
  ok: response.status >= 200 && response.status < 300,
  status: response.status,
  data: response.data,
  json: async () => response.data,
  text: async () =>
    typeof response.data === "string"
      ? response.data
      : JSON.stringify(response.data),
  headers: {
    get: (name) =>
      response.headers?.[String(name || "").toLowerCase()] || null,
  },
});

const toErrorResponse = (error) => ({
  ok: false,
  status: 0,
  error,
  json: async () => ({ error: String(error) }),
  text: async () => String(error),
  headers: {
    get: () => null,
  },
});

const normalizePayload = (payload) => {
  if (typeof payload === "string") {
    try {
      return JSON.parse(payload);
    } catch (_err) {
      return payload;
    }
  }
  return payload;
};

export const serverInstance = {
  baseDomain: {
    instance: axios.create({
      timeout: 15000,
      baseURL:
        process.env.REACT_APP_AT_API_BASE_URL || "https://api.annetom.com",
      validateStatus: () => true,
      headers: {
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
        ...(apiKey ? { "x-api-key": apiKey } : {}),
        ...(publicToken ? { "x-api-key": publicToken } : {}),
        ...(!apiKey && !publicToken && runtimeConfig?.apiKey
          ? { Authorization: `Bearer ${runtimeConfig.apiKey}` }
          : {}),
      },
    }),
  },
  paymentsDomain: {
    instance: axios.create({
      timeout: 15000,
      baseURL: axionBaseUrl,
      validateStatus: () => true,
      headers: {
        Accept: "application/json",
        "x-api-key": axionApiKey,
      },
    }),
  },
};

const fetchStatus = async (id) => {
  try {
    const response = await serverInstance.baseDomain.instance.get(
      `/motoboy/pedido/${id}`
    );
    return toResponse(response);
  } catch (error) {
    console.error(error);
    return toErrorResponse(error);
  }
};

const enviarParaDesktop = async (params) => {
  try {
    const payload = normalizePayload(params);
    const response = await serverInstance.baseDomain.instance.post(
      `/api/orders`,
      payload
    );
    return toResponse(response);
  } catch (error) {
    console.error(error);
    return toErrorResponse(error);
  }
};

const checkCustomerByPhone = async (phone) => {
  try {
    const response = await serverInstance.baseDomain.instance.get(
      `/api/customers/by-phone?phone=${phone}`
    );
    return toResponse(response);
  } catch (error) {
    console.error(error);
    return toErrorResponse(error);
  }
};

const salvarCliente = async (params) => {
  try {
    const payload = normalizePayload(params);
    const response = await serverInstance.baseDomain.instance.post(
      `/api/customers`,
      payload
    );
    return toResponse(response);
  } catch (error) {
    console.error(error);
    return toErrorResponse(error);
  }
};

const fetchMenu = async () => {
  try {
    const response = await serverInstance.baseDomain.instance.get(`/api/menu`);
    return toResponse(response);
  } catch (error) {
    console.error(error);
    return toErrorResponse(error);
  }
};

const fetchOrders = async () => {
  try {
    const response = await serverInstance.baseDomain.instance.get(`/api/orders`);
    return toResponse(response);
  } catch (error) {
    console.error(error);
    return toErrorResponse(error);
  }
};

const fetchBusinessHours = async () => {
  try {
    const response = await serverInstance.baseDomain.instance.get(
      `/api/pdv/business-hours`
    );
    return toResponse(response);
  } catch (error) {
    console.error(error);
    return toErrorResponse(error);
  }
};

const confirmDelivery = async (orderId) => {
  try {
    const response = await serverInstance.baseDomain.instance.post(
      `/api/orders/${encodeURIComponent(orderId)}/status`,
      { status: "finalizado" }
    );
    return toResponse(response);
  } catch (error) {
    console.error(error);
    return toErrorResponse(error);
  }
};


const createPixPayment = async (params = {}, idempotencyKey) => {
  try {
    const payload = normalizePayload(params);
    const response = await serverInstance.paymentsDomain.instance.post(
      `/pix`,
      payload,
      {
        headers: idempotencyKey
          ? { "Idempotency-Key": idempotencyKey }
          : undefined,
      }
    );
    return toResponse(response);
  } catch (error) {
    console.error(error);
    return toErrorResponse(error);
  }
};

// Novo método: pagamento via cartão (AXIONEPAY)
const createCardPayment = async (params = {}, idempotencyKey) => {
  try {
    const payload = normalizePayload(params);
    const response = await serverInstance.paymentsDomain.instance.post(
      `/card`,
      payload,
      {
        headers: idempotencyKey
          ? { "Idempotency-Key": idempotencyKey }
          : undefined,
      }
    );
    return toResponse(response);
  } catch (error) {
    console.error(error);
    return toErrorResponse(error);
  }
};


const server = {
  fetchStatus,
  enviarParaDesktop,
  checkCustomerByPhone,
  salvarCliente,
  fetchMenu,
  fetchOrders,
  fetchBusinessHours,
  confirmDelivery,
  createPixPayment,
  createCardPayment,
};

export default server;
