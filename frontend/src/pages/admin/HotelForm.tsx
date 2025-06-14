import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Hotel } from '../../types/hotel.types';
import { FiTrash2 } from 'react-icons/fi';

// New type for form data
type HotelFormData = Omit<Hotel, 'amenities'> & {
  amenities: string;
};

interface HotelFormProps {
  onSubmit: (data: FormData) => void;
  initialData?: Hotel;
  isSubmitting: boolean;
}

const HotelForm: React.FC<HotelFormProps> = ({ onSubmit, initialData, isSubmitting }) => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<HotelFormData>({
    defaultValues: initialData ? {
      ...initialData,
      amenities: Array.isArray(initialData.amenities) ? initialData.amenities.join(', ') : '',
    } : {},
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>(initialData?.images || []);
  const imageFiles = watch('images' as any);

  useEffect(() => {
    if (imageFiles && imageFiles.length > 0 && imageFiles[0] instanceof File) {
      const newPreviews: string[] = [];
      Array.from(imageFiles).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          setImagePreviews([...newPreviews]);
        };
        reader.readAsDataURL(file as Blob);
      });
    } else if (initialData?.images?.length) {
      setImagePreviews(initialData.images);
    } else {
      setImagePreviews([]);
    }
  }, [imageFiles, initialData]);

  const handleFormSubmit: SubmitHandler<HotelFormData> = (data) => {
    const formData = new FormData();

    // Append all fields from the form data to FormData object
    Object.keys(data).forEach(key => {
        if (key === '_id' || key === 'reviews') return; // Do not include the _id or reviews in the form data

        const value = data[key as keyof HotelFormData];
        if (key === 'images') {
            // Handle FileList
            if (value instanceof FileList) {
                for (let i = 0; i < value.length; i++) {
                    formData.append('images', value[i]);
                }
            }
        } else if (key === 'amenities' && typeof value === 'string') {
            // Split amenities string into an array
            const amenitiesArray = value.split(',').map(item => item.trim()).filter(Boolean);
            amenitiesArray.forEach(amenity => formData.append('amenities[]', amenity));
        } else if (value !== null && value !== undefined) {
            formData.append(key, String(value));
        }
    });

    // If updating and no new images are selected, we don't need to do anything special
    // The backend should handle not receiving an 'images' field as "no change"
    
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Tên khách sạn</label>
          <input
            type="text"
            id="name"
            {...register('name', { required: 'Tên khách sạn là bắt buộc' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">Địa điểm</label>
          <input
            type="text"
            id="location"
            {...register('location', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Mô tả</label>
          <textarea
            id="description"
            {...register('description')}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="price_per_night" className="block text-sm font-medium text-gray-700">Giá mỗi đêm (VND)</label>
          <input
            type="number"
            id="price_per_night"
            {...register('price_per_night', { required: true, valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="available_rooms" className="block text-sm font-medium text-gray-700">Số phòng trống</label>
          <input
            type="number"
            id="available_rooms"
            {...register('available_rooms', { required: true, valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-gray-700">Đánh giá (0-5)</label>
          <input
            type="number"
            id="rating"
            step="0.1"
            {...register('rating', { required: true, valueAsNumber: true, min: 0, max: 5 })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="amenities" className="block text-sm font-medium text-gray-700">Tiện nghi (cách nhau bởi dấu phẩy)</label>
          <input
            type="text"
            id="amenities"
            {...register('amenities')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="images" className="block text-sm font-medium text-gray-700">Hình ảnh</label>
          <input
            type="file"
            id="images"
            {...register('images')}
            accept="image/*"
            multiple
            className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
          />
          {imagePreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={preview} 
                    alt={`Xem trước ${index + 1}`} 
                    className="h-40 w-full object-cover rounded-lg shadow"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <button
                      type="button"
                      title={`Xóa ảnh ${index + 1}`}
                      onClick={() => {
                        const newPreviews = [...imagePreviews];
                        newPreviews.splice(index, 1);
                        setImagePreviews(newPreviews);
                        
                        // Nếu đang ở chế độ sửa, cập nhật giá trị của initialData.images
                        if (initialData?.images) {
                          const newImages = [...initialData.images];
                          newImages.splice(index, 1);
                          setValue('images', newImages);
                        }
                      }}
                      className="text-white hover:text-red-500 transition-colors"
                    >
                      <FiTrash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="pt-5">
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-8 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default HotelForm; 