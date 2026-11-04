import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware";
import { loginAdmin, profileUser, registerUser } from "../services/UserService";

const router = Router();

router.post("/login", loginAdmin);

router.use(authenticateToken);
router.post("/register", registerUser);
router.get("/me/profile/:id_user", profileUser);

export default router;
