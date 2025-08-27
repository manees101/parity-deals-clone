import { auth } from "@clerk/nextjs/server";
import React from "react";
import { getProductsDb } from "@/server/db/products";
import { NoProducts } from "./_components/NoProducts";
import Link from "next/link";
import { ArrowRight, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductsGrid from "./_components/ProductsGrid";

const DashboardPage = async () => {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) {
    redirectToSignIn();
    return;
  }
  const products = await getProductsDb(userId, { limit: 6 });
  if (!products.length) {
    return <NoProducts />;
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between font-semibold text-3xl">
        <Link
          href={"/dashboard/products"}
          className="flex gap-2 items-center hover:underline group"
        >
          Products
          <ArrowRight className="group-hover:translate-x-1 transition-transform" />
        </Link>
        <Button asChild>
          <Link href={"/dashboard/products/new"} className="flex gap-2">
            <PlusIcon size={"4"} /> Add Product
          </Link>
        </Button>
      </div>
      <ProductsGrid products={products} />
    </div>
  );
};

export default DashboardPage;
