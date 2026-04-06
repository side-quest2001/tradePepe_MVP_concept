import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";
import { ApiError } from "../utils/api-error.js";

type UploadKind = "avatar" | "cover" | "shared-trade";

const folders: Record<UploadKind, string> = {
  avatar: "tradepepe/profile-avatars",
  cover: "tradepepe/profile-covers",
  "shared-trade": "tradepepe/shared-trades"
};

export class MediaService {
  getUploadSignature(kind: UploadKind) {
    if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
      throw new ApiError(503, "Cloudinary is not configured yet");
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = folders[kind];
    const signature = cloudinary.utils.api_sign_request(
      {
        folder,
        timestamp
      },
      env.CLOUDINARY_API_SECRET
    );

    return {
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      apiKey: env.CLOUDINARY_API_KEY,
      timestamp,
      folder,
      signature
    };
  }
}

export const mediaService = new MediaService();
