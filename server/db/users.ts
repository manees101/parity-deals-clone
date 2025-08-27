import { db } from "@/drizzle/db";
import { ProductTable, UserSubscriptionTable } from "@/drizzle/schema";
import { CACHE_TAGS, revalidateDbCache } from "@/lib/cache";
import { eq } from "drizzle-orm";

export const deleteUser = async (userId: string) => {
  const [userSubscriptions, products] = await db.batch([
    db
      .delete(UserSubscriptionTable)
      .where(eq(UserSubscriptionTable.clerkUserId, userId))
      .returning({
        id: UserSubscriptionTable.id,
      }),
    db
      .delete(ProductTable)
      .where(eq(ProductTable.clerkUserId, userId))
      .returning({
        id: ProductTable.id,
      }),
  ]);
  userSubscriptions.forEach((subscription) => {
    revalidateDbCache(CACHE_TAGS.subscriptions, userId, subscription.id);
  });
  products.forEach((product) => {
    revalidateDbCache(CACHE_TAGS.products, userId, product.id);
  });
  return { userSubscriptions, products };
};
