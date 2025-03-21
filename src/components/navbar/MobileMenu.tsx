
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import NavLinks from './NavLinks';
import UserMenu from './UserMenu';
import ChangePassword from '@/components/ChangePassword';

type MobileMenuProps = {
  isOpen: boolean;
  closeMenu: () => void;
  isAuthenticated: boolean;
  user: any | null;
  logout: () => Promise<void>;
  onOpenPasswordDialog?: () => void;
};

const MobileMenu: React.FC<MobileMenuProps> = ({ 
  isOpen, 
  closeMenu, 
  isAuthenticated,
  user,
  logout,
  onOpenPasswordDialog
}) => {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  
  const handleOpenPasswordDialog = () => {
    if (onOpenPasswordDialog) {
      onOpenPasswordDialog();
    } else {
      setIsPasswordDialogOpen(true);
    }
  };

  const handleClosePasswordDialog = () => {
    setIsPasswordDialogOpen(false);
  };

  if (!isOpen) return null;
  
  return (
    <div className="sm:hidden">
      <div className="pt-2 pb-3 space-y-1 bg-white/90 backdrop-blur-sm shadow-lg">
        <NavLinks 
          mobile={true} 
          closeMenu={closeMenu} 
          isAuthenticated={isAuthenticated} 
        />
        
        {isAuthenticated && (
          <Link
            to="/bills/new"
            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 text-base font-medium"
            onClick={closeMenu}
          >
            <div className="flex items-center">
              <PlusCircle className="h-5 w-5" />
              <span className="ml-2">Nova Conta</span>
            </div>
          </Link>
        )}
        
        <UserMenu 
          user={user} 
          logout={logout} 
          isAuthenticated={isAuthenticated} 
          mobile={true} 
          closeMenu={closeMenu}
          onOpenPasswordDialog={handleOpenPasswordDialog}
        />
      </div>
      
      {!onOpenPasswordDialog && (
        <ChangePassword 
          isOpen={isPasswordDialogOpen} 
          onClose={handleClosePasswordDialog} 
        />
      )}
    </div>
  );
};

export default MobileMenu;
