'use client';

import InventoryForm from '@/components/inventory/InventoryForm';

export default function NewInventoryPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create New Inventory</h1>
        
        <div className="bg-white shadow rounded-lg p-6">
          <InventoryForm mode="create" />
        </div>
      </div>
    </div>
  );
} 