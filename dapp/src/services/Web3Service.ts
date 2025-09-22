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

export type ResidentPage = {
    residents: Resident[];
    total: ethers.BigNumberish;
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

export function doLogout() {
    localStorage.removeItem("account");
    localStorage.removeItem("profile");
}

export async function getContractAddress(): Promise<string> {

    const contract = getContract();

    return contract.getImplAddress();
}

export async function getResidents(page: number = 1, pageSize = 10): Promise<ResidentPage> {

    const contract = getContract();

    const result = await contract.getResidents(page, pageSize) as ResidentPage

    const residents = [...result.residents.filter(r => r.residence)].sort((a, b) => ethers.toNumber(a.residence - b.residence));

    return {
        residents,
        total: result.total
    } as ResidentPage;
}

export async function getResident(Wallet: String): Promise<Resident> {

    const contract = getContract();

    return contract.getResident(Wallet) as unknown as Resident;

}


export async function upgrade(address: string): Promise<ethers.Transaction> {
    if (getProfile() !== Profile.MANAGER) throw new Error("You do not have permission");

    const contract = (await getContractSigner()) as ethers.Contract;

    return contract.upgrade(address);
}


export async function addResident(wallet: string, residenceId: number): Promise<ethers.Transaction> {
    if (getProfile() == Profile.RESIDENT) throw new Error("You do not have permission");

    const contract = (await getContractSigner()) as ethers.Contract;

    return contract.addResident(wallet, residenceId);
}

export async function removeResident(wallet: string): Promise<ethers.Transaction> {
    if (getProfile() !== Profile.MANAGER) throw new Error("You do not have permission");

    const contract = (await getContractSigner()) as ethers.Contract;

    return contract.removeResident(wallet);
}

export async function setCounselor(wallet: string, isEntering: boolean): Promise<ethers.Transaction> {
    if (getProfile() !== Profile.MANAGER) throw new Error("You do not have permission");

    const contract = (await getContractSigner()) as ethers.Contract;

    return contract.setCounselor(wallet, isEntering);
}

export function isManager(): boolean {
    return getProfile() == Profile.MANAGER;
}

export function isResident(): boolean {
    return getProfile() == Profile.RESIDENT;
}