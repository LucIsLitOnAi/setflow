'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useOnboarding } from '@/context/OnboardingContext';
import { UploadCloud, Image as ImageIcon, X, FileImage, Loader2 } from 'lucide-react';

export const UploadView = () => {
  const { state, dispatch } = useOnboarding();
  const [dragActive, setDragActive] = useState<{ main: boolean; tiles: boolean }>({
    main: false,
    tiles: false,
  });
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);

  const handleDrag = (e: React.DragEvent, type: 'main' | 'tiles') => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive((prev) => ({ ...prev, [type]: true }));
    } else if (e.type === 'dragleave') {
      setDragActive((prev) => ({ ...prev, [type]: false }));
    }
  };

  const uploadToMockAPI = async (file: File, localId: string, type: 'main' | 'tile') => {
    try {
      // Create a mock payload to avoid 413 Payload Too Large on our Mock backend.
      // In production, we would use Presigned URLs here.
      const payload = {
        filename: file.name,
        size: file.size,
        type: file.type,
      };

      const res = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success && data.id) {
        dispatch({
          type: 'UPDATE_IMAGE_SERVER_ID',
          payload: { localId, serverId: data.id, type }
        });
      }
    } catch (error) {
      console.error('Error mocking upload to API:', error);
    }
  };

  const processFiles = async (files: File[], type: 'main' | 'tiles') => {
    setIsProcessingFiles(true);

    // Validate files (Accept all requested formats up to 50MB)
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif', '.avif', '.tiff', '.bmp'];

    const validFiles = files.filter(file => {
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      return file.size <= MAX_SIZE && validExtensions.includes(ext);
    });

    try {
      if (type === 'main' && validFiles.length > 0) {
        const file = validFiles[0];
        const localId = crypto.randomUUID();
        const { previewUrl, isUnsupported } = await generatePreview(file);

        dispatch({
          type: 'SET_MAIN_IMAGE',
          payload: { id: localId, file, previewUrl, isUnsupportedBrowserFormat: isUnsupported },
        });

        // Fire and forget mock upload
        uploadToMockAPI(file, localId, 'main');

      } else if (type === 'tiles' && validFiles.length > 0) {
        const processedImages = await Promise.all(
          validFiles.map(async (file) => {
            const localId = crypto.randomUUID();
            const { previewUrl, isUnsupported } = await generatePreview(file);
            return {
              id: localId,
              file,
              previewUrl,
              isUnsupportedBrowserFormat: isUnsupported
            };
          })
        );

        dispatch({ type: 'ADD_TILE_IMAGES', payload: processedImages });

        // Fire and forget mock uploads
        processedImages.forEach(img => {
          uploadToMockAPI(img.file, img.id, 'tile');
        });
      }
    } catch (err) {
      console.error("Error processing files", err);
    } finally {
      setIsProcessingFiles(false);
    }
  };

  const generatePreview = async (file: File): Promise<{ previewUrl: string, isUnsupported?: boolean }> => {
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    // Convert HEIC/HEIF on the fly using heic2any
    if (ext === '.heic' || ext === '.heif') {
      try {
        const heic2any = (await import('heic2any')).default;
        const convertedBlob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.5 });
        const blobArray = Array.isArray(convertedBlob) ? convertedBlob : [convertedBlob];
        return { previewUrl: URL.createObjectURL(blobArray[0]) };
      } catch (e) {
        console.error('Error converting HEIC:', e);
        return { previewUrl: '', isUnsupported: true };
      }
    }

    // For unsupported browser native formats
    if (ext === '.tiff' || ext === '.bmp' || ext === '.avif') {
       return { previewUrl: '', isUnsupported: true };
    }

    return { previewUrl: URL.createObjectURL(file) };
  };

  const handleDrop = (e: React.DragEvent, type: 'main' | 'tiles') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive((prev) => ({ ...prev, [type]: false }));
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files), type);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'tiles') => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files), type);
    }
  };

  const isReady = state.upload.mainImage !== null && state.upload.tileImages.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-4xl flex flex-col items-center"
    >
      <h2 className="text-3xl sm:text-4xl font-semibold mb-8 text-center">
        Upload Your Photos
      </h2>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Main Image Upload Zone */}
        <div className="flex flex-col space-y-4">
          <h3 className="text-xl font-medium">Target Motif (Main Image)</h3>
          <div
            className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl transition-colors min-h-[300px]
              ${dragActive.main ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-900' : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900'}
            `}
            onDragEnter={(e) => handleDrag(e, 'main')}
            onDragLeave={(e) => handleDrag(e, 'main')}
            onDragOver={(e) => handleDrag(e, 'main')}
            onDrop={(e) => handleDrop(e, 'main')}
          >
            {state.upload.mainImage ? (
              <div className="absolute inset-0 p-2 group">
                {state.upload.mainImage.isUnsupportedBrowserFormat ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl">
                    <FileImage className="w-12 h-12 text-gray-400 mb-2" />
                    <span className="text-sm font-medium">{state.upload.mainImage.file.name}</span>
                  </div>
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={state.upload.mainImage.previewUrl}
                    alt="Main Target"
                    className="w-full h-full object-cover rounded-xl"
                  />
                )}
                <button
                  onClick={() => dispatch({ type: 'SET_MAIN_IMAGE', payload: null })}
                  className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-center text-gray-600 dark:text-gray-400 mb-2">
                  Drag & drop your main photo here
                </p>
                <p className="text-xs text-gray-400 mb-4 text-center max-w-[200px]">Max 50MB (JPG, PNG, WEBP, HEIC, TIFF...)</p>
                <label className="cursor-pointer bg-black text-white dark:bg-white dark:text-black px-6 py-2 rounded-full font-medium">
                  Browse File
                  <input
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.webp,.heic,.heif,.avif,.tiff,.bmp"
                    onChange={(e) => handleChange(e, 'main')}
                  />
                </label>
              </>
            )}
          </div>
        </div>

        {/* Tile Images Upload Zone */}
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-end">
            <h3 className="text-xl font-medium">Mosaic Tiles</h3>
            <span className="text-sm text-gray-500">{state.upload.tileImages.length}/30</span>
          </div>
          <div
            className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl transition-colors min-h-[300px]
              ${dragActive.tiles ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-900' : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900'}
            `}
            onDragEnter={(e) => handleDrag(e, 'tiles')}
            onDragLeave={(e) => handleDrag(e, 'tiles')}
            onDragOver={(e) => handleDrag(e, 'tiles')}
            onDrop={(e) => handleDrop(e, 'tiles')}
          >
            {state.upload.tileImages.length === 0 ? (
              <>
                <ImageIcon className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-center text-gray-600 dark:text-gray-400 mb-2">
                  Drag & drop up to 30 photos
                </p>
                <label className="cursor-pointer bg-black text-white dark:bg-white dark:text-black px-6 py-2 rounded-full font-medium">
                  Browse Files
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept=".jpg,.jpeg,.png,.webp,.heic,.heif,.avif,.tiff,.bmp"
                    onChange={(e) => handleChange(e, 'tiles')}
                  />
                </label>
              </>
            ) : (
              <div className="absolute inset-0 p-4 overflow-y-auto">
                <div className="grid grid-cols-4 gap-2">
                  {state.upload.tileImages.map((img) => (
                    <div key={img.id} className="relative group aspect-square">
                      {img.isUnsupportedBrowserFormat ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                          <FileImage className="w-8 h-8 text-gray-400" />
                        </div>
                      ) : (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={img.previewUrl}
                          alt="Tile"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      )}
                      <button
                        onClick={() => dispatch({ type: 'REMOVE_TILE_IMAGE', payload: img.id })}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {state.upload.tileImages.length < 30 && (
                    <label className="cursor-pointer flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg aspect-square hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      <span className="text-2xl text-gray-400">+</span>
                      <input
                        type="file"
                        className="hidden"
                        multiple
                          accept=".jpg,.jpeg,.png,.webp,.heic,.heif,.avif,.tiff,.bmp"
                        onChange={(e) => handleChange(e, 'tiles')}
                      />
                    </label>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <motion.button
        disabled={!isReady || isProcessingFiles}
        onClick={() => dispatch({ type: 'SET_STEP', payload: 'processing' })}
        whileHover={isReady && !isProcessingFiles ? { scale: 1.05 } : {}}
        whileTap={isReady && !isProcessingFiles ? { scale: 0.95 } : {}}
        className={`mt-12 px-10 py-4 rounded-full text-xl font-medium transition-all flex items-center justify-center gap-2 ${
          isReady && !isProcessingFiles
            ? 'bg-black text-white dark:bg-white dark:text-black hover:shadow-lg'
            : 'bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed'
        }`}
      >
        {isProcessingFiles ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            Processing images...
          </>
        ) : (
          'Create My Mosaic'
        )}
      </motion.button>
    </motion.div>
  );
};
