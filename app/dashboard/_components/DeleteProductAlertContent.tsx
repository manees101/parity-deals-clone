"use client";
import Loader from "@/components/loader";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteProduct } from "@/server/actions/products";
import React, { useTransition } from "react";
import { toast } from "sonner";

const DeleteProductAlertContent = ({ id }: { id: string }) => {
  const [isDeletePending, startDeleteProductTransition] = useTransition();
  const handleDeleteProduct = async () => {
    const { error, message } = await deleteProduct({ id });
    error ? toast.error(message) : toast.success(message);
  };
  return (
    <AlertDialogContent>
      <AlertDialogTitle>
        Are you sure you want to delete this product?
      </AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. This will permanently delete the product
        and all its data.
      </AlertDialogDescription>
      <AlertDialogAction
        onClick={() => startDeleteProductTransition(handleDeleteProduct)}
        disabled={isDeletePending}
      >
        {isDeletePending ? <Loader /> : "Delete"}
      </AlertDialogAction>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
    </AlertDialogContent>
  );
};

export default DeleteProductAlertContent;
