import ProductForm from '../product-form';

export default function CreateProductPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Add New Product</h1>
        <p className="text-sm text-gray-500 mt-1">Fill in the product details below</p>
      </div>
      <ProductForm />
    </div>
  );
}
