'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { get, del, post, put } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface WebPage { id: string; title: string; slug: string; isPublished: boolean; updatedAt: string }

export default function AdminWebPagesPage() {
  const locale = useLocale();
  const router = useRouter();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<WebPage | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-pages'],
    queryFn: () => get<WebPage[]>('/pages/admin/all'),
    select: (res) => res.data,
  });

  const pages = (data as unknown as WebPage[]) || [];

  const { mutate: savePage, isPending: saving } = useMutation({
    mutationFn: () => editing
      ? put(`/pages/${editing.id}`, { title, content, isPublished })
      : post('/pages', { title, content, isPublished }),
    onSuccess: () => {
      toast({ title: editing ? 'Page updated' : 'Page created' });
      qc.invalidateQueries({ queryKey: ['admin-pages'] });
      setShowForm(false); setEditing(null); setTitle(''); setContent('');
    },
  });

  const { mutate: deletePage } = useMutation({
    mutationFn: (id: string) => del(`/pages/${id}`),
    onSuccess: () => { toast({ title: 'Page deleted' }); qc.invalidateQueries({ queryKey: ['admin-pages'] }); },
  });

  function openEdit(page: WebPage) {
    setEditing(page); setTitle(page.title); setShowForm(true);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Web Pages (CMS)</h1>
        <Button onClick={() => { setEditing(null); setTitle(''); setContent(''); setShowForm(true); }} className="bg-artic-orange hover:bg-artic-orange-dark text-black rounded-lg gap-2">
          <Plus className="h-4 w-4" /> New Page
        </Button>
      </div>

      {showForm && (
        <div className="bg-white border rounded-lg p-5 space-y-4">
          <h2 className="font-semibold">{editing ? 'Edit Page' : 'Create New Page'}</h2>
          <div>
            <Label>Title</Label>
            <Input className="mt-1" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="About Us" />
          </div>
          <div>
            <Label>Content (Markdown)</Label>
            <textarea
              className="w-full mt-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-artic-orange resize-y font-mono"
              rows={10}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="# About Us&#10;&#10;Content here..."
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
            <span className="text-sm">Published</span>
          </label>
          <div className="flex gap-3">
            <Button onClick={() => savePage()} disabled={!title || saving} className="bg-artic-orange text-black rounded-lg">
              {saving ? 'Saving...' : 'Save Page'}
            </Button>
            <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); }} className="rounded-lg">Cancel</Button>
          </div>
        </div>
      )}

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Slug</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Last Updated</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 5 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td>)}</tr>
              ))
            ) : pages.map((page) => (
              <tr key={page.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{page.title}</td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{page.slug}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${page.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {page.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(page.updatedAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <a href={`/${locale}/page/${page.slug}`} target="_blank" className="p-1.5 text-gray-400 hover:text-artic-link rounded" aria-label="View page">
                      <Eye className="h-4 w-4" />
                    </a>
                    <button onClick={() => openEdit(page)} className="p-1.5 text-gray-400 hover:text-artic-orange rounded" aria-label="Edit page">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => { if (confirm('Delete this page?')) deletePage(page.id); }} className="p-1.5 text-gray-400 hover:text-red-500 rounded" aria-label="Delete page">
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
