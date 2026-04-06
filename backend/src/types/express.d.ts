import type { PublicUserProfile } from "./auth.types.js";

declare global {
  namespace Express {
    interface Request {
      authUser?: PublicUserProfile;
    }
  }
}

export {};
