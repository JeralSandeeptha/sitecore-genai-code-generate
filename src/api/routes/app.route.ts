import { Router } from "express";
import getApplication from "../controllers/app.controller";

const router = Router();

// application route
router.get('/health', getApplication);

export default router;