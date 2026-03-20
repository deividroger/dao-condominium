import { Request, Response, NextFunction } from "express";
import Resident from "src/models/resident";
import residentRepository from "src/repositories/residentRepository";

async function getResident(req: Request, res: Response, next: NextFunction) {
    const wallet = req.params.wallet;
    const resident = await residentRepository.getResident(wallet);

    if (!resident) {
        return res.status(404).json({
            message: 'Wallet not found'
        });
    }
    return res.json(resident);
}

export async function postResident(req: Request, res: Response, next: NextFunction) {
    const resident = req.body as Resident;
    console.log(resident);
    const result = await residentRepository.addResident(resident);

    return res.status(201).json(result);
}

export async function updateResident(req: Request, res: Response, next: NextFunction) {
    const wallet = req.params.wallet;
    const resident = req.body as Resident;
    const result = await residentRepository.updateResident(wallet, resident);

    return res.status(200).json(result);
}

export async function deleteResident(req: Request, res: Response, next: NextFunction) {
    const wallet = req.params.wallet;

    const success = await residentRepository.deleteResident(wallet);

    return res.sendStatus(success ? 204 : 422);

}

export default { getResident, postResident, updateResident, deleteResident };