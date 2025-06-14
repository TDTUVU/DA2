import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTable, useSortBy, usePagination, useGlobalFilter, Column, CellProps, Row } from 'react-table';
import { FiEdit, FiTrash2, FiEye, FiEyeOff, FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight, FiPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { Hotel } from '../../../types/hotel.types';
import { hotelService } from '../../../services/hotel.service';
import Modal from '../../../components/common/Modal';
import HotelForm from '../HotelForm';

// Component con cho global filter
const GlobalFilter: React.FC<{ globalFilter: any; setGlobalFilter: (filter: any) => void; }> = ({ globalFilter, setGlobalFilter }) => {
  const [value, setValue] = useState(globalFilter);
  useEffect(() => {
    const timeout = setTimeout(() => setGlobalFilter(value || undefined), 300);
    return () => clearTimeout(timeout);
  }, [value, setGlobalFilter]);

  return (
    <input
      value={value || ""}
      onChange={e => setValue(e.target.value)}
      placeholder="Tìm kiếm khách sạn..."
      className="p-2 border border-gray-300 rounded-md text-sm w-full sm:w-64"
    />
  );
};

const HotelsTable: React.FC = () => {
  const [data, setData] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | undefined>(undefined);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await hotelService.getAllHotels(1, 1000); 
      setData(result.hotels || []);
    } catch (error) {
      toast.error('Không thể tải danh sách khách sạn.');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (hotel?: Hotel) => {
    setSelectedHotel(hotel);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedHotel(undefined);
  };
  
  const handleFormSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      if (selectedHotel) {
        await hotelService.updateHotel(selectedHotel._id, formData);
        toast.success('Cập nhật khách sạn thành công!');
      } else {
        await hotelService.createHotel(formData);
        toast.success('Thêm khách sạn mới thành công!');
      }
      fetchData();
      handleCloseModal();
    } catch (error: any) {
      toast.error(error.message || 'Đã xảy ra lỗi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleVisibility = useCallback(async (id: string) => {
    try {
      await hotelService.toggleHotelVisibility(id);
      toast.success('Cập nhật trạng thái thành công!');
      setData(prev => prev.map(h => h._id === id ? { ...h, isActive: !h.isActive } : h));
    } catch (error) {
      toast.error('Cập nhật thất bại.');
    }
  }, []);

  const columns = useMemo<Column<Hotel>[]>(() => [
    { Header: 'Ảnh', accessor: 'images', Cell: ({ value }: CellProps<Hotel, string[]>) => <img src={value?.[0] || 'https://placehold.co/100x80'} alt="Hotel" className="w-24 h-20 object-cover rounded" /> },
    { Header: 'Tên Khách sạn', accessor: 'name', Cell: ({ row }: { row: Row<Hotel> }) => (
        <div>
          <div className="font-semibold text-gray-900">{row.original.name}</div>
          <div className="text-xs text-gray-500">{row.original.location}</div>
        </div>
      )
    },
    { Header: 'Giá/đêm', accessor: 'price_per_night', Cell: ({ value }: CellProps<Hotel, number>) => `${value.toLocaleString()} ₫` },
    { Header: 'Phòng trống', accessor: 'available_rooms' },
    { Header: 'Hiển thị', accessor: 'isActive', Cell: ({ row }: { row: Row<Hotel> }) => (
        <button onClick={() => handleToggleVisibility(row.original._id)} className={`p-2 rounded-full ${row.original.isActive ? 'bg-green-100' : 'bg-red-100'}`}>
          {row.original.isActive ? <FiEye className="text-green-600" /> : <FiEyeOff className="text-red-600" />}
        </button>
      )
    },
    { Header: 'Thao tác', accessor: '_id', Cell: ({ row }: { row: Row<Hotel> }) => (
        <div className="flex space-x-2">
          <button onClick={() => handleOpenModal(row.original)} className="p-2 text-gray-500 hover:text-blue-600" aria-label="Sửa khách sạn"><FiEdit /></button>
          <button className="p-2 text-gray-500 hover:text-red-600" aria-label="Xóa khách sạn"><FiTrash2 /></button>
        </div>
      )
    },
  ], [handleToggleVisibility]);

  const {
    getTableProps, getTableBodyProps, headerGroups, page, prepareRow,
    canPreviousPage, canNextPage, pageOptions, pageCount, gotoPage, nextPage, previousPage, setPageSize,
    state: { pageIndex, pageSize, globalFilter }, setGlobalFilter,
  } = useTable({ columns, data, initialState: { pageIndex: 0, pageSize: 10 } }, useGlobalFilter, useSortBy, usePagination);

  if (loading) return <div className="text-center p-8">Đang tải...</div>;

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
        <button onClick={() => handleOpenModal()} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2">
          <FiPlus /> Thêm khách sạn
        </button>
      </div>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table {...getTableProps()} className="min-w-full divide-y divide-gray-200">
          {/* Header */}
          <thead className="bg-gray-50">
            {headerGroups.map(headerGroup => {
              const { key, ...rest } = headerGroup.getHeaderGroupProps();
              return <tr key={key} {...rest}>{headerGroup.headers.map(column => {
                const { key: colKey, ...restCol } = column.getHeaderProps(column.getSortByToggleProps());
                return <th key={colKey} {...restCol} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">{column.render('Header')}<span>{column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}</span></th>
              })}</tr>
            })}
          </thead>
          {/* Body */}
          <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
            {page.map(row => {
              prepareRow(row);
              const { key, ...rest } = row.getRowProps();
              return <tr key={key} {...rest} className="hover:bg-gray-50">{row.cells.map(cell => {
                const { key: cellKey, ...restCell } = cell.getCellProps();
                return <td key={cellKey} {...restCell} className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{cell.render('Cell')}</td>
              })}</tr>
            })}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="py-4 flex items-center justify-between">
        {/* Pagination controls */}
      </div>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedHotel ? 'Chỉnh sửa Khách sạn' : 'Thêm Khách sạn mới'}>
        <HotelForm onSubmit={handleFormSubmit} initialData={selectedHotel} isSubmitting={isSubmitting} />
      </Modal>
    </div>
  );
};

export default HotelsTable; 