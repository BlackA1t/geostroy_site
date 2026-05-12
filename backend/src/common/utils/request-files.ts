import { randomUUID } from "crypto";
import { existsSync, mkdirSync } from "fs";
import { mkdir, rename, unlink } from "fs/promises";
import path from "path";
import { BadRequestException } from "@nestjs/common";

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

export type UploadedRequestFile = {
  fieldname: string;
  originalname: string;
  encoding?: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
};

export class RequestFileValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RequestFileValidationError";
  }
}

export function getRequestUploadsRoot() {
  const cwd = process.cwd();
  const rootCandidate = path.resolve(cwd, "backend", "uploads", "requests");
  const workspaceCandidate = path.resolve(cwd, "uploads", "requests");

  if (existsSync(path.resolve(cwd, "backend"))) {
    return rootCandidate;
  }

  return workspaceCandidate;
}

export function ensureRequestUploadsDir(requestId?: string) {
  const uploadDir = path.join(getRequestUploadsRoot(), requestId ?? "");
  return mkdir(uploadDir, { recursive: true }).then(() => uploadDir);
}

export function ensureRequestTempUploadsDirSync() {
  const uploadDir = path.join(getRequestUploadsRoot(), "_tmp");
  mkdirSync(uploadDir, { recursive: true });
  return uploadDir;
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

export function makeStoredRequestFileName(originalName: string) {
  const extension = getSafeFileExtension(originalName);
  const safeBaseName = sanitizeFileName(originalName);

  return `${Date.now()}-${randomUUID()}-${safeBaseName}.${extension}`;
}

export function validateUploadedRequestFiles(files: UploadedRequestFile[]) {
  if (files.length > MAX_REQUEST_FILES_PER_UPLOAD) {
    throw new RequestFileValidationError(`Можно загрузить не более ${MAX_REQUEST_FILES_PER_UPLOAD} файлов за раз.`);
  }

  for (const file of files) {
    getSafeFileExtension(file.originalname);

    if (file.size > MAX_REQUEST_FILE_SIZE_BYTES) {
      throw new RequestFileValidationError(`Файл ${file.originalname} больше 10 MB.`);
    }

    if (file.mimetype && BLOCKED_MIME_TYPES.has(file.mimetype)) {
      throw new RequestFileValidationError(`Недопустимый MIME-тип файла: ${file.originalname}.`);
    }
  }
}

export function requestFileFilter(
  _request: unknown,
  file: UploadedRequestFile,
  callback: (error: Error | null, acceptFile: boolean) => void
) {
  try {
    getSafeFileExtension(file.originalname);

    if (file.mimetype && BLOCKED_MIME_TYPES.has(file.mimetype)) {
      throw new RequestFileValidationError(`Недопустимый MIME-тип файла: ${file.originalname}.`);
    }

    callback(null, true);
  } catch (error) {
    callback(new BadRequestException(error instanceof Error ? error.message : "Недопустимый файл."), false);
  }
}

export async function persistUploadedRequestFiles(requestId: string, files: UploadedRequestFile[]) {
  validateUploadedRequestFiles(files);

  if (files.length === 0) {
    return [];
  }

  const uploadDir = await ensureRequestUploadsDir(requestId);

  return Promise.all(
    files.map(async (file) => {
      const fileName = file.filename || makeStoredRequestFileName(file.originalname);
      const finalPath = path.join(uploadDir, fileName);

      await rename(file.path, finalPath);

      return {
        fileName,
        fileUrl: `/uploads/requests/${requestId}/${fileName}`,
        fileType: file.mimetype || null,
        sizeBytes: file.size,
        originalName: file.originalname
      };
    })
  );
}

export async function cleanupUploadedRequestFiles(files: UploadedRequestFile[]) {
  await Promise.all(
    files.map((file) =>
      unlink(file.path).catch((error: NodeJS.ErrnoException) => {
        if (error.code === "ENOENT") return;
        throw error;
      })
    )
  );
}

export async function deleteUploadedRequestFile(fileUrl: string): Promise<void> {
  const absoluteFilePath = resolveUploadedRequestFilePath(fileUrl);

  await unlink(absoluteFilePath).catch((error: NodeJS.ErrnoException) => {
    if (error.code === "ENOENT") return;
    throw error;
  });
}

export function resolveUploadedRequestFilePath(fileUrl: string) {
  if (!fileUrl.startsWith("/uploads/requests/")) {
    throw new RequestFileValidationError("Недопустимый путь к файлу.");
  }

  const uploadRoot = path.resolve(getRequestUploadsRoot());
  const relativePath = fileUrl.replace(/^\/uploads\/requests\/?/, "");
  const absoluteFilePath = path.resolve(uploadRoot, relativePath);

  if (absoluteFilePath !== uploadRoot && !absoluteFilePath.startsWith(`${uploadRoot}${path.sep}`)) {
    throw new RequestFileValidationError("Недопустимый путь к файлу.");
  }

  return absoluteFilePath;
}
