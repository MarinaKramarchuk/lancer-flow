import React from 'react';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
       <div className='container mx-auto my-32'>
        {children}
      </div>
    
  );
};

export default MainLayout;