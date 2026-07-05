import sharp from 'sharp'
import path from 'path'
import fs from 'fs/promises'
import crypto from 'crypto'

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads')
const MAX_WIDTH = 800
const QUALITY = 80

export interface StorageService {
  saveImage(buffer: Buffer, originalName: string, entityType: string): Promise<string>
  deleteImage(filePath: string): Promise<void>
}

export class LocalStorageProvider implements StorageService {
  private baseUrl: string

  constructor(baseUrl = '/uploads') {
    this.baseUrl = baseUrl
  }

  async saveImage(buffer: Buffer, originalName: string, entityType: string): Promise<string> {
    const ext = 'webp'
    const filename = `${entityType}_${crypto.randomUUID()}.${ext}`
    const subDir = entityType
    const dir = path.join(UPLOADS_DIR, subDir)

    await fs.mkdir(dir, { recursive: true })

    const optimized = await sharp(buffer)
      .resize(MAX_WIDTH, undefined, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toBuffer()

    await fs.writeFile(path.join(dir, filename), optimized)

    return `${this.baseUrl}/${subDir}/${filename}`
  }

  async deleteImage(filePath: string): Promise<void> {
    const absolutePath = path.join(process.cwd(), filePath.replace(/^\//, ''))
    try {
      await fs.unlink(absolutePath)
    } catch {
      // File doesn't exist, ignore
    }
  }
}
