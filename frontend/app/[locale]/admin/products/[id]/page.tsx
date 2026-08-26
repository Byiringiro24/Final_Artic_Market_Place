'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api';
import ProductForm from '../product-form';

interface Product {
  id: string;
  name: string;
  categoryId: string;
  brandId?: string;
  description?: string;
  shortDesc?: string;
  price: number;
  listPrice: number;
  countInStock: number;
  sku?: string;
  images: string[];
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
  metaTitle?: string;
  metaDesc?: string;
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['product-admin', id],
    queryFn: () => get<Product>(`/products/id/${id}`),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="skeleton h-96 rounded-lg" />
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-2">Product not found or failed to load.</p>
        <a href="../" className="text-artic-link hover:underline text-sm">Back to products</a>
      </div>
    );
  }

  const product = data.data as unknown as Product;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Edit Product</h1>
          <p className="text-sm text-gray-500 mt-1 truncate max-w-md">{product.name}</p>
        </div>
      </div>
      <ProductForm
        productId={id}
        initialData={{
          name: product.name,
          categoryId: product.categoryId,
          brandId: product.brandId,
          description: product.description,
          shortDesc: product.shortDesc,
          price: product.price,
          listPrice: product.listPrice,
          countInStock: product.countInStock,
          sku: product.sku,
          images: product.images || [],
          tags: (product.tags || []).join(', '),
          isPublished: product.isPublished,
          isFeatured: product.isFeatured,
          metaTitle: product.metaTitle,
          metaDesc: product.metaDesc,
        }}
      />
    </div>
  );
}
