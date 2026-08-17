'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { get, del, post, put } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Category { id: string; name: string; slug: string; isActive: boolean; sortOrder: number; _count?: { products: number } }

export default function AdminCategoriesPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => get<Category[]>('/categories'),
    select: (res) => res.data,
  });

  const categories = (data as unknown as Category[]) || [];

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => editing ? put(`/categories/${editing.id}`, { name }) : post('/categories', { name }),
    onSuccess: () => { toast({ title: editing ? 'Category updated' : 'Category created' }); qc.invalidateQueries({ queryKey: ['admin-categories'] }); setShowForm(false); setEditing(null); setName(''); },
  });

  const { mutate: deleteCategory } = useMutation({
    mutationFn: (id: string) => del(`/categories/${id}`),
    onSuccess: () => { toast({ title: 'Category deleted' }); qc.invalidateQueries({ queryKey: ['admin-categories'] }); },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button onClick={() => { setEditing(null); setName(''); setShowForm(!showForm); }} className="bg-artic-teal hover:bg-artic-teal-dark text-black rounded-lg gap-2">
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      {showForm && (
        <div className="bg-white border rounded-lg p-5 space-y-4 max-w-md">
          <h2 className="font-semibold">{editing ? 'Edit Category' : 'New Category'}</h2>
          <div>
            <Label>Name</Label>
            <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Electronics" autoFocus />
          </div>
          <div className="flex gap-3">
            <Button onClick={() => save()} disabled={!name || isPending} className="bg-artic-teal text-black rounded-lg">
              {isPending ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); }} className="rounded-lg">Cancel</Button>
          </div>
        </div>
      )}

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Slug</th>
              <th className="text-center px-4 py-3 font-medium">Status</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <tr key={i}>{[1,2,3,4].map((j) => <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td>)}</tr>)
            ) : categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{cat.name}</td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{cat.slug}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {cat.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => { setEditing(cat); setName(cat.name); setShowForm(true); }} className="p-1.5 text-gray-400 hover:text-artic-teal rounded" aria-label="Edit category">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => { if (confirm('Delete this category?')) deleteCategory(cat.id); }} className="p-1.5 text-gray-400 hover:text-red-500 rounded" aria-label="Delete category">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
