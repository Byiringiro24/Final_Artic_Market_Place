'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Shield, User } from 'lucide-react';
import { get, put } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface UserItem {
  id: string; name: string; email: string; role: string; isActive: boolean;
  emailVerified: boolean; createdAt: string; lastLoginAt?: string;
  _count: { orders: number };
}

export default function AdminUsersPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: () => get<UserItem[]>(`/admin/users?limit=20&page=${page}${search ? `&search=${search}` : ''}`),
  });

  const { mutate: updateUser } = useMutation({
    mutationFn: ({ id, ...payload }: { id: string; role?: string; isActive?: boolean }) =>
      put(`/admin/users/${id}`, payload),
    onSuccess: () => { toast({ title: 'User updated' }); qc.invalidateQueries({ queryKey: ['admin-users'] }); },
    onError: () => toast({ title: 'Update failed', variant: 'destructive' }),
  });

  const users      = (data?.data as unknown as ApiData)?.data || (data?.data as unknown as UserItem[]) || [];
  const pagination = (data?.data as unknown as ApiData)?.pagination ?? (data as unknown as { pagination: { total: number; totalPages: number; page: number } })?.pagination;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Users</h1>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input placeholder="Search users..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">User</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Role</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Orders</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Verified</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Joined</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td>)}</tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-500">No users found</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-artic-teal flex items-center justify-center text-black font-bold text-sm flex-shrink-0">
                          {user.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <select
                        value={user.role}
                        onChange={(e) => updateUser({ id: user.id, role: e.target.value })}
                        className="text-xs border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-artic-teal"
                        aria-label={`Change role for ${user.name}`}
                      >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                        <option value="SELLER">Seller</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center">{user._count.orders}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs ${user.emailVerified ? 'text-green-600' : 'text-gray-400'}`}>
                        {user.emailVerified ? '✓ Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => updateUser({ id: user.id, isActive: !user.isActive })}
                        className={`text-xs px-2 py-1 rounded-full font-medium transition-colors ${
                          user.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-600 hover:bg-red-200'
                        }`}
                        aria-label={user.isActive ? 'Deactivate user' : 'Activate user'}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                        {user.role}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t text-sm">
            <span className="text-gray-500">Total: {pagination.total}</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
              <span className="px-3 py-1">{page} / {pagination.totalPages}</span>
              <Button variant="outline" size="sm" disabled={page === pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
