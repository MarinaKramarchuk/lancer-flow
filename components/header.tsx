import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { LayoutDashboard, PenBox } from "lucide-react";
import { checkUser } from "@/lib/checkUser";

const Header = async() => {
  await checkUser();
  return (
    <div className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-slate-100">
      <nav className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
          <Image 
            src="/logo.png" 
            alt="LancerFlow logo" 
            width={160} 
            height={160}
            className="h-20 w-auto object-contain"
          />
        </Link>

        <div className="flex items-center space-x-3 md:space-x-4">
          <SignedIn>
            {/* Dashboard Link */}
            <Link href="/dashboard">
              <Button variant="outline" className="hidden md:flex items-center gap-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer">
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Button>
            </Link>

            {/* Add Transaction Button */}
            <Link href="/transaction/create">
              <Button className="flex items-center gap-2 bg-[#0A192F] hover:bg-blue-900 text-white border-none px-6 shadow-sm transition-colors cursor-pointer">
                <PenBox size={18} />
                <span className="hidden md:inline font-medium">Add Transaction</span>
              </Button>
            </Link>
          </SignedIn>

        <SignedOut>
          <SignInButton forceRedirectUrl="/dashboard">
            <Button variant="outline" className="border-slate-200 text-slate-800 hover:bg-slate-50 px-6 rounded-md transition-all cursor-pointer">
              Login
            </Button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-10 h-10 border border-slate-200 shadow-sm hover:ring-2 hover:ring-slate-100 transition-all",
              }
            }}
          />
        </SignedIn>
      </div>
    </nav>
  </div>
  );
};

export default Header;