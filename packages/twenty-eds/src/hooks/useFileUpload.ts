import { getAuthToken } from '@eds/utils/api';
import { useCallback, useState } from 'react';

export type UseFileUploadReturn = {
  uploadFile: (file: File) => Promise<{
    success: boolean;
    url?: string;
    error?: string;
  }>;
  uploading: boolean;
  progress: number;
};

// Twenty's file upload uses a REST endpoint: POST /files with multipart/form-data
const apiBaseUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(
  /\/$/,
  '',
);
const FILES_URL = apiBaseUrl ? `${apiBaseUrl}/files` : '/files';

export const useFileUpload = (): UseFileUploadReturn => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = useCallback(
    async (
      file: File,
    ): Promise<{ success: boolean; url?: string; error?: string }> => {
      setUploading(true);
      setProgress(0);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const token = getAuthToken();

        // Use XMLHttpRequest for progress tracking
        const result = await new Promise<{
          success: boolean;
          url?: string;
          error?: string;
        }>((resolve) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 100);
              setProgress(percent);
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText) as { url?: string };
                resolve({ success: true, url: response.url });
              } catch {
                resolve({ success: false, error: 'Invalid response from server' });
              }
            } else {
              resolve({
                success: false,
                error: `Upload failed with status ${xhr.status}`,
              });
            }
          });

          xhr.addEventListener('error', () => {
            resolve({ success: false, error: 'Network error during upload' });
          });

          xhr.addEventListener('abort', () => {
            resolve({ success: false, error: 'Upload aborted' });
          });

          xhr.open('POST', FILES_URL);

          if (token) {
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          }

          xhr.send(formData);
        });

        return result;
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        };
      } finally {
        setUploading(false);
      }
    },
    [],
  );

  return { uploadFile, uploading, progress };
};
