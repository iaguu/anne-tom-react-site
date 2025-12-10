import axios from 'axios';

export const serverInstance = {
  baseDomain: {
    instance: axios.create({
      timeout: 15000,
      baseURL: process.env.REACT_APP_AT_API_BASE_URL || "https://portalled-keshia-intolerable.ngrok-free.dev",
      headers: {
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
      }
    },
  )}
};

const server = {
  fetchStatus: {
    get: async (id) => {
      try {
        const response = await serverInstance.baseDomain.instance.get(`/motoboy/pedido/${id}`);
        return response.data;
      } catch (error) {
        console.error(error)
        return error
      }
    }
  },
  enviarParaDesktop: {
    post: async (params) => {
      try {
        const response = await serverInstance.baseDomain.instance.post(`/api/orders`, params);
        return response.data;
      } catch (error) {
        console.error(error)
        return error
      }
    }
  },
  checkCustomerByPhone: {
    get: async (phone) => {
      try {
        const response = await serverInstance.baseDomain.instance.get(`/api/customers/by-phone?phone=${phone}`);
        return response.data;
      } catch (error) {
        console.error(error)
        return error
      }
    }
  },
  salvarCliente: {
    get: async () => {
      try {
        const response = await serverInstance.baseDomain.instance.get(`/api/customers`);
        return response.data;
      } catch (error) {
        console.error(error)
        return error
      }
    }
  },
  fetchMenu: {
    get: async () => {
      try {
        const response = await serverInstance.baseDomain.instance.get(`/api/menu`);
        return response.data;
      } catch (error) {
        console.error(error)
        return error
      }
    }
  }
};

export default server;
