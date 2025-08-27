import { db } from "@/drizzle/db";
import {
  CountryGroupDiscountTable,
  ProductCustomizationTable,
  ProductTable,
} from "@/drizzle/schema";
import {
  CACHE_TAGS,
  dbCache,
  getGlobalTag,
  getIdTag,
  getUserTag,
  revalidateDbCache,
} from "@/lib/cache";
import { removeTrailingSlash } from "@/lib/utils";
import { and, eq, inArray, sql, count } from "drizzle-orm";
import { BatchItem } from "drizzle-orm/batch";

export const getProductsDb = async (
  userId: string,
  { limit }: { limit?: number }
) => {
  const cacheFn = dbCache(getProductsDbInternal, {
    tags: [getUserTag(CACHE_TAGS.products, userId)],
  });
  return cacheFn(userId, { limit });
};

export const getProduct = async ({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) => {
  const cacheFn = dbCache(getProductInternal, {
    tags: [
      getIdTag(CACHE_TAGS.products, id),
      getGlobalTag(CACHE_TAGS.countries),
      getGlobalTag(CACHE_TAGS.countryGroups),
    ],
  });
  return cacheFn({ id, userId });
};

export const getProductCountryGroupsDb = async ({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) => {
  const cacheFn = dbCache(getProductCountryGroupInternal, {
    tags: [getIdTag(CACHE_TAGS.products, id)],
  });
  return cacheFn({ id, userId });
};

export function getProductForBanner({
  id,
  countryCode,
  url,
}: {
  id: string;
  countryCode: string;
  url: string;
}) {
  const cacheFn = dbCache(getProductForBannerInternal, {
    tags: [
      getIdTag(CACHE_TAGS.products, id),
      getGlobalTag(CACHE_TAGS.countries),
      getGlobalTag(CACHE_TAGS.countryGroups),
    ],
  });

  return cacheFn({
    id,
    countryCode,
    url,
  });
}

export const createProductDb = async (
  data: typeof ProductTable.$inferInsert
) => {
  const [newProduct] = await db
    .insert(ProductTable)
    .values(data)
    .returning({ id: ProductTable.id, userId: ProductTable.clerkUserId });
  try {
    await db
      .insert(ProductCustomizationTable)
      .values({
        productId: newProduct.id,
      })
      .onConflictDoNothing({
        target: ProductCustomizationTable.productId,
      });
  } catch (error) {
    console.error(
      `createProductDb()=> Error occured while creating Product customization ${error}`
    );
    await db.delete(ProductTable).where(eq(ProductTable.id, newProduct.id));
  }
  revalidateDbCache(CACHE_TAGS.products, newProduct.userId, newProduct.id);
  return newProduct;
};

export const updateProductDb = async (
  data: Partial<typeof ProductTable.$inferInsert>,
  {
    id,
    userId,
  }: {
    id: string;
    userId: string;
  }
) => {
  const { rowCount } = await db
    .update(ProductTable)
    .set(data)
    .where(and(eq(ProductTable.id, id), eq(ProductTable.clerkUserId, userId)));
  if (rowCount > 0) {
    revalidateDbCache(CACHE_TAGS.products, userId, id);
  }
  return rowCount > 0;
};

export const deleteProductDb = async ({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) => {
  const { rowCount } = await db
    .delete(ProductTable)
    .where(and(eq(ProductTable.id, id), eq(ProductTable.clerkUserId, userId)));
  if (rowCount > 0) {
    revalidateDbCache(CACHE_TAGS.products, userId, id);
  }
  return rowCount > 0;
};

export const getProductsDbInternal = (
  userId: string,
  { limit }: { limit?: number }
) => {
  return db.query.ProductTable.findMany({
    where: ({ clerkUserId }, { eq }) => eq(clerkUserId, userId),
    orderBy: ({ createdAt }, { desc }) => desc(createdAt),
    limit,
  });
};

export const getProductInternal = ({
  userId,
  id,
}: {
  userId: string;
  id: string;
}) => {
  return db.query.ProductTable.findFirst({
    where: ({ clerkUserId, id: productId }, { eq, and }) =>
      and(eq(clerkUserId, userId), eq(productId, id)),
  });
};

export const getProductCustomizationInternal = async ({
  userId,
  productId,
}: {
  userId: string;
  productId: string;
}) => {
  const product = await getProduct({ userId, id: productId });
  if (!product) {
    return null;
  }
  const productDetails = await db.query.ProductTable.findFirst({
    where: ({ id, clerkUserId }, { eq, and }) =>
      and(eq(id, productId), eq(clerkUserId, userId)),
    with: {
      productCustomization: true,
    },
  });
  return productDetails?.productCustomization;
};

export const getProductCountryGroupInternal = async ({
  userId,
  id,
}: {
  userId: string;
  id: string;
}) => {
  const product = await getProduct({ userId, id });
  if (!product) {
    return [];
  }
  const countryGroupsData = await db.query.CountryGroupTable.findMany({
    with: {
      countries: {
        columns: {
          name: true,
          code: true,
        },
      },
      countryGroupDiscounts: {
        columns: {
          discountPercentage: true,
          coupon: true,
        },
        where: ({ productId }, { eq }) => eq(productId, id),
        limit: 1,
      },
    },
  });
  return countryGroupsData.map(
    ({
      name,
      id,
      recommendedDiscountPercentage,
      countries,
      countryGroupDiscounts,
    }) => ({
      id,
      name,
      recommendedDiscountPercentage,
      countries,
      countryGroupDiscount: countryGroupDiscounts.at(0),
    })
  );
};

export async function updateCountryDiscountsDb(
  deleteGroup: { countryGroupId: string }[],
  insertGroup: (typeof CountryGroupDiscountTable.$inferInsert)[],
  { productId, userId }: { productId: string; userId: string }
) {
  const product = await getProduct({ id: productId, userId });
  if (product == null) return false;

  const statements: BatchItem<"pg">[] = [];
  if (deleteGroup.length > 0) {
    statements.push(
      db.delete(CountryGroupDiscountTable).where(
        and(
          eq(CountryGroupDiscountTable.productId, productId),
          inArray(
            CountryGroupDiscountTable.countryGroupId,
            deleteGroup.map((group) => group.countryGroupId)
          )
        )
      )
    );
  }

  if (insertGroup.length > 0) {
    statements.push(
      db
        .insert(CountryGroupDiscountTable)
        .values(insertGroup)
        .onConflictDoUpdate({
          target: [
            CountryGroupDiscountTable.productId,
            CountryGroupDiscountTable.countryGroupId,
          ],
          set: {
            coupon: sql.raw(
              `excluded.${CountryGroupDiscountTable.coupon.name}`
            ),
            discountPercentage: sql.raw(
              `excluded.${CountryGroupDiscountTable.discountPercentage.name}`
            ),
          },
        })
    );
  }

  if (statements.length > 0) {
    await db.batch(statements as [BatchItem<"pg">]);
  }

  revalidateDbCache(CACHE_TAGS.products, userId, productId);
}

export const getProductCustomization = async ({
  userId,
  productId,
}: {
  userId: string;
  productId: string;
}) => {
  const cacheFn = dbCache(getProductCustomizationInternal, {
    tags: [getIdTag(CACHE_TAGS.products, productId)],
  });
  return cacheFn({ userId, productId });
};

async function getProductCountInternal(userId: string) {
  const counts = await db
    .select({ productCount: count() })
    .from(ProductTable)
    .where(eq(ProductTable.clerkUserId, userId));

  return counts[0]?.productCount ?? 0;
}
export function getProductCount(userId: string) {
  const cacheFn = dbCache(getProductCountInternal, {
    tags: [getUserTag(CACHE_TAGS.products, userId)],
  });

  return cacheFn(userId);
}
export async function updateProductCustomization(
  data: Partial<typeof ProductCustomizationTable.$inferInsert>,
  { productId, userId }: { productId: string; userId: string }
) {
  const product = await getProduct({ id: productId, userId });
  if (product == null) return;

  await db
    .update(ProductCustomizationTable)
    .set(data)
    .where(eq(ProductCustomizationTable.productId, productId));

  revalidateDbCache(CACHE_TAGS.products, userId, productId);
}

async function getProductForBannerInternal({
  id,
  countryCode,
  url,
}: {
  id: string;
  countryCode: string;
  url: string;
}) {
  const data = await db.query.ProductTable.findFirst({
    where: ({ id: idCol, url: urlCol }, { eq, and }) =>
      and(eq(idCol, id), eq(urlCol, removeTrailingSlash(url))),
    columns: {
      id: true,
      clerkUserId: true,
    },
    with: {
      productCustomization: true,
      countryGroupDiscounts: {
        columns: {
          coupon: true,
          discountPercentage: true,
        },
        with: {
          countryGroup: {
            columns: {},
            with: {
              countries: {
                columns: {
                  id: true,
                  name: true,
                },
                limit: 1,
                where: ({ code }, { eq }) => eq(code, countryCode),
              },
            },
          },
        },
      },
    },
  });

  const discount = data?.countryGroupDiscounts.find(
    (discount) => discount.countryGroup.countries.length > 0
  );
  const country = discount?.countryGroup.countries[0];
  const product =
    data == null || data.productCustomization == null
      ? undefined
      : {
          id: data.id,
          clerkUserId: data.clerkUserId,
          customization: data.productCustomization,
        };

  return {
    product,
    country,
    discount:
      discount == null
        ? undefined
        : {
            coupon: discount.coupon,
            percentage: discount.discountPercentage,
          },
  };
}
