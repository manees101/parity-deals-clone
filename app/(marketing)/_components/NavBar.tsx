"use client";
import { useUser, SignInButton, SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Logo from "@/components/logo";
import Link from "next/link";

export default function Navbar() {
  const { user } = useUser();

  return (
    <nav className="flex items-center fixed top-0 justify-between py-4 px-[1.5rem] w-full z-10 bg-background/95 shadow-md">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Link href={user ? "/dashboard" : "/"}>
          <Logo />
        </Link>
      </div>

      <div className="hidden md:flex items-center space-x-6">
        <a href="#pricing" className="text-gray-700 hover:text-black">
          Pricing
        </a>
        {user ? (
          <div className="flex gap-4 justify-end items-center">
            <Button asChild variant="default">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
            <SignOutButton>
              <Button variant="outline">Logout</Button>
            </SignOutButton>
          </div>
        ) : (
          <SignInButton>
            <Button variant="default">Login</Button>
          </SignInButton>
        )}
      </div>

      <div className="md:hidden">
        <Sheet>
          <SheetTrigger>
            <Menu className="h-6 w-6" />
          </SheetTrigger>
          <SheetContent side="left" className="p-6 w-64">
            <div className="flex flex-col space-y-4">
              <a href="#pricing" className="text-gray-700 hover:text-black">
                Pricing
              </a>
              {user ? (
                <div className="flex gap-4 justify-end items-center">
                  <Button asChild variant="default">
                    <Link href="/dashboard">Go to Dashboard</Link>
                  </Button>
                  <SignOutButton>
                    <Button variant="outline">Logout</Button>
                  </SignOutButton>
                </div>
              ) : (
                <SignInButton>
                  <Button variant="default">Login</Button>
                </SignInButton>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
