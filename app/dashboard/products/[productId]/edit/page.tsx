import ProductCountryDiscountsForm from "@/app/dashboard/_components/forms/ProductCountryDiscountsForm";
import { ProductCustomizationForm } from "@/app/dashboard/_components/forms/ProductCustomizationForm";
import ProductForm from "@/app/dashboard/_components/forms/ProductForm";
import PageWithBackButton from "@/app/dashboard/_components/PageWithBackButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getProduct,
  getProductCountryGroupsDb,
  getProductCustomization,
} from "@/server/db/products";
import { canCustomizeBanner, canRemoveBranding } from "@/server/permissions";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

const ProductEditPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{
    productId: string;
  }>;
  searchParams: Promise<{ tab: string | undefined }>;
}) => {
  const { productId } = await params;
  const { tab } = await searchParams;
  const { userId, redirectToSignIn } = await auth();
  if (!userId) {
    redirectToSignIn();
    return;
  }
  const product = await getProduct({
    id: productId,
    userId,
  });

  if (!product) return notFound();

  return (
    <PageWithBackButton pageTitle="Edit Product" href="/dashboard/products">
      <Tabs defaultValue={tab || "details"} className="bg-background/60">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="customization">Customization</TabsTrigger>
          <TabsTrigger value="country">country</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <ProductDetailsTab product={product} />
        </TabsContent>
        <TabsContent value="customization">
          <CustomizationsTab userId={userId} productId={productId} />
        </TabsContent>
        <TabsContent value="country">
          <CountryTab productId={productId} userId={userId} />
        </TabsContent>
      </Tabs>
    </PageWithBackButton>
  );
};

export default ProductEditPage;

function ProductDetailsTab({
  product,
}: {
  product: {
    id: string;
    name: string;
    url: string;
    description: string | null;
  };
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Product Details</CardTitle>
      </CardHeader>
      <CardContent>
        <ProductForm product={product} />
      </CardContent>
    </Card>
  );
}

async function CountryTab({
  productId,
  userId,
}: {
  productId: string;
  userId: string;
}) {
  const countryGroupData = await getProductCountryGroupsDb({
    id: productId,
    userId,
  });
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Country Discounts</CardTitle>
        <CardDescription>
          Leave the discount field blank if you do not want to display deals for
          any specific parity group
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ProductCountryDiscountsForm
          productId={productId}
          countryGroupData={countryGroupData}
        />
      </CardContent>
    </Card>
  );
}

async function CustomizationsTab({
  productId,
  userId,
}: {
  productId: string;
  userId: string;
}) {
  const customization = await getProductCustomization({ productId, userId });

  if (customization == null) return notFound();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Banner Customization</CardTitle>
      </CardHeader>
      <CardContent>
        <ProductCustomizationForm
          canRemoveBranding={await canRemoveBranding(userId)}
          canCustomizeBanner={await canCustomizeBanner(userId)}
          customization={customization}
        />
      </CardContent>
    </Card>
  );
}
