"use client";
import { UserButton } from "@clerk/nextjs";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Logo from "@/components/logo";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between py-4 px-[1.5rem] w-full bg-background/95 shadow-md">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Link href={"/dashboard"}>
          <Logo />
        </Link>
      </div>

      <div className="hidden md:flex items-center space-x-6">
        <a
          href="/dashboard/products"
          className="text-gray-700 hover:text-black"
        >
          Products
        </a>
        <a
          href="/dashboard/analytics"
          className="text-gray-700 hover:text-black"
        >
          Analytics
        </a>
        <a
          href="/dashboard/subscription"
          className="text-gray-700 hover:text-black"
        >
          Subscription
        </a>
        <UserButton />
      </div>

      <div className="md:hidden">
        <Sheet>
          <SheetTrigger>
            <Menu className="h-6 w-6" />
          </SheetTrigger>
          <SheetContent side="left" className="p-6 w-64">
            <div className="flex flex-col space-y-4">
              <a
                href="/dashboard/products"
                className="text-gray-700 hover:text-black"
              >
                Products
              </a>
              <a
                href="/dashboard/analytics"
                className="text-gray-700 hover:text-black"
              >
                Analytics
              </a>
              <a
                href="/dashboard/subscription"
                className="text-gray-700 hover:text-black"
              >
                Subscriptions
              </a>
              <UserButton />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
