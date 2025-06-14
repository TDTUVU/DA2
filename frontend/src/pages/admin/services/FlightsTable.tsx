import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTable, useSortBy, usePagination, useGlobalFilter, Column, CellProps, Row } from 'react-table';
import { FiEdit, FiTrash2, FiEye, FiEyeOff, FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight, FiPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { Flight } from '../../../types/flight.types';
import { flightService } from '../../../services/flight.service';
import Modal from '../../../components/common/Modal';
import FlightForm from '../FlightForm';
import { format } from 'date-fns';

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
      placeholder="Tìm kiếm chuyến bay..."
      className="p-2 border border-gray-300 rounded-md text-sm w-full sm:w-64"
    />
  );
};

const FlightsTable: React.FC = () => {
  const [data, setData] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | undefined>(undefined);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await flightService.getAllFlights(1, 1000); 
      setData(result.flights || []);
    } catch (error) {
      toast.error('Không thể tải danh sách chuyến bay.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (flight?: Flight) => {
    setSelectedFlight(flight);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFlight(undefined);
  };
  
  const handleFormSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      if (selectedFlight) {
        await flightService.updateFlight(selectedFlight._id, formData);
        toast.success('Cập nhật chuyến bay thành công!');
      } else {
        await flightService.createFlight(formData);
        toast.success('Thêm chuyến bay mới thành công!');
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
      await flightService.toggleFlightVisibility(id);
      toast.success('Cập nhật trạng thái thành công!');
      setData(prev => prev.map(f => f._id === id ? { ...f, isActive: !f.isActive } : f));
    } catch (error) {
      toast.error('Cập nhật thất bại.');
    }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if(window.confirm('Bạn có chắc chắn muốn xóa chuyến bay này không?')) {
      try {
        await flightService.deleteFlight(id);
        toast.success('Xóa chuyến bay thành công!');
        fetchData();
      } catch (error: any) {
        toast.error(error.message || 'Xóa thất bại.');
      }
    }
  }, [fetchData]);

  const columns = useMemo<Column<Flight>[]>(() => [
    { Header: 'Ảnh', accessor: 'images', Cell: ({ value }: CellProps<Flight, string[] | FileList>) => {
        const imageUrl = Array.isArray(value) && value.length > 0 ? value[0] : 'https://placehold.co/100x80';
        return <img src={imageUrl} alt="Flight" className="w-24 h-20 object-cover rounded" />;
      }
    },
    { Header: 'Tên Chuyến bay', accessor: 'flight_name', Cell: ({ row }: { row: Row<Flight> }) => (
        <div>
          <div className="font-semibold text-gray-900">{row.original.flight_name}</div>
          <div className="text-xs text-gray-500">{row.original.airline}</div>
        </div>
      )
    },
    { Header: 'Hành trình', accessor: 'departure', Cell: ({ row }: { row: Row<Flight> }) => `${row.original.departure} → ${row.original.arrival}` },
    { Header: 'Thời gian', accessor: 'departure_time', Cell: ({ value }: CellProps<Flight, string>) => format(new Date(value), 'dd/MM/yyyy HH:mm') },
    { Header: 'Giá', accessor: 'price', Cell: ({ value }: CellProps<Flight, number>) => `${value.toLocaleString()} ₫` },
    { Header: 'Hiển thị', accessor: 'isActive', Cell: ({ row }: { row: Row<Flight> }) => (
        <button onClick={() => handleToggleVisibility(row.original._id)} className={`p-2 rounded-full ${row.original.isActive ? 'hover:bg-green-200' : 'hover:bg-red-200'}`}>
          {row.original.isActive ? <FiEye className="text-green-600" /> : <FiEyeOff className="text-red-600" />}
        </button>
      )
    },
    { Header: 'Thao tác', id: 'actions', Cell: ({ row }: { row: Row<Flight> }) => (
        <div className="flex space-x-2">
          <button onClick={() => handleOpenModal(row.original)} className="p-2 text-gray-500 hover:text-blue-600" aria-label="Sửa chuyến bay"><FiEdit /></button>
          <button onClick={() => handleDelete(row.original._id)} className="p-2 text-gray-500 hover:text-red-600" aria-label="Xóa chuyến bay"><FiTrash2 /></button>
        </div>
      )
    },
  ], [handleToggleVisibility, handleDelete]);

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
          <FiPlus /> Thêm chuyến bay
        </button>
      </div>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table {...getTableProps()} className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {headerGroups.map(headerGroup => {
              const { key, ...rest } = headerGroup.getHeaderGroupProps();
              return <tr key={key} {...rest}>{headerGroup.headers.map(column => {
                const { key: colKey, ...restCol } = column.getHeaderProps(column.getSortByToggleProps());
                return <th key={colKey} {...restCol} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">{column.render('Header')}<span>{column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}</span></th>
              })}</tr>
            })}
          </thead>
          <tbody {...getTableBodyProps()}>
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
      <div className="py-4 flex items-center justify-between">
        <span className="text-sm text-gray-700">Trang {pageIndex + 1} trên {pageOptions.length}</span>
        <div>
          <button onClick={() => gotoPage(0)} disabled={!canPreviousPage} className="p-1" aria-label="Trang đầu"><FiChevronsLeft /></button>
          <button onClick={() => previousPage()} disabled={!canPreviousPage} className="p-1" aria-label="Trang trước"><FiChevronLeft /></button>
          <button onClick={() => nextPage()} disabled={!canNextPage} className="p-1" aria-label="Trang sau"><FiChevronRight /></button>
          <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage} className="p-1" aria-label="Trang cuối"><FiChevronsRight /></button>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedFlight ? 'Chỉnh sửa Chuyến bay' : 'Thêm Chuyến bay mới'}>
        <FlightForm onSubmit={handleFormSubmit} initialData={selectedFlight} isSubmitting={isSubmitting} />
      </Modal>
    </div>
  );
};

export default FlightsTable; 