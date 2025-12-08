"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { InvoiceTable } from "@/components/Tables/invoice-table";
import { TopChannels } from "@/components/Tables/top-channels";
import { TopChannelsSkeleton } from "@/components/Tables/top-channels/skeleton";
import { TopProducts } from "@/components/Tables/top-products";
import { TopProductsSkeleton } from "@/components/Tables/top-products/skeleton";
import { Button } from "@/components/ui-elements/button";
import Image from "next/image";
import { TrashIcon } from "@/assets/icons";
import { DownloadIcon, PreviewIcon } from "@/components/Tables/icons";
import InputGroup from "@/components/FormElements/InputGroup";
import { toast } from "react-hot-toast";
import { Metadata } from "next";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import client from "@/api/client";
import { useUser } from "@/context/UserContext";
import { Tooltip } from "react-tooltip";

// export const metadata: Metadata = {
//   title: "Tables",
// };

const ProductPage = () => {
  const router = useRouter();
  const { user } = useUser();
  const [profile, setProfile] = useState();
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [mode, setMode] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productData, setProductData] = useState({
    id: "",
    category_id: "",
    name: "",
    description: "",
    price: 0,
    status: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const getProfile = async () => {
    let { data: profile, error } = await client
      .from("profile")
      .select("*")
      .eq("id", user?.id)
      .single();
    setProfile(profile);
  };

  const getCategory = async () => {
    let { data: category, error } = await client.from("category").select("*");
    setCategories(category || []);
  };

  const getProduct = async () => {
    let { data: product, error } = await client.from("product").select(`
    *,
    category (
      id, name
    )
  `);
    setProducts(product || []);
  };

  const deleteProduct = async (id: any) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await client.from("product").delete().eq("id", id);

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      toast.success("Success delete data");
      setProductData({
        id: "",
        category_id: "",
        name: "",
        description: "",
        price: 0,
        status: true,
      });
      setIsModalOpen(false);
      setLoading(false);
    }
  };

  const handleClick = (id: any, mode: string) => {
    if (mode !== "add") {
      const product = products.find((prod) => prod.id === id);

      setProductData({
        id: id,
        category_id: product.category_id,
        name: product.name,
        description: product.description,
        price: product.price,
        status: product.status,
      });
    }
    setIsModalOpen(true);
    setMode(mode);
  };

  const handleClose = () => {
    setProductData({
      id: "",
      category_id: "",
      name: "",
      description: "",
      price: 0,
      status: true,
    });
    setIsModalOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductData({
      ...productData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let getError;

      if (mode === "add") {
        // Insert product
        const { error } = await client.from("product").insert({
          category_id: productData.category_id,
          name: productData.name,
          description: productData.description,
          price: productData.price,
          status: true,
          created_by: profile?.name,
        });

        getError = error;
      } else if (mode === "edit") {
        // Update product
        const { data, error } = await client
          .from("product")
          .update({
            category_id: productData.category_id,
            name: productData.name,
            description: productData.description,
            price: productData.price,
            status: productData.status,
            updated_by: profile?.name,
            updated_at: new Date(),
          })
          .eq("id", productData.id)
          .select();

        getError = error;
      }

      if (getError) throw getError;
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      toast.success(`Success ${mode} data`);
      setProductData({
        id: "",
        category_id: "",
        name: "",
        description: "",
        price: 0,
        status: true,
      });
      setLoading(false);
      setIsModalOpen(false);
    }
  };

  useEffect(() => {
    getProfile();
    getCategory();
    getProduct();
  }, []);

  return (
    <>
      {/* <Breadcrumb pageName="Tables" /> */}

      <div className="space-y-10">
        <Button
          label="Add"
          variant="primary"
          shape="full"
          onClick={() => handleClick("", "add")}
        />

        <div className="grid rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
          <Table>
            <TableHeader>
              <TableRow className="uppercase [&>th]:text-center">
                <TableHead className="min-w-[120px] !text-left">Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Updated By</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {products.map((product: any) => (
                <TableRow
                  className="text-center text-base font-medium text-dark dark:text-white"
                  key={product.id}
                >
                  <TableCell
                    className="flex min-w-fit cursor-pointer items-center gap-3"
                    onClick={() =>
                      router.push(`/product/detail?id=${product.id}`)
                    }
                  >
                    {/* <Image
                      src={product.image}
                      className="aspect-[6/5] w-15 rounded-[5px] object-cover"
                      width={60}
                      height={50}
                      alt={"Image for product " + product.name}
                      role="presentation"
                    /> */}
                    <div
                      data-tooltip-id="tooltip"
                      data-tooltip-content="See details"
                    >
                      {product.name}
                    </div>
                  </TableCell>

                  <TableCell>{product.category.name}</TableCell>

                  <TableCell>Rp. {formatPrice(product.price)},-</TableCell>

                  <TableCell>
                    {product.status ? (
                      <h3 className="font-medium text-dark dark:text-green">
                        Available
                      </h3>
                    ) : (
                      <h3 className="font-medium text-dark dark:text-red">
                        Sold Out
                      </h3>
                    )}
                  </TableCell>

                  <TableCell>{product.created_by}</TableCell>

                  <TableCell>{product.updated_by}</TableCell>

                  <TableCell className="xl:pr-7.5">
                    <div className="flex items-center justify-center gap-x-3.5">
                      <button
                        className="hover:text-primary"
                        data-tooltip-id="tooltip"
                        data-tooltip-content="Edit"
                        onClick={() => handleClick(product.id, "edit")}
                      >
                        <span className="sr-only">Edit</span>
                        <PreviewIcon />
                      </button>

                      <button
                        className="hover:text-primary"
                        data-tooltip-id="tooltip"
                        data-tooltip-content="Delete"
                        onClick={() => handleClick(product.id, "delete")}
                      >
                        <span className="sr-only">Delete</span>
                        <TrashIcon />
                      </button>

                      {/* <button className="hover:text-primary">
                    <span className="sr-only">Download Invoice</span>
                    <DownloadIcon />
                  </button> */}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Tooltip
        id="tooltip"
        place="top"
        style={{ backgroundColor: "primary", borderRadius: "0.5rem" }}
      />

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-dark">
            {/* Close button */}
            <button
              onClick={() => handleClose()}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Modal content */}
            <h2 className="mb-6 text-2xl font-bold text-dark dark:text-white">
              {mode === "add"
                ? "Add Product"
                : mode === "edit"
                  ? "Edit Product"
                  : mode === "delete"
                    ? "Delete Product"
                    : null}
            </h2>

            {mode === "delete" ? (
              <>
                You sure deleting product {productData.name} ?
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => handleClose()}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-dark hover:bg-gray-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteProduct(productData.id)}
                    disabled={loading}
                    className="flex-1 rounded-lg bg-dark px-4 py-2.5 font-medium text-white hover:bg-dark/90 disabled:opacity-50"
                  >
                    {loading ? "Deleting..." : "Delete Category"}
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* <InputGroup
                type="text"
                name="category_id"
                label="Category"
                value={productData.category_id}
                handleChange={handleChange}
                required
                className="mb-4 [&_input]:py-[15px]"
                placeholder="Enter category"
              /> */}

                <div className="mb-4">
                  <label className="mb-2.5 block font-medium text-dark dark:text-white">
                    Category<span className="ml-1 select-none text-red">*</span>
                  </label>
                  <select
                    name="category_id"
                    value={productData.category_id}
                    onChange={handleChange}
                    required
                    className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <InputGroup
                  type="text"
                  name="name"
                  label="Name"
                  value={productData.name}
                  handleChange={handleChange}
                  required
                  className="mb-4 [&_input]:py-[15px]"
                  placeholder="Enter product name"
                />

                {/* <InputGroup
                type="text"
                name="description"
                label="Description"
                value={productData.description}
                handleChange={handleChange}
                required
                className="mb-4 [&_input]:py-[15px]"
                placeholder="Enter product description"
              /> */}

                <div className="mb-4">
                  <label className="mb-2.5 block font-medium text-dark dark:text-white">
                    Description
                    <span className="ml-1 select-none text-red">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={productData.description}
                    onChange={handleChange}
                    rows={5}
                    className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                    placeholder="Enter description"
                    required
                  />
                </div>

                <InputGroup
                  type="number"
                  name="price"
                  label="Price"
                  value={productData.price}
                  handleChange={handleChange}
                  required
                  className="mb-4 [&_input]:py-[15px]"
                  placeholder="Enter product price"
                />

                {mode === "edit" ? (
                  <div className="mb-4">
                    <label className="mb-2.5 block font-medium text-dark dark:text-white">
                      Status
                    </label>
                    <select
                      name="status"
                      value={productData.status ? "1" : "0"}
                      onChange={(e) => {
                        setProductData((prev) => ({
                          ...prev,
                          status: e.target.value === "1" ? true : false,
                        }));
                      }}
                      className="w-full rounded-[7px] border-[1.5px] border-stroke bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
                    >
                      <option value="">Select a status</option>
                      <option value="1">Available</option>
                      <option value="0">Sold Out</option>
                    </select>
                  </div>
                ) : null}

                {/* Error message */}
                {error && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                    {error}
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => handleClose()}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-dark hover:bg-gray-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-lg bg-primary px-4 py-2.5 font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                  >
                    {!loading && mode === "add"
                      ? "Add Product"
                      : !loading && mode === "edit"
                        ? "Edit Product"
                        : "Processing..."}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
};

export default ProductPage;
