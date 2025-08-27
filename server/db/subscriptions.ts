import { subscriptionTiers } from "@/data/SubscriptionTiers";
import { db } from "@/drizzle/db";
import { UserSubscriptionTable } from "@/drizzle/schema";
import {
  CACHE_TAGS,
  dbCache,
  getUserTag,
  revalidateDbCache,
} from "@/lib/cache";
import { SQL } from "drizzle-orm";

export async function createUserSubscription(
  data: typeof UserSubscriptionTable.$inferInsert
) {
  const [newSubscription] = await db
    .insert(UserSubscriptionTable)
    .values(data)
    .onConflictDoNothing({
      target: UserSubscriptionTable.clerkUserId,
    })
    .returning({
      id: UserSubscriptionTable.id,
      userId: UserSubscriptionTable.clerkUserId,
    });

  if (newSubscription != null) {
    revalidateDbCache(
      CACHE_TAGS.subscriptions,
      newSubscription.id,
      newSubscription.userId
    );
  }

  return newSubscription;
}

export function getUserSubscription(userId: string) {
  const cacheFn = dbCache(getUserSubscriptionInternal, {
    tags: [getUserTag(CACHE_TAGS.subscriptions, userId)],
  });

  return cacheFn(userId);
}

export async function updateUserSubscription(
  where: SQL,
  data: Partial<typeof UserSubscriptionTable.$inferInsert>
) {
  const [updatedSubscription] = await db
    .update(UserSubscriptionTable)
    .set(data)
    .where(where)
    .returning({
      id: UserSubscriptionTable.id,
      userId: UserSubscriptionTable.clerkUserId,
    });

  if (updatedSubscription != null) {
    revalidateDbCache(
      CACHE_TAGS.subscriptions,
      updatedSubscription.userId,
      updatedSubscription.id
    );
  }
}

export async function getUserSubscriptionTier(userId: string) {
  const subscription = await getUserSubscription(userId);

  if (subscription == null) throw new Error("User has no subscription");

  return subscriptionTiers[subscription.tier];
}

function getUserSubscriptionInternal(userId: string) {
  return db.query.UserSubscriptionTable.findFirst({
    where: ({ clerkUserId }, { eq }) => eq(clerkUserId, userId),
  });
}
