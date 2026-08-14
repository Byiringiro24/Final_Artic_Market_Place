'use client';

import { useQuery } from '@tanstack/react-query';
import { use } from 'react';
import { get } from '@/lib/api';
import ProductForm from '../product-form';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading } = useQuery({
    queryKey: ['product-admin', id],
    queryFn: () => get(`/products/id/${id}`),
  });

  if (isLoading) return <div className="skeleton h-96 rounded-lg" />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <ProductForm initialData={data?.data as never} productId={id} />
    </div>
  );
}
