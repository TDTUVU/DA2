import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Tour } from '../../types/tour.types';
import { FiTrash2 } from 'react-icons/fi';

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

  // Thay đổi từ một ảnh sang nhiều ảnh
  const [imagePreviews, setImagePreviews] = useState<string[]>(tour?.images || []);
  
  // Theo dõi tệp được chọn
  const imageFiles = watch('images' as any);

  useEffect(() => {
    // Reset previews khi có files mới được chọn
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
    } 
    // Nếu đang ở chế độ sửa và có ảnh cũ
    else if (tour?.images?.length) {
      setImagePreviews(tour.images);
    } 
    // Không có ảnh
    else {
      setImagePreviews([]);
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
                        
                        // Nếu đang ở chế độ sửa, cập nhật giá trị của tour.images
                        if (tour?.images) {
                          const newImages = [...tour.images];
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