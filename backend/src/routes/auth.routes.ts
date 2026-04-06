import { Router } from "express";
import {
  forgotPassword,
  me,
  refresh,
  requestEmailVerification,
  resetPassword,
  signin,
  signout,
  signup,
  verifyEmail
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const authRouter = Router();

authRouter.post("/signup", signup);
authRouter.post("/signin", signin);
authRouter.post("/refresh", refresh);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
authRouter.post("/verify-email/request", requireAuth, requestEmailVerification);
authRouter.post("/verify-email/confirm", verifyEmail);
authRouter.post("/signout", requireAuth, signout);
authRouter.get("/me", requireAuth, me);

export { authRouter };
