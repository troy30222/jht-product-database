import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";

export type StoredFile = { url: string; key: string; fileName: string };

export interface StorageProvider {
  save(file: File, folder?: string): Promise<StoredFile>;
  delete(key: string): Promise<void>;
}

export class LocalStorageProvider implements StorageProvider {
  private uploadDir = process.env.UPLOAD_DIR ?? "storage/uploads";

  async save(file: File, folder = "products"): Promise<StoredFile> {
    const bytes = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
    const fileName = `${Date.now()}-${safeName}`;
    const relativeKey = path.posix.join(folder, fileName);
    const destination = path.join(process.cwd(), this.uploadDir, relativeKey);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, bytes);
    return { key: relativeKey, fileName, url: `/uploads/${relativeKey}` };
  }

  async delete(key: string): Promise<void> {
    await unlink(path.join(process.cwd(), this.uploadDir, key)).catch(() => undefined);
  }
}

export const storageProvider: StorageProvider = new LocalStorageProvider();
