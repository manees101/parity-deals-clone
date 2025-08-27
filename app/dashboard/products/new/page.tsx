import React from "react";
import PageWithBackButton from "../../_components/PageWithBackButton";
import ProductForm from "../../_components/forms/ProductForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HasPermission } from "@/components/HasPermission";
import { canCreateProduct } from "@/server/permissions";

const NewProductPage = () => {
  return (
    <PageWithBackButton href="/" pageTitle="Create Product">
      <HasPermission
        hasPermissionCallback={canCreateProduct}
        renderFallback
        fallbackText="You have already created the maximum number of products. Try upgrading your account to create more."
      >
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductForm product={null} />
          </CardContent>
        </Card>
      </HasPermission>
    </PageWithBackButton>
  );
};

export default NewProductPage;
