'use client';

import { useState } from 'react';
import Link from 'next/link';
import InventoryList from '@/components/inventory/InventoryList';

export default function InventoriesPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Inventories</h1>
          <Link
            href="/inventories/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Inventory
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <InventoryList />
        </div>
      </div>
    </div>
  );
} 