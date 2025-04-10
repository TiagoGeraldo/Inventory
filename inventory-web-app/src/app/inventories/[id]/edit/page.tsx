'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import InventoryForm from '@/components/inventory/InventoryForm';
import { createClient } from '@/utils/supabase/client';
import { Inventory } from '@/types/database';

export default function EditInventoryPage({ params }: { params: { id: string } }) {
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const { data, error } = await supabase
          .from('inventories')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) {
          throw error;
        }

        if (!data) {
          setError('Inventory not found');
          return;
        }

        setInventory(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load inventory');
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [params.id, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500">Loading inventory...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !inventory) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-700">{error || 'Inventory not found'}</p>
          </div>
          <button
            onClick={() => router.push('/inventories')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Inventories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Edit Inventory</h1>
        
        <div className="bg-white shadow rounded-lg p-6">
          <InventoryForm inventory={inventory} mode="edit" />
        </div>
      </div>
    </div>
  );
} 