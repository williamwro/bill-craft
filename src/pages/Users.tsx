
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import UserManagement from '@/components/users/UserManagement';
import { Navigate } from 'react-router-dom';
import Brand from '@/components/navbar/Brand';
import NavLinks from '@/components/navbar/NavLinks';

const Users = () => {
  const { user, isLoading } = useAuth();
  
  // Check if current user is the authorized admin
  const isAuthorizedAdmin = user?.email === 'william@makecard.com.br';
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="animate-pulse space-y-2 flex flex-col items-center">
          <div className="h-10 w-36 bg-gray-200 rounded"></div>
          <div className="h-4 w-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  // Redirect if not admin
  if (!isAuthorizedAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* FastMoney brand positioned above main content */}
      <div className="w-full bg-white py-2 px-4 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <Brand />
        </div>
      </div>
      
      <div className="container mx-auto px-4 pt-2 pb-2">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-start">
            <div className="mb-4">
              <NavLinks isAuthenticated={true} />
            </div>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 pt-6 pb-12 animate-fade-in">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Usuários</h1>
            <p className="text-gray-500 mt-1">
              Gerenciamento de usuários do sistema
            </p>
          </div>
          
          <UserManagement />
        </div>
      </main>
    </div>
  );
};

export default Users;
