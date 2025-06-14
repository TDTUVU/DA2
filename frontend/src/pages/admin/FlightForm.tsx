import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Flight } from '../../types/flight.types';
import { format } from 'date-fns';
import { FiTrash2 } from 'react-icons/fi';

type FlightFormData = Omit<Flight, 'images'> & {
  images: FileList | string[];
};

interface FlightFormProps {
  onSubmit: (data: FormData) => void;
  initialData?: Flight;
  isSubmitting: boolean;
}

function formatDateForInput(date: string | Date): string {
  return format(new Date(date), "yyyy-MM-dd'T'HH:mm");
}

const FlightForm: React.FC<FlightFormProps> = ({ onSubmit, initialData, isSubmitting }) => {
  const { register, handleSubmit, watch, setValue } = useForm<FlightFormData>({
    defaultValues: initialData ? {
      ...initialData,
      departure_time: formatDateForInput(initialData.departure_time),
      arrival_time: formatDateForInput(initialData.arrival_time),
    } : {},
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>(
    initialData?.images && Array.isArray(initialData.images) ? initialData.images : []
  );
  const imageFiles = watch('images');

  useEffect(() => {
    if (imageFiles instanceof FileList && imageFiles.length > 0) {
      const newPreviews: string[] = [];
      Array.from(imageFiles).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            newPreviews.push(reader.result);
            setImagePreviews([...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
    } else if (initialData?.images && Array.isArray(initialData.images)) {
      setImagePreviews(initialData.images);
    } else {
      setImagePreviews([]);
    }
  }, [imageFiles, initialData]);

  const handleFormSubmit: SubmitHandler<FlightFormData> = (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === '_id' || key === 'createdAt' || key === 'updatedAt') return;
      
      const value = data[key as keyof FlightFormData];
      if (key === 'images') {
        if (value instanceof FileList) {
          Array.from(value).forEach(file => {
            formData.append('images', file);
          });
        } else if (Array.isArray(value)) {
          // Nếu là mảng string (ảnh cũ), thêm vào formData dưới dạng JSON
          formData.append('existingImages', JSON.stringify(value));
        }
      } else if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });
    onSubmit(formData);
  };

  const handleRemoveImage = (index: number) => {
    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
    
    if (initialData?.images) {
      const newImages = Array.isArray(initialData.images) ? [...initialData.images] : [];
      newImages.splice(index, 1);
      setValue('images', newImages);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <label htmlFor="flight_name" className="block text-sm font-medium text-gray-700">Tên chuyến bay</label>
          <input id="flight_name" type="text" {...register('flight_name', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div className="sm:col-span-1">
          <label htmlFor="airline" className="block text-sm font-medium text-gray-700">Hãng hàng không</label>
          <input id="airline" type="text" {...register('airline', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div className="sm:col-span-1">
          <label htmlFor="departure" className="block text-sm font-medium text-gray-700">Nơi đi</label>
          <input id="departure" type="text" {...register('departure', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div className="sm:col-span-1">
          <label htmlFor="arrival" className="block text-sm font-medium text-gray-700">Nơi đến</label>
          <input id="arrival" type="text" {...register('arrival', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div className="sm:col-span-1">
          <label htmlFor="departure_time" className="block text-sm font-medium text-gray-700">Giờ khởi hành</label>
          <input id="departure_time" type="datetime-local" {...register('departure_time', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div className="sm:col-span-1">
          <label htmlFor="arrival_time" className="block text-sm font-medium text-gray-700">Giờ hạ cánh</label>
          <input id="arrival_time" type="datetime-local" {...register('arrival_time', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div className="sm:col-span-1">
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">Giá vé (VND)</label>
          <input id="price" type="number" {...register('price', { required: true, valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div className="sm:col-span-1">
          <label htmlFor="available_seats" className="block text-sm font-medium text-gray-700">Số ghế trống</label>
          <input id="available_seats" type="number" {...register('available_seats', { required: true, valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div className="sm:col-span-1">
          <label htmlFor="rating" className="block text-sm font-medium text-gray-700">Đánh giá (0-5)</label>
          <input id="rating" type="number" step="0.1" {...register('rating', { required: true, valueAsNumber: true, min: 0, max: 5 })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
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
                      onClick={() => handleRemoveImage(index)}
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
            className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-8 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default FlightForm; 