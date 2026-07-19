import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/api-utils";
import { rateLimits } from "@/lib/rate-limit";
import { uploadImage } from "@/lib/cloudinary";

export const runtime = "nodejs";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

/**
 * POST /api/upload
 * Handles file uploads to Cloudinary.
 * Accepts `multipart/form-data` with one or multiple files in the `file` field.
 */
export async function POST(request: Request) {
  try {
    // 1. Verify authentication and rate limit
    const rateLimitError = rateLimits.upload.check(request);
    if (rateLimitError) return rateLimitError;

    await getAuthSession();

    // 2. Parse form data
    const formData = await request.formData();
    const files = formData.getAll("file") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const uploadedFiles = [];

    for (const file of files) {
      // 3. Validate MIME type
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `File type ${file.type} is not allowed. Supported: JPEG, PNG, WEBP, PDF.` },
          { status: 400 }
        );
      }

      // 4. Validate size
      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { error: `File exceeds the maximum size of ${MAX_FILE_SIZE_MB}MB.` },
          { status: 400 }
        );
      }

      // 5. Convert to buffer and upload
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const result = await uploadImage(buffer, "skillsync/attachments");
      
      uploadedFiles.push({
        url: result.url,
        publicId: result.publicId,
        name: file.name,
      });
    }

    // Return the array of uploaded objects or single object depending on input length to make it easier for client
    if (uploadedFiles.length === 1) {
      return NextResponse.json({ data: uploadedFiles[0] }, { status: 201 });
    }

    return NextResponse.json({ data: uploadedFiles }, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("[POST /api/upload]", error);
    return NextResponse.json({ error: "Internal server error during file upload." }, { status: 500 });
  }
}
