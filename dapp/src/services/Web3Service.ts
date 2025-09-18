import { ethers } from 'ethers';
import ABI from './ABI.json';

const ADAPTER_ADDRESS = import.meta.env.VITE_ADAPTER_ADDRESS;

export type Profile = 0 | 1 | 2;

export const Profile = {
    RESIDENT: 0 as Profile,
    COUNSELOUR: 1 as Profile,
    MANAGER: 2 as Profile
};

export type Resident = {
    wallet: string;
    residence: number;
    isCounselor: boolean;
    isManager: boolean;
    nextPayment: number;
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

async function getContractSigner(provider?: ethers.BrowserProvider): Promise<ethers.BaseContract> {
    if (!provider) {
        provider = getProvider();
    }
    const signer = await (provider as ethers.BrowserProvider).getSigner(localStorage.getItem("account") || undefined);

    const contract = new ethers.Contract(ADAPTER_ADDRESS, ABI as ethers.InterfaceAbi, provider);


    return contract.connect(signer);
}

function getProfile(): Profile {
    const profile = localStorage.getItem("profile") || "0";

    return parseInt(profile) as Profile;
}

export async function doLogin(): Promise<LoginResult> {

    const provider = getProvider();
    const accounts = await provider.send("eth_requestAccounts", []);
    if (!accounts || !accounts.length) throw new Error('Wallet not found/allowed.');


    const contract = getContract(provider);

    const resident = await contract.getResident(accounts[0]) as Resident;

    let isManager = resident.isManager;

    if (!isManager && resident.residence > 0) {
        if (resident.isCounselor)
            localStorage.setItem("profile", `${Profile.COUNSELOUR}`);
        else
            localStorage.setItem("profile", `${Profile.RESIDENT}`);
    } else if (!isManager && !resident.residence) {
        const manager = await contract.getManager() as string;
        isManager = accounts[0].toUpperCase() == manager.toUpperCase();
    }

    if (isManager) {
        localStorage.setItem("profile", `${Profile.MANAGER}`);
    } else if (localStorage.getItem("profile") === null) throw new Error("Unauthorized");

    localStorage.setItem('account', accounts[0]);

    return {
        account: accounts[0],
        profile: parseInt(localStorage.getItem("profile") || "0")
    } as LoginResult
}


export async function getContractAddress(): Promise<string> {

    const contract = getContract();

    return contract.getImplAddress();
}

export async function upgrade(address: string): Promise<ethers.Transaction> {
    if(getProfile() !== Profile.MANAGER) throw new Error("You do not have permission");
    
    const contract = (await getContractSigner()) as ethers.Contract;

    return contract.upgrade(address);
}

export function doLogout() {
    localStorage.removeItem("account");
    localStorage.removeItem("profile");
}