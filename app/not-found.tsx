import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React from 'react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="text-center my-32 ">
      <h1 className="text-4xl font-bold mb-4 mt-40">404 - Page Not Found</h1>
      <p className="text-lg">Sorry, the page you are looking for does not exist.</p>
          <Link href="/">
        <Button className='cursor-pointer mt-10'>Go Home</Button>
      </Link>
    </div>

  );
};

export default NotFoundPage;