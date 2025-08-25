// VERSÃO CORRETA
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000' // Verifique se está exatamente assim
});

export default api;