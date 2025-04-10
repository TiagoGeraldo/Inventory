'use client';

import { useParams } from 'next/navigation';
import ItemForm from '@/components/items/ItemForm';

export default function EditItemPage() {
  const params = useParams();
  const inventoryId = params.id as string;
  const itemId = params.itemId as string;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit Item</h1>
        <p className="mt-2 text-sm text-gray-600">
          Update the details of this item.
        </p>
      </div>

      <ItemForm inventoryId={inventoryId} itemId={itemId} mode="edit" />
    </div>
  );
} 