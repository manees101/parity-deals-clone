import { removeTrailingSlash } from "@/lib/utils";
import { z } from "zod";

export const productDetailsSchema = z.object({
  name: z.string().min(5, "Name must be atleast 5 characters long"),
  url: z.string().url().min(1, "Required").transform(removeTrailingSlash),
  description: z.string().optional(),
});

export const productCountryDiscountsSchema = z.object({
  groups: z.array(
    z
      .object({
        countryGroupId: z.string().min(1, "Required"),
        discountPercentage: z
          .number()
          .min(0, "Required")
          .max(100, "Must be between 0 and 100")
          .or(z.nan())
          .transform((value) => (isNaN(value) ? undefined : value))
          .optional(),
        coupon: z.string().optional(),
      })
      .refine(
        (value) => {
          const hasCoupon = value.coupon && value.coupon.length > 0;
          const hasDiscount = value.discountPercentage != null;
          return !(hasCoupon && !hasDiscount);
        },
        {
          message: "Discount percentage is required if coupon is provided",
          path: ["root"],
        }
      )
  ),
});

export const productCustomizationSchema = z.object({
  classPrefix: z.string().optional(),
  backgroundColor: z.string().min(1, "Required"),
  textColor: z.string().min(1, "Required"),
  fontSize: z.string().min(1, "Required"),
  locationMessage: z.string().min(1, "Required"),
  bannerContainer: z.string().min(1, "Required"),
  isSticky: z.boolean(),
});
