'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Inventory, Item } from '@/types/database';

export default function InventoryDetailPage({ params }: { params: { id: string } }) {
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchInventoryAndItems = async () => {
      try {
        // Fetch inventory
        const { data: inventoryData, error: inventoryError } = await supabase
          .from('inventories')
          .select('*')
          .eq('id', params.id)
          .single();

        if (inventoryError) {
          throw inventoryError;
        }

        if (!inventoryData) {
          setError('Inventory not found');
          return;
        }

        setInventory(inventoryData);

        // Fetch items
        const { data: itemsData, error: itemsError } = await supabase
          .from('items')
          .select('*')
          .eq('inventory_id', params.id)
          .order('created_at', { ascending: false });

        if (itemsError) {
          throw itemsError;
        }

        setItems(itemsData || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load inventory');
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryAndItems();
  }, [params.id, supabase]);

  const handleDeleteInventory = async () => {
    if (!confirm('Are you sure you want to delete this inventory? This will also delete all items in it.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('inventories')
        .delete()
        .eq('id', params.id);

      if (error) throw error;

      router.push('/inventories');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to delete inventory');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
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
        <div className="max-w-7xl mx-auto">
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
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            {inventory.icon ? (
              <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-md bg-indigo-100 text-indigo-600 mr-4">
                <span className="text-2xl">{inventory.icon}</span>
              </div>
            ) : (
              <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-md bg-gray-100 text-gray-600 mr-4">
                <svg
                  className="h-8 w-8"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold">{inventory.name}</h1>
              {inventory.description && (
                <p className="text-gray-500 mt-1">{inventory.description}</p>
              )}
            </div>
          </div>
          <div className="flex space-x-3">
            <Link
              href={`/inventories/${inventory.id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Edit
            </Link>
            <button
              onClick={handleDeleteInventory}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Items</h2>
            <Link
              href={`/inventories/${inventory.id}/items/new`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Item
            </Link>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items yet</h3>
              <p className="text-gray-500 mb-4">Add your first item to this inventory</p>
              <Link
                href={`/inventories/${inventory.id}/items/new`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Item
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.location || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/inventories/${inventory.id}/items/${item.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={async () => {
                            if (confirm('Are you sure you want to delete this item?')) {
                              const { error } = await supabase
                                .from('items')
                                .delete()
                                .eq('id', item.id);
                              
                              if (!error) {
                                setItems(items.filter(i => i.id !== item.id));
                              }
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 