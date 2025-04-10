'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Inventory } from '@/types/database';

export default function InventoryList() {
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchInventories = async () => {
      try {
        const { data, error } = await supabase
          .from('inventories')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setInventories(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load inventories');
      } finally {
        setLoading(false);
      }
    };

    fetchInventories();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-gray-500">Loading inventories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (inventories.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No inventories yet</h3>
        <p className="text-gray-500 mb-4">Create your first inventory to get started</p>
        <Link
          href="/inventories/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create Inventory
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {inventories.map((inventory) => (
        <Link
          key={inventory.id}
          href={`/inventories/${inventory.id}`}
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            {inventory.icon ? (
              <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-md bg-indigo-100 text-indigo-600">
                <span className="text-xl">{inventory.icon}</span>
              </div>
            ) : (
              <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-md bg-gray-100 text-gray-600">
                <svg
                  className="h-6 w-6"
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
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">{inventory.name}</h3>
              {inventory.description && (
                <p className="mt-1 text-sm text-gray-500">{inventory.description}</p>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
} 