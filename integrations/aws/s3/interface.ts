export interface UploadFile {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  folder?: string;
  key?: string;
}
export interface S3UploadResult {
  key: string;
  url: string;
  publicUrl: string;
}
export interface FileStreamResult {
  stream: Readable;
  contentType: string;
  contentLength: number;
  lastModified: Date;
  fileName: string;
}

export interface FileMetadata {
  contentType: string;
  contentLength: number;
  lastModified: Date;
  fileName: string;
  exists: boolean;
}
