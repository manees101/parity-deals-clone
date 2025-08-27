"use client";
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { env } from "@/data/env/client";
import { CopyCheckIcon, CopyIcon, CopyXIcon } from "lucide-react";
import React, { useState } from "react";

type CopyState = "copied" | "idle" | "error";

const AddToSiteProductModalContent = ({ id }: { id: string }) => {
  const code = `<script src="${env.NEXT_PUBLIC_SERVER_URL}/products/${id}/banner"></script>`;
  const [copyState, setCopyState] = useState<CopyState>("idle");
  return (
    <DialogContent className="max-w-max">
      <DialogTitle className="text-2xl">Start Earning PPP Sales!</DialogTitle>
      <DialogDescription>
        All you need to do is to copy this script into your website and your
        cusomers will start seing PPP discounts!
      </DialogDescription>
      <pre className="mb-4 bg-secondary text-secondary-foreground overflow-x-auto p-4 rounded max-w-screen-xl">
        <code>{code}</code>
      </pre>
      <div className="flex gap-2">
        <Button
          className="btn btn-primary"
          onClick={() => {
            navigator.clipboard
              .writeText(code)
              .then(() => {
                setCopyState("copied");
                setTimeout(() => {
                  setCopyState("idle");
                }, 2000);
              })
              .catch(() => {
                setCopyState("error");
                setTimeout(() => {
                  setCopyState("idle");
                }, 2000);
              });
          }}
        >
          {getCopyStateIcon(copyState)}
          {getCopyState(copyState)}
        </Button>
        <DialogClose asChild>
          <Button
            className="btn btn-secondary"
            onClick={() => {
              setCopyState("idle");
            }}
          >
            Close
          </Button>
        </DialogClose>
      </div>
    </DialogContent>
  );
};

export default AddToSiteProductModalContent;

const getCopyState = (copyState: CopyState) => {
  switch (copyState) {
    case "copied":
      return "Copied!";
    case "idle":
      return "Copy";
    case "error":
      return "Error!";
  }
};

const getCopyStateIcon = (copyState: CopyState) => {
  switch (copyState) {
    case "copied":
      return <CopyCheckIcon />;
    case "idle":
      return <CopyIcon />;
    case "error":
      return <CopyXIcon />;
  }
};
