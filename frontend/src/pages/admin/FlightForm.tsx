import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { formatDateForInput } from '../../utils/format';
import ImageUpload from '../../components/shared/ImageUpload';

interface FlightFormProps {
  onSubmit: (data: FormData) => void;
  initialData?: any;
  isSubmitting?: boolean;
}

interface FlightFormData {
  flight_name: string;
  departure: string;
  arrival: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  available_seats: number;
  airline: string;
  rating?: number;
  images?: FileList | string[];
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
}

const FlightForm: React.FC<FlightFormProps> = ({ onSubmit, initialData, isSubmitting }) => {
  const { register, handleSubmit, setValue } = useForm<FlightFormData>({
    defaultValues: initialData ? {
      ...initialData,
      departure_time: formatDateForInput(initialData.departure_time),
      arrival_time: formatDateForInput(initialData.arrival_time),
    } : {},
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

  const handleFormSubmit: SubmitHandler<FlightFormData> = (data) => {
    const formData = new FormData();
    
    // Thêm các trường dữ liệu cơ bản
    Object.keys(data).forEach(key => {
      if (key === '_id' || key === 'createdAt' || key === 'updatedAt' || key === 'images') return;
      const value = data[key as keyof FlightFormData];
      if (value !== null && value !== undefined) {
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
        <div>
          <label htmlFor="flight_name" className="block text-sm font-medium text-gray-700">Số hiệu chuyến bay</label>
          <input
            type="text"
            id="flight_name"
            {...register('flight_name')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="airline" className="block text-sm font-medium text-gray-700">Hãng bay</label>
          <input
            type="text"
            id="airline"
            {...register('airline')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="departure" className="block text-sm font-medium text-gray-700">Điểm khởi hành</label>
          <input
            type="text"
            id="departure"
            {...register('departure')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="arrival" className="block text-sm font-medium text-gray-700">Điểm đến</label>
          <input
            type="text"
            id="arrival"
            {...register('arrival')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="departure_time" className="block text-sm font-medium text-gray-700">Thời gian khởi hành</label>
          <input
            type="datetime-local"
            id="departure_time"
            {...register('departure_time')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="arrival_time" className="block text-sm font-medium text-gray-700">Thời gian đến</label>
          <input
            type="datetime-local"
            id="arrival_time"
            {...register('arrival_time')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">Giá vé</label>
          <input
            type="number"
            id="price"
            {...register('price')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="available_seats" className="block text-sm font-medium text-gray-700">Số ghế</label>
          <input
            type="number"
            id="available_seats"
            {...register('available_seats')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-gray-700">Đánh giá</label>
          <input
            type="number"
            id="rating"
            {...register('rating')}
            min="0"
            max="5"
            step="0.1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <ImageUpload
            images={images}
            onImagesChange={handleImagesChange}
            onRemoveImage={handleRemoveImage}
            maxImages={5}
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

export default FlightForm; 