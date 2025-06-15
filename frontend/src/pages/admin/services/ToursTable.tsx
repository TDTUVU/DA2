import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTable, useSortBy, usePagination, useGlobalFilter, Column, CellProps, Row } from 'react-table';
import { FiEdit, FiTrash2, FiEye, FiEyeOff, FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight, FiPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { Tour } from '../../../types/tour.types';
import { tourService } from '../../../services/tour.service';
import Modal from '../../../components/common/Modal';
import TourForm from '../TourForm';

interface GlobalFilterProps {
  globalFilter: any;
  setGlobalFilter: (filterValue: any) => void;
}

const GlobalFilter: React.FC<GlobalFilterProps> = ({ globalFilter, setGlobalFilter }) => {
  const [value, setValue] = useState(globalFilter);
  
  useEffect(() => {
    const timeout = setTimeout(() => {
        setGlobalFilter(value || undefined);
    }, 300);
    return () => clearTimeout(timeout);
  }, [value, setGlobalFilter]);

  return (
    <input
      type="text"
      value={value || ''}
      onChange={e => setValue(e.target.value)}
      placeholder="Tìm kiếm..."
      className="p-2 border rounded w-full sm:w-64 text-sm"
    />
  );
};

const ToursTable: React.FC = () => {
  const [data, setData] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTour, setSelectedTour] = useState<Tour | undefined>(undefined);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await tourService.getAllTours(1, 1000); 
      setData(result.tours || []);
    } catch (error) {
      toast.error('Không thể tải danh sách tour.');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = useCallback((tour?: Tour) => {
    setSelectedTour(tour);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedTour(undefined);
  }, []);
  
  const handleFormSubmit = useCallback(async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      if (selectedTour) {
        await tourService.updateTour(selectedTour._id, formData);
        toast.success('Cập nhật tour thành công!');
      } else {
        await tourService.createTour(formData);
        toast.success('Thêm tour mới thành công!');
      }
      fetchData();
      handleCloseModal();
    } catch (error: any) {
      toast.error(error.message || 'Đã xảy ra lỗi.');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedTour, fetchData, handleCloseModal]);

  const handleToggleVisibility = useCallback(async (id: string) => {
    try {
      setData(prevData => prevData.map(tour => tour._id === id ? { ...tour, isActive: !tour.isActive } : tour));
      await tourService.toggleTourVisibility(id);
      toast.success('Cập nhật trạng thái hiển thị thành công!');
    } catch (error) {
      toast.error('Cập nhật thất bại.');
      fetchData();
    }
  }, [fetchData]);

  const columns = useMemo<Column<Tour>[]>(
    () => [
      {
        Header: 'ẢNH',
        accessor: 'images',
        Cell: ({ value }: CellProps<Tour, string[]>) => <img src={value?.[0] || 'https://placehold.co/100x80'} alt="Tour" className="w-24 h-20 object-cover rounded" />,
        disableSortBy: true,
      },
      {
        Header: 'THÔNG TIN TOUR',
        accessor: 'tour_name',
        Cell: ({row}: { row: Row<Tour> }) => (
          <div>
            <div className="font-semibold text-gray-900">{row.original.tour_name}</div>
            <div className="text-xs text-gray-500 truncate w-64">{row.original.description}</div>
          </div>
        )
      },
      {
        Header: 'THỜI GIAN',
        accessor: 'duration',
        Cell: ({ value }: CellProps<Tour, string>) => (
          <div className="text-sm text-gray-600">{value} ngày</div>
        ),
      },
      {
        Header: 'GIÁ/NGƯỜI',
        accessor: 'price_per_person',
        Cell: ({ value }: CellProps<Tour, number>) => (
          <div className="text-sm text-gray-600">{value.toLocaleString()} ₫</div>
        ),
      },
      {
        Header: 'SỐ CHỖ',
        accessor: 'available_seats',
        Cell: ({ value }: CellProps<Tour, number>) => (
          <div className="text-sm text-gray-600">{value}</div>
        ),
      },
      {
        Header: 'ĐÁNH GIÁ',
        accessor: 'rating',
        Cell: ({ value }: CellProps<Tour, number>) => (
          <div className="text-sm text-gray-600">{value ? value.toFixed(1) : 'N/A'}</div>
        ),
      },
      {
        Header: 'HIỂN THỊ',
        accessor: 'isActive',
        Cell: ({ row }: { row: Row<Tour> }) => (
          <button 
            onClick={() => handleToggleVisibility(row.original._id)} 
            className={`p-2 rounded-full transition-colors duration-200 ${row.original.isActive ? 'bg-green-100 hover:bg-green-200' : 'bg-red-100 hover:bg-red-200'}`}
            title={row.original.isActive ? 'Ẩn tour' : 'Hiện tour'}
          >
            {row.original.isActive ? <FiEye className="text-green-600" /> : <FiEyeOff className="text-red-600" />}
          </button>
        ),
      },
      {
        Header: 'THAO TÁC',
        accessor: '_id',
        Cell: ({ row }: { row: Row<Tour> }) => (
          <div className="flex space-x-2">
            <button 
              onClick={() => handleOpenModal(row.original)}
              className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
              title="Sửa tour"
            >
              <FiEdit />
            </button>
            <button 
              className="p-2 text-gray-500 hover:text-red-600 transition-colors"
              title="Xóa tour"
            >
              <FiTrash2 />
            </button>
          </div>
        ),
        disableSortBy: true,
      },
    ],
    [handleOpenModal, handleToggleVisibility]
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize, globalFilter },
    setGlobalFilter,
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  if (loading) return <div className="text-center p-8">Đang tải dữ liệu...</div>;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <GlobalFilter globalFilter={globalFilter} setGlobalFilter={setGlobalFilter} />
          <button 
            onClick={() => handleOpenModal()} 
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-semibold text-sm transition-all flex items-center justify-center gap-2"
          >
            <FiPlus />
            Thêm tour mới
          </button>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden">
          {page.length === 0 ? (
            <div className="text-center py-4">Không có dữ liệu</div>
          ) : (
            <div className="space-y-4">
              {page.map(row => {
                prepareRow(row);
                const tour = row.original;
                return (
                  <div key={tour._id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex gap-4">
                      <img 
                        src={tour.images?.[0] || 'https://placehold.co/100x80'} 
                        alt={tour.tour_name} 
                        className="w-24 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{tour.tour_name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2">{tour.description}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Giá: </span>
                        <span className="font-medium">{tour.price_per_person.toLocaleString()} ₫</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Thời gian: </span>
                        <span className="font-medium">{tour.duration}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <button 
                        onClick={() => handleToggleVisibility(tour._id)}
                        className={`p-2 rounded-full transition-colors duration-200 ${tour.isActive ? 'bg-green-100 hover:bg-green-200' : 'bg-red-100 hover:bg-red-200'}`}
                        title={tour.isActive ? 'Ẩn tour' : 'Hiện tour'}
                      >
                        {tour.isActive ? <FiEye className="text-green-600" /> : <FiEyeOff className="text-red-600" />}
                      </button>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleOpenModal(tour)}
                          className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                          title="Sửa tour"
                        >
                          <FiEdit />
                        </button>
                        <button 
                          className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                          title="Xóa tour"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden lg:block overflow-x-auto">
        <table {...getTableProps()} className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {headerGroups.map(headerGroup => {
              const { key, ...restHeaderGroupProps } = headerGroup.getHeaderGroupProps();
              return (
                <tr key={key} {...restHeaderGroupProps}>
                  {headerGroup.headers.map(column => {
                      const { key, ...restColumn } = column.getHeaderProps(column.getSortByToggleProps());
                    return (
                        <th
                          key={key}
                          {...restColumn}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                        {column.render('Header')}
                          <span>
                            {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              );
            })}
          </thead>
          <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
            {page.map(row => {
              prepareRow(row);
              const { key, ...rowProps } = row.getRowProps();
              return (
                <tr key={key} {...rowProps}>
                  {row.cells.map(cell => {
                    const { key, ...cellProps } = cell.getCellProps();
                    return (
                      <td
                        key={key}
                        {...cellProps}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-600"
                      >
                        {cell.render('Cell')}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

        {/* Pagination */}
        <div className="py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <span className="text-sm text-gray-700 whitespace-nowrap">
              Trang <span className="font-medium">{pageIndex + 1}</span> / <span className="font-medium">{pageOptions.length}</span>
            </span>
            <select
              value={pageSize}
              onChange={e => setPageSize(Number(e.target.value))}
              className="p-2 border rounded w-full sm:w-auto text-sm"
              title="Số dòng mỗi trang"
              aria-label="Số dòng mỗi trang"
            >
              {[10, 20, 30, 40, 50].map(size => (
                <option key={size} value={size}>
                  Hiển thị {size}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => gotoPage(0)}
              disabled={!canPreviousPage}
              className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white"
              title="Trang đầu tiên"
            >
              <FiChevronsLeft />
              </button>
            <button
              onClick={() => previousPage()}
              disabled={!canPreviousPage}
              className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white"
              title="Trang trước"
            >
              <FiChevronLeft />
              </button>
            <button
              onClick={() => nextPage()}
              disabled={!canNextPage}
              className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white"
              title="Trang sau"
            >
              <FiChevronRight />
              </button>
            <button
              onClick={() => gotoPage(pageCount - 1)}
              disabled={!canNextPage}
              className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white"
              title="Trang cuối"
            >
              <FiChevronsRight />
              </button>
          </div>
        </div>
      </div>
      
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedTour ? 'Chỉnh sửa tour' : 'Thêm tour mới'}
      >
        <TourForm 
          tour={selectedTour}
          onSubmit={handleFormSubmit}
          isSubmitting={isSubmitting}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
};

export default ToursTable; 