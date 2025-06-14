import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Flight } from '../../types/flight.types';
import { format } from 'date-fns';

type FlightFormData = Omit<Flight, 'images'> & {
  images: string[] | FileList;
};

interface FlightFormProps {
  onSubmit: (data: FormData) => void;
  initialData?: Flight;
  isSubmitting: boolean;
}

const formatDateForInput = (dateString?: string) => {
  if (!dateString) return '';
  try {
    return format(new Date(dateString), "yyyy-MM-dd'T'HH:mm");
  } catch (error) {
    return '';
  }
};

const FlightForm: React.FC<FlightFormProps> = ({ onSubmit, initialData, isSubmitting }) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FlightFormData>({
    defaultValues: initialData ? {
      ...initialData,
      departure_time: formatDateForInput(initialData.departure_time),
      arrival_time: formatDateForInput(initialData.arrival_time),
    } : {},
  });

  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.images && typeof initialData.images[0] === 'string' ? initialData.images[0] : null
  );
  const imageFiles = watch('images' as any);

  useEffect(() => {
    if (imageFiles && imageFiles.length > 0 && imageFiles[0] instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(imageFiles[0]);
    } else if (initialData?.images && typeof initialData.images[0] === 'string') {
      setImagePreview(initialData.images[0]);
    } else {
      setImagePreview(null);
    }
  }, [imageFiles, initialData]);

  const handleFormSubmit: SubmitHandler<FlightFormData> = (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === '_id' || key === 'createdAt' || key === 'updatedAt') return;
      
      const value = data[key as keyof FlightFormData];
      if (key === 'images') {
        if (value instanceof FileList) {
          for (let i = 0; i < value.length; i++) {
            formData.append('images', value[i]);
          }
        }
      } else if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });
    onSubmit(formData);
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
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">Giá vé (VND)</label>
          <input id="price" type="number" {...register('price', { required: true, valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div>
          <label htmlFor="available_seats" className="block text-sm font-medium text-gray-700">Số ghế trống</label>
          <input id="available_seats" type="number" {...register('available_seats', { required: true, valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div className="sm:col-span-1">
          <label htmlFor="rating" className="block text-sm font-medium text-gray-700">Đánh giá (0-5)</label>
          <input id="rating" type="number" step="0.1" {...register('rating', { required: true, valueAsNumber: true, min: 0, max: 5 })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="images" className="block text-sm font-medium text-gray-700">Hình ảnh</label>
          <input id="images" type="file" {...register('images')} accept="image/*" multiple className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg" />
          {imagePreview && <img src={imagePreview} alt="Xem trước" className="mt-4 h-40 w-auto object-cover rounded-lg shadow" />}
        </div>
      </div>
      <div className="pt-5">
        <div className="flex justify-end">
          <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-8 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">
            {isSubmitting ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default FlightForm; 