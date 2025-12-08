import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import type { Metadata } from "next";
import { ProductInfoForm } from "./_components/product-info";
import { SizeForm } from "./_components/product-stock";
import { UploadPhotoForm } from "./_components/upload-photo";

export const metadata: Metadata = {
  title: "Details Page",
};

export default function DetailsPage() {
  return (
    // <div className="mx-auto w-full max-w-[1080px]">
    //   <Breadcrumb pageName="Settings" />

    <div className="grid grid-cols-6 gap-5">
      <div className="col-span-6 xl:col-span-2">
        <ProductInfoForm />
      </div>
      <div className="col-span-6 xl:col-span-2">
        <SizeForm />
      </div>
      <div className="col-span-6 xl:col-span-2">
        <UploadPhotoForm />
      </div>
    </div>
    // </div>
  );
}
