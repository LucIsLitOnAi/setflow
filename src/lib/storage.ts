/**
 * Storage Abstraction Layer
 * Supports Vercel Blob (default) with a fallback to AWS S3.
 */

export interface StorageProvider {
  upload: (file: Buffer, filename: string) => Promise<string>;
  getDownloadUrl: (path: string) => Promise<string>;
}

// Initial implementation for Vercel Blob (Placeholder)
export const storage: StorageProvider = {
  upload: async (file, filename) => {
    console.log(`Uploading ${filename} to Cloud Storage...`);
    // Logic for Jules to implement (e.g., put(filename, file, { access: 'public' }))
    return `https://storage.placeholder.com/${filename}`;
  },
  getDownloadUrl: async (path) => {
    return path;
  }
};
