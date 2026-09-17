import { Router, type Request, type Response } from "express";
import jwt from "jsonwebtoken";

import dotenv from "dotenv";
dotenv.config();

import type { User, CustomRequest } from "../libs/types.js";

// import authentication middleware
import { authenticateToken } from "../middlewares/authenMiddleware.ts";

// import database
import {users} from "../db/db.ts";

const router = Router();

// POST /api/v699/auth/login
router.post("/login", (req: Request, res: Response) => {
  try {
    const { username, password } = req.body as { username?: string; password?: string };
    const user = users.find(
      (u: User) => u.username === username && u.password === password
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Username or password is incorrect",
      });
    }

    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET as string, {
      expiresIn: "10m",
    });

    user.tokens = user.tokens ? [...user.tokens, token] : [token];

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Username or password is incorrect",
      error: err,
    });
  }
});

// POST /api/v699/auth/logout
router.post("/logout", authenticateToken, (req: Request, res: Response) => {
  try {
    const payload = (req as any).user;
    const token = (req as any).token;

    // find user by payload.username
    const user = users.find((u: User) => u.username === payload.username);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }
    // check if token exists in user.tokens
    if (!user.tokens || !user.tokens.includes(token)) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    // if token exists, remove the token from user.tokens
    user.tokens = user.tokens?.filter((t) => t !== token);
    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something is wrong, please try again",
      error: err,
    });
  }
});

// POST /api/v699/auth/reset
//router.post("/reset", (req: Request, res: Response) => {
//  try {
//    reset_users();
//    return res.status(200).json({
//    success: true,
//    message: "User database has been reset",
//    });
// } catch (err) {
//    return res.status(500).json({
//      success: false,
//      message: "Something is wrong, please try again",
//      error: err,
//  });
//  }
//});

export default router;