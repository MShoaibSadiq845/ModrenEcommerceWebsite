'use client';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Image from 'next/image';
import { RootState } from '@/store/store';
import {
  useGetAllUsersQuery,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
} from '@/store/services/usersApi';
import { TableSkeleton } from '@/components/ui/skeletons/TableSkeleton';
import { PageLoader } from '@/components/ui/PageLoader';
import {
  Award, Trash2, Shield, UserCheck, User as UserIcon,
  Crown, ChevronLeft, ChevronRight, Loader2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ROLE_STYLES: Record<string, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  'User': {
    label: 'User',
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    icon: <UserIcon className="w-3 h-3" />,
  },
  'Admin': {
    label: 'Admin',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    icon: <Shield className="w-3 h-3" />,
  },
  'Super Admin': {
    label: 'Super Admin',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    icon: <Crown className="w-3 h-3" />,
  },
};

export default function AdminUsersPage() {
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const isSuperAdmin = currentUser?.role === 'Super Admin';

  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isFetching } = useGetAllUsersQuery(
    { page: currentPage, limit },
    { refetchOnMountOrArgChange: true },
  );
  const users = data?.users || [];
  const pagination = data?.pagination;

  const [updateRole] = useUpdateUserRoleMutation();
  const [deleteUser] = useDeleteUserMutation();

  // Per-row loading trackers
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleRoleChange = async (id: string, role: string) => {
    setUpdatingRoleId(id);
    try {
      await updateRole({ id, role }).unwrap();
      toast.success('User role updated successfully');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update role');
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteUser(id).unwrap();
      toast.success('User deleted successfully');
      setConfirmDelete(null);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-8 text-center font-['Rubik']">
        <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-900">Super Admin Access Required</h2>
        <p className="text-xs text-gray-400 mt-1">Only Super Admins can manage user accounts and roles.</p>
      </div>
    );
  }

  if (isLoading && !users.length) return <PageLoader message="Loading users..." />;

  const getPageNumbers = () => {
    if (!pagination) return [];
    const pages: (number | '...')[] = [];
    const { totalPages } = pagination;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col gap-6 font-['Rubik']">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-xs text-gray-400 font-['Open_Sans']">
            {pagination
              ? `Showing ${(currentPage - 1) * limit + 1}–${Math.min(currentPage * limit, pagination.total)} of ${pagination.total} users`
              : 'Manage user accounts, roles, and loyalty points'}
          </p>
        </div>
        <div className="text-xs bg-purple-50 border border-purple-200 text-purple-700 px-4 py-2 rounded-xl font-bold w-fit flex items-center gap-2">
          <Crown className="w-3.5 h-3.5" /> Super Admin Access
        </div>
      </div>

      {/* Role Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(ROLE_STYLES).map(([role, style]) => (
          <div
            key={role}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${style.bg} ${style.text}`}
          >
            {style.icon} {style.label}
          </div>
        ))}
      </div>

      {isLoading || isFetching ? (
        <TableSkeleton rows={20} />
      ) : users.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-gray-400 text-xs font-semibold">
          No users found.
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs font-['Open_Sans']">
              <thead>
                <tr className="border-b text-gray-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">User</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3 text-center">Loyalty Points</th>
                  <th className="pb-3">Joined</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                {users.map((u: any) => {
                  const roleStyle = ROLE_STYLES[u.role] || ROLE_STYLES['User'];
                  const isSelf = u._id === currentUser?.id;
                  const isUpdatingRole = updatingRoleId === u._id;
                  const isCurrentlyDeleting = deletingId === u._id;

                  return (
                    <tr key={u._id} className="hover:bg-gray-50 transition-all">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-gray-200">
                            {u.avatar ? (
                              <Image src={u.avatar} alt={u.name || ''} fill className="object-cover" />
                            ) : (
                              <div
                                className={`w-full h-full flex items-center justify-center font-bold text-sm text-white
                                ${['bg-blue-500','bg-green-500','bg-purple-500','bg-amber-500','bg-red-500','bg-indigo-500'][
                                  (u.name || '').charCodeAt(0) % 6
                                ]}`}
                              >
                                {(u.name || '?').charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900">{u.name}</span>
                            {isSelf && (
                              <span className="text-[10px] text-green-600 font-bold">● You</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-gray-500">{u.email}</td>
                      <td className="py-4">
                        {isSelf ? (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${roleStyle.bg} ${roleStyle.text}`}
                          >
                            {roleStyle.icon} {u.role}
                          </span>
                        ) : (
                          <div className="relative">
                            <select
                              value={u.role}
                              onChange={(e) => handleRoleChange(u._id, e.target.value)}
                              disabled={isUpdatingRole}
                              className="bg-gray-100 border border-transparent rounded-xl px-2.5 py-1.5 text-xs font-bold outline-none focus:border-black focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed pr-7"
                            >
                              <option value="User">User</option>
                              <option value="Admin">Admin</option>
                              <option value="Super Admin">Super Admin</option>
                            </select>
                            {isUpdatingRole && (
                              <Loader2 className="w-3 h-3 animate-spin absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-4 text-center">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold">
                          <Award className="w-3 h-3" /> {u.loyaltyPoints || 0}
                        </div>
                      </td>
                      <td className="py-4 text-gray-400">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-4 text-right">
                        {!isSelf && (
                          <button
                            onClick={() => setConfirmDelete(u._id)}
                            disabled={isCurrentlyDeleting}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            title="Delete user"
                          >
                            {isCurrentlyDeleting ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 pt-6 mt-2">
              <button
                disabled={!pagination.hasPrevPage || isFetching}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black hover:text-white hover:border-black transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, idx) =>
                  page === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">...</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page as number)}
                      disabled={isFetching}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all disabled:opacity-60 ${
                        currentPage === page ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>

              <button
                disabled={!pagination.hasNextPage || isFetching}
                onClick={() => setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black hover:text-white hover:border-black transition-all"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full flex flex-col gap-5 shadow-2xl">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-lg text-gray-900">Delete User</h3>
              <p className="text-xs text-gray-500 mt-1">
                This action is permanent and cannot be undone. All user data will be removed.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={deletingId === confirmDelete}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deletingId === confirmDelete}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {deletingId === confirmDelete ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</>
                ) : (
                  'Delete User'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
