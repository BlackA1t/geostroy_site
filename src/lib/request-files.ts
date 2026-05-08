import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

export const MAX_REQUEST_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_REQUEST_FILES_PER_UPLOAD = 5;

export const ALLOWED_REQUEST_FILE_EXTENSIONS = new Set([
  "pdf",
  "png",
  "jpg",
  "jpeg",
  "webp",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "dwg",
  "dxf",
  "step",
  "stp",
  "igs",
  "iges",
  "zip",
  "rar"
]);

const BLOCKED_MIME_TYPES = new Set(["text/html", "application/x-msdownload", "application/x-sh"]);

export class RequestFileValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RequestFileValidationError";
  }
}

export function ensureRequestUploadsDir(requestId?: string) {
  const uploadDir = path.join(process.cwd(), "public", "uploads", "requests", requestId ?? "");
  return mkdir(uploadDir, { recursive: true }).then(() => uploadDir);
}

export function sanitizeFileName(originalName: string) {
  const parsed = path.parse(originalName);
  const baseName = parsed.name
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

  return baseName || "file";
}

export function getSafeFileExtension(originalName: string) {
  const extension = path.extname(originalName).replace(".", "").toLowerCase();

  if (!extension || !ALLOWED_REQUEST_FILE_EXTENSIONS.has(extension)) {
    throw new RequestFileValidationError(`Недопустимый тип файла: ${originalName || "без имени"}.`);
  }

  return extension;
}

export function getUploadedFiles(formData: FormData) {
  return formData
    .getAll("files")
    .filter((file): file is File => file instanceof File && file.size > 0 && Boolean(file.name));
}

export function validateUploadedFiles(files: File[]) {
  if (files.length > MAX_REQUEST_FILES_PER_UPLOAD) {
    throw new RequestFileValidationError(`Можно загрузить не более ${MAX_REQUEST_FILES_PER_UPLOAD} файлов за раз.`);
  }

  for (const file of files) {
    getSafeFileExtension(file.name);

    if (file.size > MAX_REQUEST_FILE_SIZE_BYTES) {
      throw new RequestFileValidationError(`Файл ${file.name} больше 10 MB.`);
    }

    if (file.type && BLOCKED_MIME_TYPES.has(file.type)) {
      throw new RequestFileValidationError(`Недопустимый MIME-тип файла: ${file.name}.`);
    }
  }
}

export async function saveRequestFile(file: File, requestId: string) {
  const extension = getSafeFileExtension(file.name);
  const uploadDir = await ensureRequestUploadsDir(requestId);
  const safeBaseName = sanitizeFileName(file.name);
  const fileName = `${Date.now()}-${randomUUID()}-${safeBaseName}.${extension}`;
  const filePath = path.join(uploadDir, fileName);
  const fileUrl = `/uploads/requests/${requestId}/${fileName}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  if (bytes.length > MAX_REQUEST_FILE_SIZE_BYTES) {
    throw new RequestFileValidationError(`Файл ${file.name} больше 10 MB.`);
  }

  await writeFile(filePath, bytes);

  return {
    fileName,
    fileUrl,
    fileType: file.type || null,
    sizeBytes: bytes.length,
    originalName: file.name
  };
}

export async function deleteRequestFileFromDisk(fileUrl: string) {
  if (!fileUrl.startsWith("/uploads/requests/")) return;

  const relativePath = fileUrl.replace(/^\/+/, "");
  const filePath = path.join(process.cwd(), "public", relativePath);

  await unlink(filePath).catch(() => undefined);
}
