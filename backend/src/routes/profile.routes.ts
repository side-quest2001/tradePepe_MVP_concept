import { Router } from "express";
import {
  getMyProfile,
  getProfileByHandle,
  getProfileMediaSignature,
  toggleProfileFollow,
  updateMyProfile
} from "../controllers/profile.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const profileRouter = Router();

profileRouter.get("/me", requireAuth, getMyProfile);
profileRouter.patch("/me", requireAuth, updateMyProfile);
profileRouter.post("/media/signature", requireAuth, getProfileMediaSignature);
profileRouter.get("/:handle", getProfileByHandle);
profileRouter.post("/:id/follow", requireAuth, toggleProfileFollow);

export { profileRouter };
