import React, { useState, useEffect, useMemo } from 'react';
import { useTable, useSortBy, usePagination, useGlobalFilter, Column } from 'react-table';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight, FiFilter } from 'react-icons/fi';
import { toast } from 'react-toastify';
import BookingDetailModal from './BookingDetailModal';

interface Booking {
  _id: string;
  user_id: {
    _id: string;
    full_name: string;
    email: string;
  };
  hotel_id?: {
    _id: string;
    name: string;
    price_per_night: number;
  };
  flight_id?: {
    _id: string;
    flight_name: string;
    price: number;
  };
  tour_id?: {
    _id: string;
    tour_name: string;
    price_per_person: number;
  };
  booking_date: string;
  check_in?: string;
  check_out?: string;
  total_amount: number;
  payment_status: 'Pending' | 'Paid' | 'Cancelled';
  createdAt: string;
  updatedAt: string;
}

const GlobalFilter: React.FC<{
  globalFilter: string;
  setGlobalFilter: (filter: string | undefined) => void;
}> = ({ globalFilter, setGlobalFilter }) => {
  const [value, setValue] = useState(globalFilter);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setGlobalFilter(value || undefined);
    }, 300);
    return () => clearTimeout(timeout);
  }, [value, setGlobalFilter]);

  return (
    <input
      value={value || ""}
      onChange={e => setValue(e.target.value)}
      placeholder="Tìm kiếm đơn hàng..."
      className="p-2 border border-gray-300 rounded-md text-sm w-full sm:w-64"
    />
  );
};

