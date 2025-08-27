"use server";

import {
  productCountryDiscountsSchema,
  productCustomizationSchema,
  productDetailsSchema,
} from "@/schemas/products";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import {
  createProductDb,
  deleteProductDb,
  updateCountryDiscountsDb,
  updateProductDb,
  updateProductCustomization as updateProductCustomizationDb,
} from "../db/products";
import { redirect } from "next/navigation";
import { canCreateProduct, canCustomizeBanner } from "../permissions";

export const createProduct = async (
  unsafeValues: z.infer<typeof productDetailsSchema>
): Promise<{ error: boolean; message: string } | undefined> => {
  const { userId } = await auth();
  const { success, data } = productDetailsSchema.safeParse(unsafeValues);
  const hasPermissionToCreateProduct = await canCreateProduct(userId);
  if (!success || userId == null || !hasPermissionToCreateProduct) {
    return {
      error: true,
      message: "An error occured while creating your product",
    };
  }
  const { id } = await createProductDb({ ...data, clerkUserId: userId });
  redirect(`/dashboard/products/${id}/edit/?tab=details`);
};

export const deleteProduct = async ({ id }: { id: string }) => {
  const { userId } = await auth();
  if (!userId) {
    return { error: true, message: "Error deleting product" };
  }
  const isSuccess = await deleteProductDb({ id, userId });
  return {
    error: !isSuccess,
    message: isSuccess
      ? "Product deleted successfully"
      : "Error deleting product",
  };
};

export const updateProduct = async (
  id: string,
  unsafeValues: z.infer<typeof productDetailsSchema>
): Promise<{ error: boolean; message: string }> => {
  const { userId } = await auth();
  const { success, data } = productDetailsSchema.safeParse(unsafeValues);
  if (!success || userId == null) {
    return {
      error: true,
      message: "An error occured while updating your product",
    };
  }
  const isSuccess = await updateProductDb(data, { id, userId });
  return {
    error: !isSuccess,
    message: isSuccess
      ? "Product updated successfully"
      : "Error updating product",
  };
};

export const updateCountryDiscounts = async ({
  productId,
  unsafeData,
}: {
  productId: string;
  unsafeData: z.infer<typeof productCountryDiscountsSchema>;
}) => {
  const { userId } = await auth();
  const { success, data } = productCountryDiscountsSchema.safeParse(unsafeData);
  if (!success || !productId || !userId) {
    return {
      error: true,
      message: "An error occured while saving your country discounts",
    };
  }
  const insertData: {
    countryGroupId: string;
    productId: string;
    coupon: string;
    discountPercentage: number;
  }[] = [];
  const deleteIds: { countryGroupId: string }[] = [];

  data.groups.forEach((group) => {
    if (
      group.coupon != null &&
      group.coupon.length > 0 &&
      group.discountPercentage != null &&
      group.discountPercentage > 0
    ) {
      insertData.push({
        countryGroupId: group.countryGroupId,
        coupon: group.coupon,
        discountPercentage: group.discountPercentage / 100,
        productId,
      });
    } else {
      deleteIds.push({ countryGroupId: group.countryGroupId });
    }
  });
  await updateCountryDiscountsDb(deleteIds, insertData, { productId, userId });

  return { error: false, message: "Country discounts saved" };
};
export async function updateProductCustomization(
  id: string,
  unsafeData: z.infer<typeof productCustomizationSchema>
) {
  const { userId } = await auth();
  const { success, data } = productCustomizationSchema.safeParse(unsafeData);
  const canCustomize = await canCustomizeBanner(userId);

  if (!success || userId == null || !canCustomize) {
    return {
      error: true,
      message: "There was an error updating your banner",
    };
  }

  await updateProductCustomizationDb(data, { productId: id, userId });

  return { error: false, message: "Banner updated" };
}
