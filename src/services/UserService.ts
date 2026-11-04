import { Request, Response } from "express";
import pool from "../config/connect-pg";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

import {
    LoginRequest,
    LoginResponse,
    RegisterUserRequest
} from "../models/Users";

dotenv.config();


// =============================
// LOGIN
// =============================

export const loginAdmin = async (req: Request, res: Response) => {
    try {

        const { username, password }: LoginRequest = req.body;
        console.log("Se esta obteniendo el username y password: ", username, password);

        // Validar datos
        if (!username || !password) {
            return res.status(400).json({
                message: "Username and password are required"
            });
        }

        const jwtSecret = process.env.JWT_KEY;
        if (!jwtSecret) {
            console.error("JWT_KEY is not configured");
            return res.status(500).json({
                message: "Authentication is not configured"
            });
        }

        // Buscar usuario
        const query = `
SELECT
    u.id_user,
    r.name_rol AS role,
    p.name_profile AS type_perfil,
    u.username,
    u.name,
    u.lastname,
    u.email,
    u.phone,
    u.picture_profile,
    u.created_initial,
    u.created_end,
    u.password,
    u.is_active
FROM users AS u
INNER JOIN roles AS r
    ON u.id_rol = r.id_rol
LEFT JOIN profiles AS p
    ON u.id_profile = p.id_profile
WHERE
    LOWER(TRIM(u.username)) = LOWER(TRIM($1))
    AND u.is_active = TRUE
    AND u.is_verified = TRUE
LIMIT 1;
`;
        const result = await pool.query(query, [username]);
        // Usuario no encontrado
        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid username or password"
            });
        }

        const user = result.rows[0];

        // Verificar password
        const passwordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordValid) {
            return res.status(401).json({
                message: "Invalid username or password"
            });
        }

        if (!user.is_active) {
            return res.status(403).json({
                message: "User account is inactive"
            });
        }

        // Crear respuesta
        const loginResponse = new LoginResponse(
            user.role,
            user.type_perfil,
            user.username,
            user.name,
            user.lastname,
            user.email,
            user.phone,
            user.picture_profile,
            user.created_initial,
            user.created_end
        );

        await pool.query(
            "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id_user = $1",
            [user.id_user]
        );

        // Crear JWT
        const token = jwt.sign(
            {
                username: user.username,
                role: user.role,
                type_perfil: user.type_perfil
            },
            jwtSecret,
            {
                expiresIn: "8h"
            }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: loginResponse
        });

    } catch (error) {

        console.error("Error executing login:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


// =============================
// REGISTER USER
// =============================

export const registerUser = async (req: Request, res: Response) => {
    try {

        const {
            id_profile,
            id_rol,
            username,
            name,
            lastname,
            password,
            picture_profile,
            email,
            phone
        }: RegisterUserRequest = req.body;


        // =============================
        // VALIDACIONES
        // =============================

        if (
            !id_rol ||
            !username ||
            !name ||
            !lastname ||
            !password
        ) {
            return res.status(400).json({
                message: "All required fields must be provided"
            });
        }


        // =============================
        // VALIDAR USERNAME
        // =============================

        const userExists = await pool.query(
            `
            SELECT id_user
            FROM users
            WHERE username = $1 OR ($2::varchar IS NOT NULL AND email = $2)
            `,
            [username, email ?? null]
        );

        if (userExists.rows.length > 0) {
            return res.status(409).json({
                message: "Username or email already exists"
            });
        }


        // =============================
        // VALIDAR PROFILE
        // =============================

        if (id_profile != null) {
            const profileExists = await pool.query(
                `
                SELECT id_profile
                FROM profiles
                WHERE id_profile = $1
                `,
                [id_profile]
            );

            if (profileExists.rows.length === 0) {
                return res.status(404).json({
                    message: "Profile not found"
                });
            }
        }


        // =============================
        // VALIDAR ROLE
        // =============================

        const roleExists = await pool.query(
            `
            SELECT id_rol
            FROM roles
            WHERE id_rol = $1
            `,
            [id_rol]
        );

        if (roleExists.rows.length === 0) {
            return res.status(404).json({
                message: "Role not found"
            });
        }


        // =============================
        // ENCRIPTAR PASSWORD
        // =============================

        const passwordHash = await bcrypt.hash(password, 10);


        // =============================
        // INSERT USER
        // =============================

        const query = `
            INSERT INTO users (
                id_profile,
                id_rol,
                email,
                phone,
                username,
                name,
                lastname,
                password,
                picture_profile
            )
            VALUES (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8,
                $9
            )
            RETURNING
                id_user,
                id_profile,
                id_rol,
                username,
                name,
                lastname,
                email,
                phone,
                picture_profile,
                is_active,
                is_verified,
                created_initial,
                created_end
        `;


        const result = await pool.query(query, [
            id_profile ?? null,
            id_rol,
            email ?? null,
            phone ?? null,
            username,
            name,
            lastname,
            passwordHash,
            picture_profile ?? null
        ]);


        // =============================
        // RESPONSE
        // =============================

        return res.status(201).json({
            message: "User registered successfully",
            user: result.rows[0]
        });

    } catch (error) {

        console.error("Error registering user:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

// =============================
// PERFIL USER
// =============================
export const profileUser = async (req: Request, res: Response) => {
    try {
        const { id_user } = req.params;
        console.log("Se esta obteniendo el id del usuario: ", id_user);
        const query = `
            SELECT
                r.name_rol AS role,
                p.name_profile AS type_perfil,
                u.username,
                u.name,
                u.lastname,
                u.email,
                u.phone,
                u.picture_profile,
                u.created_initial,
                u.created_end
            FROM users u
            INNER JOIN roles r ON u.id_rol = r.id_rol
            LEFT JOIN profiles p ON u.id_profile = p.id_profile
            WHERE u.id_user = $1
        `;
        const userProfile = await pool.query(query, [id_user]);

        if (userProfile.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: "User profile fetched successfully",
            user: userProfile.rows[0]
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}
