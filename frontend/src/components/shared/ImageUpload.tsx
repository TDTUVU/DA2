import React, { useState, useCallback } from 'react';
import imageCompression from 'browser-image-compression';
import { FiTrash2 } from 'react-icons/fi';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: File[]) => void;
  onRemoveImage: (index: number) => void;
  maxImages?: number;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onImagesChange,
  onRemoveImage,
  maxImages = 10,
  className = ''
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const validateImage = (file: File): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        if (file.size > 5 * 1024 * 1024) {
          reject('Kích thước file không được vượt quá 5MB');
          return;
        }
        resolve(true);
      };
      img.onerror = () => reject('Không thể đọc file ảnh');
    });
  };

  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: file.type
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return new File([compressedFile], `${Date.now()}-${file.name}`, {
        type: compressedFile.type
      });
    } catch (error) {
      console.error('Lỗi khi nén ảnh:', error);
      return file;
    }
  };

  const handleImageChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (files.length + images.length > maxImages) {
      alert(`Chỉ được chọn tối đa ${maxImages} ảnh`);
      event.target.value = '';
      return;
    }

    setIsProcessing(true);
    try {
      const validFiles: File[] = [];
      const processFilePromises = Array.from(files).map(async (file) => {
        try {
          await validateImage(file);
          const compressedFile = await compressImage(file);
          validFiles.push(compressedFile);
        } catch (error) {
          console.error('Lỗi xử lý file:', error);
          alert(error);
        }
      });

      await Promise.all(processFilePromises);
      
      if (validFiles.length > 0) {
        onImagesChange(validFiles);
      }
    } catch (error) {
      console.error('Lỗi xử lý ảnh:', error);
    } finally {
      setIsProcessing(false);
      event.target.value = '';
    }
  }, [onImagesChange, images.length, maxImages]);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Hình ảnh ({images.length}/{maxImages})
        </label>
        {isProcessing && (
          <span className="text-sm text-blue-500">Đang xử lý ảnh...</span>
        )}
      </div>
      
      <input
        type="file"
        onChange={handleImageChange}
        accept="image/*"
        multiple
        disabled={isProcessing || images.length >= maxImages}
        title="Chọn ảnh để tải lên"
        aria-label="Chọn ảnh để tải lên"
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100
          disabled:opacity-50 disabled:cursor-not-allowed"
      />

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group aspect-w-16 aspect-h-9">
              <img
                src={image}
                alt={`Ảnh ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => onRemoveImage(index)}
                  className="text-white hover:text-red-500 transition-colors"
                  title="Xóa ảnh"
                >
                  <FiTrash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 