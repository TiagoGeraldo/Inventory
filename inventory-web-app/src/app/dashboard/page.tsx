'use client';

import LogoutButton from '@/components/LogoutButton';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    };
    
    getUser();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <LogoutButton />
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome to your Inventory</h2>
          <div className="mb-4">
            <p className="text-gray-600">Logged in as: {user?.email}</p>
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-2">What's next?</h3>
            <p className="text-gray-600">
              Start by adding locations and items to your inventory.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 