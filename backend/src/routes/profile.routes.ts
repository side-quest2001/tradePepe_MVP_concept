import { Router } from "express";
import { getMyProfile, getProfileByHandle, toggleProfileFollow } from "../controllers/profile.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const profileRouter = Router();

profileRouter.get("/me", requireAuth, getMyProfile);
profileRouter.get("/:handle", getProfileByHandle);
profileRouter.post("/:id/follow", requireAuth, toggleProfileFollow);

export { profileRouter };
