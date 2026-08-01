import { Router } from "express";
import { listUsers, setUserAdmin } from "../controllers/adminController.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

router.use(requireAdmin);
router.get("/users", listUsers);
router.patch("/users/:username/admin", setUserAdmin);

export default router;
