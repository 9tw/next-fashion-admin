"use client";

import {
  CallIcon,
  EmailIcon,
  PencilSquareIcon,
  UserIcon,
} from "@/assets/icons";
import InputGroup from "@/components/FormElements/InputGroup";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { useState, useEffect } from "react";
import client from "@/api/client";
import { useUser } from "@/context/UserContext";
import { useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";

export function ProductInfoForm() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const { user } = useUser();
  const [profile, setProfile] = useState();
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productData, setProductData] = useState({
    id: "",
    category_id: "",
    category: "",
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
    let { data: product, error } = await client
      .from("product")
      .select(
        `
    *,
    category (
      id, name
    )
  `,
      )
      .eq("id", id);

    setProductData({
      id: product?.[0].id,
      category_id: product?.[0].category?.id,
      category: product?.[0].category?.name,
      name: product?.[0].name,
      description: product?.[0].description,
      price: product?.[0].price,
      status: product?.[0].status,
    });
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
      // Update product
      const { data, error: updateError } = await client
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

      if (updateError) throw updateError;
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      toast.success(`Success edit data`);
      setLoading(false);
      setIsModalOpen(false);
    }
  };

  useEffect(() => {
    getProfile();
    getCategory();
    getProduct();
  }, [loading]);

  return (
    <>
      <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="flex justify-between gap-3 border-b border-stroke px-4 py-4 text-dark dark:border-dark-3 dark:text-white sm:px-6 xl:px-7.5">
          <h2 className="font-medium">Product Detail</h2>
          <button
            className="rounded-lg bg-primary px-5 py-[1px] font-medium text-gray-2 hover:bg-opacity-90"
            type="button"
            onClick={() => setIsModalOpen(true)}
          >
            Edit
          </button>
        </div>

        <div className="!p-7 p-4 sm:p-6 xl:p-10">
          <div className="relative flex-grow">
            <h3 className="font-medium text-dark dark:text-white">
              {productData?.name} ({productData?.category})
            </h3>

            <div className="flex flex-wrap items-center gap-2">
              <span className={"text-dark-4 dark:text-dark-6"}>
                {productData?.description}
              </span>
            </div>
          </div>

          <div className="relative flex-grow pt-5">
            <h3 className="font-medium text-dark dark:text-white">
              Rp. {formatPrice(productData?.price)},-
            </h3>

            {productData?.status ? (
              <h3 className="font-medium text-dark dark:text-green">
                Available
              </h3>
            ) : (
              <h3 className="font-medium text-dark dark:text-red">Sold Out</h3>
            )}
            {/* <div className="flex flex-wrap items-center gap-2">
          <span className={"text-dark-4 dark:text-dark-6"}>
            the quick brown fox jumps over the lazy dog
          </span>
        </div> */}
          </div>

          {/* <form>
        <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
          <InputGroup
            className="w-full sm:w-1/2"
            type="text"
            name="fullName"
            label="Full Name"
            placeholder="David Jhon"
            defaultValue="David Jhon"
            icon={<UserIcon />}
            iconPosition="left"
            height="sm"
          />

          <InputGroup
            className="w-full sm:w-1/2"
            type="text"
            name="phoneNumber"
            label="Phone Number"
            placeholder="+990 3343 7865"
            defaultValue={"+990 3343 7865"}
            icon={<CallIcon />}
            iconPosition="left"
            height="sm"
          />
        </div>

        <InputGroup
          className="mb-5.5"
          type="email"
          name="email"
          label="Email Address"
          placeholder="devidjond45@gmail.com"
          defaultValue="devidjond45@gmail.com"
          icon={<EmailIcon />}
          iconPosition="left"
          height="sm"
        />

        <InputGroup
          className="mb-5.5"
          type="text"
          name="username"
          label="Username"
          placeholder="devidjhon24"
          defaultValue="devidjhon24"
          icon={<UserIcon />}
          iconPosition="left"
          height="sm"
        />

        <TextAreaGroup
          className="mb-5.5"
          label="BIO"
          placeholder="Write your bio here"
          icon={<PencilSquareIcon />}
          defaultValue="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam lacinia turpis tortor, consequat efficitur mi congue a. Curabitur cursus, ipsum ut lobortis sodales, enim arcu pellentesque lectus ac suscipit diam sem a felis. Cras sapien ex, blandit eu dui et suscipit gravida nunc. Sed sed est quis dui."
        />

        <div className="flex justify-end gap-3">
          <button
            className="rounded-lg border border-stroke px-6 py-[7px] font-medium text-dark hover:shadow-1 dark:border-dark-3 dark:text-white"
            type="button"
          >
            Cancel
          </button>

          <button
            className="rounded-lg bg-primary px-6 py-[7px] font-medium text-gray-2 hover:bg-opacity-90"
            type="submit"
          >
            Save
          </button>
        </div>
      </form> */}
        </div>
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-dark">
            {/* Close button */}
            <button
              onClick={() => setIsModalOpen(false)}
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
              Edit Product
            </h2>

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
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-dark hover:bg-gray-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-lg bg-primary px-4 py-2.5 font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                >
                  {!loading ? "Edit" : "Processing..."}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
