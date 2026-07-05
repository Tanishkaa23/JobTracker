import api from "../api/axios";

export async function connectGoogle() {
    try {
        const { data } = await api.get("/google/connect");
        window.location.href = data.authUrl;
    } catch (error) {
        console.error("Google connect failed:", error);
    }
}