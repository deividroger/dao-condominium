import { Router } from "express";
import residentController from "src/controllers/residentController";
import { onlyCounselour, onlyManager } from "src/middlewares/authorizationMiddleware";

const router = Router();

router.get('/:wallet', residentController.getResident);
router.post('/', onlyCounselour, residentController.postResident);

router.patch('/:wallet', onlyManager, residentController.updateResident);
router.delete('/:wallet', onlyManager, residentController.deleteResident);

export default router;