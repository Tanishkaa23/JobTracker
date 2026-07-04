// src/api/axios.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true   // REQUIRED — tells axios to send/receive cookies
});

export default api;