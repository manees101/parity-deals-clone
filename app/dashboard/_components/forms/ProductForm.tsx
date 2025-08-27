"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { productDetailsSchema } from "@/schemas/products";
import {
  createProduct,
  updateProduct,
} from "@/server/actions/products";
import { toast } from "sonner";
import Loader from "@/components/loader";

const ProductForm = ({
  product,
}: {
  product: {
    id: string;
    name: string;
    url: string;
    description: string | null;
  } | null;
}) => {
  const form = useForm<z.infer<typeof productDetailsSchema>>({
    resolver: zodResolver(productDetailsSchema),
    defaultValues: product
      ? { ...product, description: product.description || "" }
      : {
          name: "",
          url: "",
          description: "",
        },
  });
  const onSubmit = async (values: z.infer<typeof productDetailsSchema>) => {
    const action = !product
      ? createProduct
      : updateProduct.bind(null, product.id);
    const data = await action(values);
    if (data?.message) {
      data.error ? toast.error(data.message) : toast.success(data.message);
    }
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex gap-6 flex-col"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>
                  Include the protocol (http/https) and full path to the sales
                  page
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Description (optional)</FormLabel>
                <FormControl>
                  <Textarea {...field} className="min-h-20 resize-none" />
                </FormControl>
                <FormDescription>
                  An optional description to distinguish your product from
                  others.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="self-end">
          <Button disabled={form.formState.isSubmitting} type="submit">
            {form.formState.isSubmitting ? <Loader /> : "Submit"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;
