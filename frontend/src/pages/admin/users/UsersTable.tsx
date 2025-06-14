import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTable, useSortBy, usePagination, useGlobalFilter, Column, Row } from 'react-table';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight, FiFilter } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { User } from '../../../types/user.types';
import { userService } from '../../../services/user.service';
import { useAuth } from '../../../context/AuthContext';
import UserDetailModal from './UserDetailModal';

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
      placeholder="Tìm kiếm theo tên, email..."
      className="p-2 border border-gray-300 rounded-md text-sm w-full sm:w-64"
    />
  );
};

interface FetchDataProps {
  pageSize: number;
  pageIndex: number;
  globalFilter?: string;
  role: string;
}

const UsersTable: React.FC = () => {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageCount, setPageCount] = useState(0);
  const [roleFilter, setRoleFilter] = useState('');
  const { user: currentUser } = useAuth();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const fetchData = useCallback(async ({ pageSize, pageIndex, globalFilter, role }: FetchDataProps) => {
    setLoading(true);
    try {
      const result = await userService.getAllUsers(pageIndex + 1, pageSize, globalFilter || '', role);
      setData(result.users || []);
      setPageCount(result.pages || 0);
    } catch (error) {
      toast.error('Không thể tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    setUserToDelete(id);
    setIsDeleteDialogOpen(true);
  }, []);

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      await userService.deleteUser(userToDelete);
      toast.success('Xóa người dùng thành công!');
      setData(prev => prev.filter(user => user._id !== userToDelete));
    } catch (error: any) {
      toast.error(error.message || 'Xóa thất bại.');
    } finally {
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleViewDetail = (user: User) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  const handleUserUpdate = async (updatedUser: User) => {
    setData(prev => prev.map(user => 
      user._id === updatedUser._id ? updatedUser : user
    ));

    await fetchData({
      pageSize: state.pageSize,
      pageIndex: state.pageIndex,
      globalFilter: state.globalFilter,
      role: roleFilter
    });
  };

  const columns = useMemo<Column<User>[]>(() => [
    { Header: 'ID', accessor: '_id', Cell: ({ value }: { value: string }) => <span>{value.slice(-6)}</span> },
    { Header: 'Tên Người dùng', accessor: 'full_name' },
    { Header: 'Email', accessor: 'email' },
    { Header: 'SĐT', accessor: 'phone_number', Cell: ({ value }: { value?: string }) => value || 'N/A' },
    { Header: 'Chức vụ', accessor: 'role', Cell: ({ value }: { value: string }) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            value === 'admin' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
            {value === 'admin' ? 'Quản Trị Viên' : 'Người dùng'}
        </span>
      )
    },
    { Header: 'Hành động', id: 'actions', Cell: ({ row }: { row: Row<User> }) => (
        <div className="flex space-x-2">
          <button 
            onClick={() => handleViewDetail(row.original)}
            className="text-blue-600 hover:text-blue-900"
          >
            Chi tiết
          </button>
          <button 
            onClick={() => handleDelete(row.original._id)} 
            disabled={row.original._id === (currentUser as any)?._id || row.original._id === (currentUser as any)?.id}
            className="text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Xóa
          </button>
        </div>
      )
    },
  ], [currentUser, handleDelete]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state,
    setGlobalFilter,
  } = useTable(
    { 
      columns, 
      data, 
      initialState: { pageIndex: 0, pageSize: 10 }, 
      manualPagination: true, 
      pageCount: pageCount, 
      autoResetPage: false 
    },
    useGlobalFilter, 
    useSortBy, 
    usePagination
  );

  useEffect(() => {
    fetchData({ 
      pageIndex: state.pageIndex, 
      pageSize: state.pageSize, 
      globalFilter: state.globalFilter, 
      role: roleFilter 
    });
  }, [fetchData, state.pageIndex, state.pageSize, state.globalFilter, roleFilter]);

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <GlobalFilter globalFilter={state.globalFilter} setGlobalFilter={setGlobalFilter} />
          <div className="relative">
            <FiFilter className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="pl-9 p-2 border border-gray-300 rounded-md text-sm"
              aria-label="Lọc theo chức vụ"
            >
              <option value="">Tất cả chức vụ</option>
              <option value="user">Người dùng</option>
              <option value="admin">Quản Trị Viên</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table {...getTableProps()} className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {headerGroups.map(hg => (
                <tr {...hg.getHeaderGroupProps()}>
                  {hg.headers.map(column => (
                    <th {...column.getHeaderProps(column.getSortByToggleProps())} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {column.render('Header')}
                      <span>{column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}</span>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={100} className="text-center p-4">Đang tải...</td></tr>
              ) : (
                page.map(row => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()}>
                      {row.cells.map(cell => (
                        <td {...cell.getCellProps()} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
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
        <div className="py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">Trang {state.pageIndex + 1} / {pageOptions.length}</span>
              <select
                  value={state.pageSize}
                  onChange={e => { setPageSize(Number(e.target.value)) }}
                  className="p-1 border border-gray-300 rounded-md text-sm"
                  aria-label="Số mục mỗi trang"
              >
                  {[10, 20, 50].map(size => (
                      <option key={size} value={size}>Hiển thị {size}</option>
                  ))}
              </select>
          </div>
          <div>
            <button onClick={() => gotoPage(0)} disabled={!canPreviousPage} aria-label="Trang đầu"><FiChevronsLeft /></button>
            <button onClick={() => previousPage()} disabled={!canPreviousPage} aria-label="Trang trước"><FiChevronLeft /></button>
            <button onClick={() => nextPage()} disabled={!canNextPage} aria-label="Trang sau"><FiChevronRight /></button>
            <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage} aria-label="Trang cuối"><FiChevronsRight /></button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-auto">
            <h3 className="text-lg font-medium mb-4">Xác nhận xóa</h3>
            <p className="text-gray-500 mb-4">
              Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setUserToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      <UserDetailModal
        user={selectedUser}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedUser(null);
        }}
        onUpdate={handleUserUpdate}
      />
    </>
  );
};

export default UsersTable; 