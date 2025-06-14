import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Tour } from '../../types/tour.types';

interface TourFormProps {
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  tour?: Tour;
  isSubmitting: boolean;
}

const TourForm: React.FC<TourFormProps> = ({ onSubmit, onCancel, tour, isSubmitting }) => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Tour>({
    defaultValues: tour || {},
  });

  // Hiển thị ảnh đầu tiên trong mảng nếu có dữ liệu ban đầu
  const [imagePreview, setImagePreview] = useState<string | null>(tour?.images?.[0] || null);
  
  // Theo dõi tệp được chọn
  const imageFiles = watch('images' as any);

  useEffect(() => {
    // Nếu người dùng chọn file mới
    if (imageFiles && imageFiles.length > 0 && imageFiles[0] instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(imageFiles[0]);
    } 
    // Nếu đang ở chế độ sửa và có ảnh cũ
    else if (tour?.images?.[0]) {
      setImagePreview(tour.images[0]);
    } 
    // Không có ảnh
    else {
      setImagePreview(null);
    }
  }, [imageFiles, tour]);

  // Chuyển đổi datetime-local sang ISO string khi form được load
  useEffect(() => {
    if (tour?.departure_time) {
      const localDate = new Date(tour.departure_time);
      // Chuyển đổi sang múi giờ địa phương và định dạng yyyy-MM-ddThh:mm
      const localDateTime = new Date(localDate.getTime() - (localDate.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
      setValue('departure_time', localDateTime);
    }
  }, [tour, setValue]);

  const handleFormSubmit = (data: Tour) => {
    const formData = new FormData();
    const { images, ...tourData } = data;

    // Nếu 'images' KHÔNG phải là FileList, nghĩa là không có file mới được chọn.
    // Ta phải thêm lại danh sách ảnh cũ vào dữ liệu gửi đi.
    if (!(images instanceof FileList)) {
      (tourData as any).images = tour?.images || [];
    }
    // Nếu 'images' LÀ FileList, ta đang thay thế ảnh. 
    // tourData sẽ không có trường 'images', backend sẽ hiểu là dùng ảnh mới.
    
    formData.append('data', JSON.stringify(tourData));

    // Chỉ thêm file vào formData nếu người dùng đã chọn file mới.
    if (images instanceof FileList && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        formData.append('images', images[i]);
      }
    }
    
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="tour_name" className="block text-sm font-medium text-gray-700">Tên Tour</label>
          <input
            type="text"
            id="tour_name"
            {...register('tour_name', { required: 'Tên tour là bắt buộc' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {errors.tour_name && <p className="mt-1 text-sm text-red-600">{errors.tour_name.message}</p>}
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
          <label htmlFor="price_per_person" className="block text-sm font-medium text-gray-700">Giá (VND)</label>
          <input
            type="number"
            id="price_per_person"
            {...register('price_per_person', { required: true, valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Thời gian</label>
          <input
            type="text"
            id="duration"
            {...register('duration', { required: true })}
            placeholder="Ví dụ: 3 ngày 2 đêm"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="available_seats" className="block text-sm font-medium text-gray-700">Số chỗ</label>
          <input
            type="number"
            id="available_seats"
            {...register('available_seats', { required: true, valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="departure_location" className="block text-sm font-medium text-gray-700">Điểm khởi hành</label>
          <input
            type="text"
            id="departure_location"
            {...register('departure_location', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="destination" className="block text-sm font-medium text-gray-700">Điểm đến</label>
          <input
            type="text"
            id="destination"
            {...register('destination', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="departure_time" className="block text-sm font-medium text-gray-700">Ngày khởi hành</label>
          <input
            type="datetime-local"
            id="departure_time"
            {...register('departure_time', { required: true })}
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
            className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
          />
          {imagePreview && <img src={imagePreview} alt="Xem trước" className="mt-4 h-40 w-auto object-cover rounded-lg shadow" />}
        </div>
      </div>
      
      <div className="pt-5">
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-8 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-8 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default TourForm; 