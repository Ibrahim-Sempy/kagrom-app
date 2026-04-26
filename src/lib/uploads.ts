import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

function getExtension(filename: string) {
  const extension = path.extname(filename).toLowerCase();
  return extension || ".bin";
}

export async function saveUploadedImage(file: File | null, directory = "learners") {
  if (!file || file.size === 0) {
    return null;
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads", directory);
  await mkdir(uploadsDir, { recursive: true });

  const filename = `${Date.now()}-${randomUUID()}${getExtension(file.name)}`;
  const filePath = path.join(uploadsDir, filename);
  const bytes = await file.arrayBuffer();

  await writeFile(filePath, Buffer.from(bytes));

  return `/uploads/${directory}/${filename}`;
}
