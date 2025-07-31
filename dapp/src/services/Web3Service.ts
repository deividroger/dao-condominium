import { ethers } from 'ethers';
import ABI from './ABI.json';

const ADAPTER_ADDRESS = import.meta.env.VITE_ADAPTER_ADDRESS;

export enum Profile {
    RESIDENT = 0,
    COUNSELOUR = 1,
    MANAGER = 2
}

export type LoginResult = {
    account: string;
    profile: Profile;
}

function getProvider(): ethers.BrowserProvider {
    if (!window.ethereum) {
        throw new Error('No metamask found');
    }

    return new ethers.BrowserProvider(window.ethereum);
}

function getContract(provider?: ethers.Provider): ethers.Contract {
    if (!provider) {
        provider = getProvider();
    }

    return new ethers.Contract(ADAPTER_ADDRESS, ABI, provider);
}

export async function doLogin(): Promise<LoginResult> {
    const provider = getProvider();
    const accounts = await provider.send("eth_requestAccounts", []);
    if (!accounts || !accounts.length) throw new Error('Wallet not found/allowed.');


    const contract = getContract(provider);

    const manager = (await contract.getManager()) as string;

    const isManager = manager.toLowerCase() == accounts[0].toLowerCase();

    if (isManager) {
        localStorage.setItem("profile", `${Profile.MANAGER}`);
    } else {
        localStorage.setItem("profile", `${Profile.RESIDENT}`);
    }

    localStorage.setItem('account', accounts[0]);
    return {
        account: accounts[0],
        profile: parseInt(localStorage.getItem("profile") || "0")
    } as LoginResult
}

export function doLogout(){
    localStorage.removeItem("account");
    localStorage.removeItem("profile");
}