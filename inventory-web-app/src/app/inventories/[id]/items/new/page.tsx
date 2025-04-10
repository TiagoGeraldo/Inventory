'use client';

import { useParams } from 'next/navigation';
import ItemForm from '@/components/items/ItemForm';

export default function NewItemPage() {
  const params = useParams();
  const inventoryId = params.id as string;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Add New Item</h1>
        <p className="mt-2 text-sm text-gray-600">
          Create a new item in this inventory.
        </p>
      </div>

      <ItemForm inventoryId={inventoryId} mode="create" />
    </div>
  );
} 