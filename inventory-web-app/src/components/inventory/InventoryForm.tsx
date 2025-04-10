'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Inventory } from '@/types/database';

type InventoryFormProps = {
  inventory?: Inventory;
  mode: 'create' | 'edit';
};

export default function InventoryForm({ inventory, mode }: InventoryFormProps) {
  const [name, setName] = useState(inventory?.name || '');
  const [description, setDescription] = useState(inventory?.description || '');
  const [icon, setIcon] = useState(inventory?.icon || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'create') {
        const { error } = await supabase.from('inventories').insert({
          name,
          description,
          icon,
        });

        if (error) throw error;
      } else if (mode === 'edit' && inventory) {
        const { error } = await supabase
          .from('inventories')
          .update({
            name,
            description,
            icon,
          })
          .eq('id', inventory.id);

        if (error) throw error;
      }

      router.push('/inventories');
      router.refresh();
    } catch (err: any) {
      setError(err.message || `Failed to ${mode} inventory`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description (optional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          disabled={loading}
        />
      </div>

      <div>
        <label htmlFor="icon" className="block text-sm font-medium text-gray-700">
          Icon (optional)
        </label>
        <input
          type="text"
          id="icon"
          name="icon"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          placeholder="e.g. 📦"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          disabled={loading}
        />
        <p className="mt-1 text-sm text-gray-500">
          You can use emoji or any single character as an icon
        </p>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Saving...' : mode === 'create' ? 'Create Inventory' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
} 