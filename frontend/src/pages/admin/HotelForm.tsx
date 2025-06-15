import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import ImageUpload from '../../components/shared/ImageUpload';

interface HotelFormProps {
  onSubmit: (data: FormData) => void;
  initialData?: any;
  isSubmitting?: boolean;
}

interface HotelFormData {
  name: string;
  description: string;
  location: string;
  price_per_night: number;
  available_rooms: number;
  rating?: number;
  amenities: string[];
  images?: FileList | string[];
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
}

const HotelForm: React.FC<HotelFormProps> = ({ onSubmit, initialData, isSubmitting }) => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<HotelFormData>({
    defaultValues: initialData || {},
  });

  const [images, setImages] = useState<string[]>(
    initialData?.images && Array.isArray(initialData.images) ? initialData.images : []
  );
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const handleImagesChange = (uploadedFiles: File[]) => {
    // Tạo URL cho preview
    const newPreviews = uploadedFiles.map(file => URL.createObjectURL(file));
    setImages([...images, ...newPreviews]);
    
    // Lưu files mới
    setNewFiles([...newFiles, ...uploadedFiles]);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    // Nếu index nhỏ hơn số lượng ảnh cũ, nghĩa là đang xóa ảnh cũ
    const oldImagesCount = initialData?.images?.length || 0;
    if (index < oldImagesCount) {
      // Cập nhật lại mảng ảnh cũ trong initialData
      const updatedOldImages = [...(initialData?.images || [])];
      updatedOldImages.splice(index, 1);
      initialData.images = updatedOldImages;
    } else {
      // Xóa file mới
      const newFileIndex = index - oldImagesCount;
      const updatedNewFiles = [...newFiles];
      updatedNewFiles.splice(newFileIndex, 1);
      setNewFiles(updatedNewFiles);
    }
  };

  const handleFormSubmit: SubmitHandler<HotelFormData> = (data) => {
    const formData = new FormData();
    
    // Thêm các trường dữ liệu cơ bản
    Object.keys(data).forEach(key => {
      if (key === '_id' || key === 'createdAt' || key === 'updatedAt' || key === 'images') return;
      const value = data[key as keyof HotelFormData];
      if (Array.isArray(value)) {
        value.forEach(item => formData.append(key, item));
      } else if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    // Thêm ảnh cũ (nếu có)
    if (initialData?.images) {
      formData.append('existingImages', JSON.stringify(initialData.images));
    }

    // Thêm các file ảnh mới
    newFiles.forEach(file => {
      formData.append('images', file);
    });

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Tên khách sạn</label>
          <input
            type="text"
            id="name"
            {...register('name', { required: 'Tên khách sạn là bắt buộc' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Mô tả</label>
          <textarea
            id="description"
            rows={4}
            {...register('description')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">Địa điểm</label>
          <input
            type="text"
            id="location"
            {...register('location', { required: 'Địa điểm là bắt buộc' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>}
        </div>

        <div>
          <label htmlFor="price_per_night" className="block text-sm font-medium text-gray-700">Giá phòng mỗi đêm</label>
          <input
            type="number"
            id="price_per_night"
            {...register('price_per_night', { 
              required: 'Giá phòng là bắt buộc', 
              min: { value: 1, message: 'Giá phòng phải lớn hơn 0' }
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.price_per_night && <p className="mt-1 text-sm text-red-600">{errors.price_per_night.message}</p>}
        </div>

        <div>
          <label htmlFor="available_rooms" className="block text-sm font-medium text-gray-700">Số phòng trống</label>
          <input
            type="number"
            id="available_rooms"
            {...register('available_rooms', { 
              required: 'Số phòng trống là bắt buộc', 
              min: { value: 0, message: 'Số phòng không được âm' }
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.available_rooms && <p className="mt-1 text-sm text-red-600">{errors.available_rooms.message}</p>}
        </div>

        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-gray-700">Đánh giá</label>
          <input
            type="number"
            id="rating"
            step="0.1"
            min="0"
            max="5"
            {...register('rating', { 
              required: 'Đánh giá là bắt buộc', 
              min: { value: 0, message: 'Đánh giá tối thiểu là 0' },
              max: { value: 5, message: 'Đánh giá tối đa là 5' }
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.rating && <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="amenities" className="block text-sm font-medium text-gray-700">Tiện nghi</label>
          <select
            id="amenities"
            multiple
            {...register('amenities')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="wifi">WiFi</option>
            <option value="pool">Hồ bơi</option>
            <option value="gym">Phòng tập gym</option>
            <option value="restaurant">Nhà hàng</option>
            <option value="spa">Spa</option>
            <option value="parking">Bãi đậu xe</option>
            <option value="ac">Điều hòa</option>
            <option value="bar">Quầy bar</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <ImageUpload
            images={images}
            onImagesChange={handleImagesChange}
            onRemoveImage={handleRemoveImage}
            maxImages={10}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Đang lưu...' : 'Lưu'}
        </button>
      </div>
    </form>
  );
};

export default HotelForm; 