const BookingsTable: React.FC = () => {
  const [data, setData] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/bookings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setData(result || []);
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleViewDetail = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailModalOpen(true);
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    setUpdatingBookingId(bookingId);
    try {
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      
      // Cập nhật data local và đóng modal nếu đang mở
      setData(prev => prev.map(booking => 
        booking._id === bookingId 
          ? { ...booking, payment_status: newStatus as Booking['payment_status'] }
          : booking
      ));

      // Đóng modal chi tiết nếu đang mở
      if (selectedBooking?._id === bookingId) {
        setIsDetailModalOpen(false);
        setSelectedBooking(null);
      }

      toast.success('Cập nhật trạng thái thành công');
    } catch (error: any) {
      toast.error(error.message || 'Cập nhật trạng thái thất bại');
      // Nếu có lỗi, tải lại dữ liệu để đảm bảo đồng bộ với server
      await fetchBookings();
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getBookingType = (booking: Booking) => {
    if (booking.hotel_id) return 'Khách sạn';
    if (booking.flight_id) return 'Chuyến bay';
    if (booking.tour_id) return 'Tour';
    return 'N/A';
  };

  const getBookingName = (booking: Booking) => {
    if (booking.hotel_id) return booking.hotel_id.name;
    if (booking.flight_id) return booking.flight_id.flight_name;
    if (booking.tour_id) return booking.tour_id.tour_name;
    return 'N/A';
  };

  const columns = useMemo<Column<Booking>[]>(() => [
    {
      Header: 'ID',
      accessor: row => row._id,
      Cell: ({ value }: { value: string }) => <span className="text-sm">{value.slice(-6)}</span>
    },
    {
      Header: 'Khách hàng',
      accessor: row => row.user_id,
      Cell: ({ value }: { value: Booking['user_id'] }) => (
        <div>
          <div className="text-sm font-medium">{value.full_name}</div>
          <div className="text-xs text-gray-500">{value.email}</div>
        </div>
      )
    },
    {
      Header: 'Loại',
      accessor: row => getBookingType(row),
      id: 'bookingType',
      Cell: ({ value }: { value: string }) => <span className="text-sm">{value}</span>
    },
    {
      Header: 'Dịch vụ',
      accessor: row => getBookingName(row),
      id: 'serviceName',
      Cell: ({ value }: { value: string }) => <span className="text-sm">{value}</span>
    },
    {
      Header: 'Tổng tiền',
      accessor: row => row.total_amount,
      Cell: ({ value }: { value: number }) => (
        <span className="text-sm">{value.toLocaleString('vi-VN')} VNĐ</span>
      )
    },
    {
      Header: 'Trạng thái',
      accessor: row => row.payment_status,
      Cell: ({ value }: { value: string }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
          {value === 'Pending' ? 'Chờ thanh toán' : value === 'Paid' ? 'Đã thanh toán' : 'Đã hủy'}
        </span>
      )
    },
    {
      Header: 'Ngày đặt',
      accessor: row => row.booking_date,
      Cell: ({ value }: { value: string }) => (
        <span className="text-sm">{new Date(value).toLocaleDateString('vi-VN')}</span>
      )
    },
    {
      Header: 'Hành động',
      accessor: row => row._id,
      id: 'actions',
      Cell: ({ row }: { row: { original: Booking } }) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewDetail(row.original)}
            className="px-3 py-1 text-xs border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors duration-200"
            title="Xem chi tiết đơn hàng"
          >
            Chi tiết
          </button>
          {row.original.payment_status === 'Pending' && (
            <>
              <button
                onClick={() => handleStatusUpdate(row.original._id, 'Paid')}
                className="px-3 py-1 text-xs border border-green-600 text-green-600 rounded-md hover:bg-green-50 transition-colors duration-200"
                title="Xác nhận thanh toán"
              >
                Xác nhận
              </button>
              <button
                onClick={() => handleStatusUpdate(row.original._id, 'Cancelled')}
                className="px-3 py-1 text-xs border border-red-600 text-red-600 rounded-md hover:bg-red-50 transition-colors duration-200"
                title="Hủy đơn hàng"
              >
                Hủy
              </button>
            </>
          )}
        </div>
      )
    }
  ], []);

  const filteredData = useMemo(() => {
    return statusFilter
      ? data.filter(booking => booking.payment_status === statusFilter)
      : data;
  }, [data, statusFilter]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
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
      data: filteredData,
      initialState: { pageIndex: 0, pageSize: 10 }
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4">
        {/* Search and Filter Section */}
        <div className="flex flex-col gap-4 mb-6">
          <GlobalFilter
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="p-2 border rounded w-full text-sm"
            title="Lọc theo trạng thái"
            aria-label="Lọc theo trạng thái"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Pending">Chờ thanh toán</option>
            <option value="Paid">Đã thanh toán</option>
            <option value="Cancelled">Đã hủy</option>
          </select>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden">
          {loading ? (
            <div className="text-center py-4">Đang tải...</div>
          ) : page.length === 0 ? (
            <div className="text-center py-4">Không có đơn hàng nào</div>
          ) : (
            <div className="space-y-4">
              {page.map(row => {
                prepareRow(row);
                const booking = row.original;
                return (
                  <div key={booking._id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{booking.user_id.full_name}</div>
                        <div className="text-xs text-gray-500">{booking.user_id.email}</div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.payment_status)}`}>
                        {booking.payment_status === 'Pending' ? 'Chờ thanh toán' : booking.payment_status === 'Paid' ? 'Đã thanh toán' : 'Đã hủy'}
                      </span>
                    </div>
                    <div className="text-sm">
                      <div>Loại: {getBookingType(booking)}</div>
                      <div>Dịch vụ: {getBookingName(booking)}</div>
                      <div>Tổng tiền: {booking.total_amount.toLocaleString('vi-VN')} VNĐ</div>
                      <div>Ngày đặt: {new Date(booking.booking_date).toLocaleDateString('vi-VN')}</div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleViewDetail(booking)}
                        className="flex-1 px-3 py-1 text-xs border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
                      >
                        Chi tiết
                      </button>
                      {booking.payment_status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(booking._id, 'Paid')}
                            className="flex-1 px-3 py-1 text-xs border border-green-600 text-green-600 rounded-md hover:bg-green-50"
                          >
                            Xác nhận
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(booking._id, 'Cancelled')}
                            className="flex-1 px-3 py-1 text-xs border border-red-600 text-red-600 rounded-md hover:bg-red-50"
                          >
                            Hủy
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden lg:block overflow-x-auto">
          <table {...getTableProps()} className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map(column => (
                    <th
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column.render('Header')}
                      <span>
                        {column.isSorted
                          ? column.isSortedDesc
                            ? ' 🔽'
                            : ' 🔼'
                          : ''}
                      </span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    Đang tải...
                  </td>
                </tr>
              ) : page.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    Không có đơn hàng nào
                  </td>
                </tr>
              ) : (
                page.map(row => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()}>
                      {row.cells.map(cell => (
                        <td {...cell.getCellProps()} className="px-6 py-4 whitespace-nowrap text-sm">
                          {cell.render('Cell')}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
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

      {isDetailModalOpen && selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedBooking(null);
          }}
          onStatusUpdate={handleStatusUpdate}
          updatingBookingId={updatingBookingId}
        />
      )}
    </div>
  );
};

export default BookingsTable; 