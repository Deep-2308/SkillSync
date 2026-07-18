import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary globally
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

/**
 * Uploads a file buffer to Cloudinary using a stream.
 */
export async function uploadImage(
  buffer: Buffer,
  folder: string = "skillsync/attachments"
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed without an error."));
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Deletes an image from Cloudinary by its public ID.
 */
export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
