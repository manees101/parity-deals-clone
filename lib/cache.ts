import { revalidateTag, unstable_cache } from "next/cache";
import { cache } from "react";

export const CACHE_TAGS = {
  products: "products",
  subscriptions: "subscriptions",
  countries: "countries",
  countryGroups: "countryGroups",
  productViews: "productViews",
} as const;

export type ValidTags =
  | ReturnType<typeof getGlobalTag>
  | ReturnType<typeof getUserTag>
  | ReturnType<typeof getIdTag>;

export const getGlobalTag = (tag: keyof typeof CACHE_TAGS) => {
  return `global:${CACHE_TAGS[tag]}` as const;
};

export const getUserTag = (tag: keyof typeof CACHE_TAGS, userId: string) => {
  return `user:${userId}-${CACHE_TAGS[tag]}` as const;
};

export const getIdTag = (tag: keyof typeof CACHE_TAGS, id: string) => {
  return `id:${id}-${CACHE_TAGS[tag]}` as const;
};

export const clearFullCache = () => {
  revalidateTag("*");
};

export const dbCache = <T extends (...args: any[]) => Promise<any>>(
  cb: Parameters<typeof unstable_cache<T>>[0],
  {
    tags,
  }: {
    tags: ValidTags[];
  }
) => {
  return cache(
    unstable_cache<T>(cb, undefined, {
      tags: [...tags, "*"],
    })
  );
};

export const revalidateDbCache = (
  tag: keyof typeof CACHE_TAGS,
  userId?: string,
  id?: string
) => {
  revalidateTag(getGlobalTag(tag));
  if (userId) {
    revalidateTag(getUserTag(tag, userId));
  }
  if (id) {
    revalidateTag(getIdTag(tag, id));
  }
};
