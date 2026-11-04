import { loginAdmin, registerUser, profileUser } from "../services/UserService";
import { Request, Response } from "express";

export class UserController {
    async loginAdmin(req: Request, res: Response) {
        return await loginAdmin(req, res);
    }

    async registerUser(req: Request, res: Response) {
        return await registerUser(req, res);
    }

    async profileUser(req: Request, res: Response) {
        return await profileUser(req, res);
    }
}
