
import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import AuthForm from '@/components/AuthForm';
import ThemeToggle from '@/components/ThemeToggle';

const SignUp = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <div className="animate-pulse space-y-2 flex flex-col items-center">
          <div className="h-10 w-36 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-900 dark:to-indigo-950 p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="max-w-md w-full space-y-8 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">FastMoney</h1>
          <p className="mt-2 text-white/80">
            Crie sua conta para gerenciar suas contas a pagar
          </p>
        </div>
        
        <div className="mt-8">
          <AuthForm type="signup" />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-blue-100">
              Já tem uma conta?{' '}
              <Link to="/login" className="font-medium text-white hover:underline">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      <footer className="absolute bottom-4 text-center text-white/60 text-xs w-full px-4">
        &copy; {new Date().getFullYear()} FastMoney - Todos os direitos reservados
      </footer>
    </div>
  );
};

export default SignUp;
