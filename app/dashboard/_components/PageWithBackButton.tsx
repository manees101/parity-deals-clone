import { Button } from "@/components/ui/button";
import Link from "next/link";
import React, { ReactNode } from "react";
import { CaretLeftIcon } from "@radix-ui/react-icons";
const PageWithBackButton = ({
  href,
  pageTitle,
  children,
}: {
  href: string;
  pageTitle: string;
  children: ReactNode;
}) => {
  return (
    <div className="grid gap-y-8 p-4">
      <div className="flex gap-4">
        <Button
          variant={"outline"}
          size={"icon"}
          className="rounded-full"
          asChild
        >
          <Link href={href}>
            <div className=" sr-only">Go Back</div>
            <CaretLeftIcon fontSize={8} />
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold self-center">{pageTitle}</h1>
      </div>
      <div>{children}</div>
    </div>
  );
};

export default PageWithBackButton;
