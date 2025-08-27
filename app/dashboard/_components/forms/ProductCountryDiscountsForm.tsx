"use client";
import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { productCountryDiscountsSchema } from "@/schemas/products";
import { updateCountryDiscounts } from "@/server/actions/products";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const ProductCountryDiscountsForm = ({
  productId,
  countryGroupData,
}: {
  productId: string;
  countryGroupData: {
    id: string;
    name: string;
    recommendedDiscountPercentage: number | null;
    countries: {
      name: string;
      code: string;
    }[];
    countryGroupDiscount:
      | {
          discountPercentage: number;
          coupon: string;
        }
      | undefined;
  }[];
}) => {
  const form = useForm<z.infer<typeof productCountryDiscountsSchema>>({
    resolver: zodResolver(productCountryDiscountsSchema),
    defaultValues: {
      groups: countryGroupData.map((group) => {
        const discount =
          group.countryGroupDiscount?.discountPercentage ??
          group.recommendedDiscountPercentage;
        return {
          countryGroupId: group.id,
          discountPercentage: discount ? discount * 100 : undefined,
          coupon: group.countryGroupDiscount?.coupon ?? "",
        };
      }),
    },
  });
  const onSubmit = async (
    values: z.infer<typeof productCountryDiscountsSchema>
  ) => {
    const response = await updateCountryDiscounts({
      productId,
      unsafeData: values,
    });
    if (response?.message) {
      response.error
        ? toast.error(response.message)
        : toast.success(response.message);
    }
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex gap-6 flex-col"
      >
        {countryGroupData.map((group, index) => (
          <Card key={group.id}>
            <CardContent className="pt-6 gap-16 flex items-center">
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground mb-2">
                  {group.name}
                </h2>
                <div className="flex gap-2 flex-wrap">
                  {group.countries.map((country) => {
                    return (
                      <Image
                        key={country.code}
                        alt={country.name}
                        title={country.name}
                        width={24}
                        height={16}
                        className="border"
                        src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${country.code.toUpperCase()}.svg`}
                      />
                    );
                  })}
                </div>
              </div>
              <Input
                type="hidden"
                {...form.register(`groups.${index}.countryGroupId`)}
              />
              <div className=" ml-auto flex flex-col gap-2 w-min">
                <div className="flex flex-col md:flex-row gap-2">
                  <FormField
                    control={form.control}
                    name={`groups.${index}.discountPercentage`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount %</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Discount Percentage"
                            {...field}
                            value={field?.value ?? ""}
                            onChange={(e) =>
                              field.onChange(e.target.valueAsNumber)
                            }
                            className="w-24"
                            min={0}
                            max={100}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`groups.${index}.coupon`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Coupon</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="Coupon"
                            {...field}
                            value={field.value ?? ""}
                            className="w-24"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormMessage>
                  {form.formState.errors.groups?.[index]?.root?.message}
                </FormMessage>
              </div>
            </CardContent>
          </Card>
        ))}
        <Button className="ml-auto" type="submit">
          {form.formState.isSubmitting ? <Loader /> : "Save"}
        </Button>
      </form>
    </Form>
  );
};

export default ProductCountryDiscountsForm;
