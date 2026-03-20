import axios from "./AxiosConfig";
import type { Profile } from "./Web3Service";

const apiUrl = `${import.meta.env.VITE_API_URL}`;

export interface LoginResponse {
    token: string;
}

export interface ApiResident {
    wallet: string;
    name: string;
    phone?: string;
    email?: string;
    profile: Profile;
}

export async function doApiLogin(wallet: string, secret: string, timestamp: number) {

    const response = await axios.post<LoginResponse>(`${apiUrl}/login`, {
        wallet, secret, timestamp
    });
    return response.data.token;
}

export async function getApiResident(wallet: string): Promise<ApiResident> {
    const response = await axios.get(`${apiUrl}/residents/${wallet}`);
    return response.data as ApiResident;
}

export async function addApiResident(resident: ApiResident): Promise<ApiResident> {
    const response = await axios.post<ApiResident>(`${apiUrl}/residents/`, resident);
    return response.data as ApiResident;
}

export async function updateApiResident(wallet: string, resident: ApiResident): Promise<ApiResident> {
    const response = await axios.patch<ApiResident>(`${apiUrl}/residents/${wallet}`, resident);
    return response.data as ApiResident;
}

export async function deleteApiResident(wallet: string): Promise<void> {
    await axios.delete(`${apiUrl}/residents/${wallet}`);

}