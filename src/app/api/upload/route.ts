import { NextRequest, NextResponse } from "next/server";

/**
 * Logo/Image upload API
 * Accepts base64 or multipart form data
 * Returns URL for use in composition
 * In production: integrate with Cloudinary or S3
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let imageUrl: string;

    if (contentType.includes("application/json")) {
      const { image } = await request.json();
      if (!image || typeof image !== "string") {
        return NextResponse.json(
          { error: "Image data is required" },
          { status: 400 }
        );
      }
      // Base64 data URL - use as-is for canvas composition
      imageUrl = image;
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json(
          { error: "File is required" },
          { status: 400 }
        );
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = buffer.toString("base64");
      const mime = file.type || "image/png";
      imageUrl = `data:${mime};base64,${base64}`;
    } else {
      return NextResponse.json(
        { error: "Unsupported content type" },
        { status: 400 }
      );
    }

    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
