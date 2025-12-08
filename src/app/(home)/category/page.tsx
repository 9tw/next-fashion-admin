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

import client from "@/api/client";
import { useUser } from "@/context/UserContext";

// export const metadata: Metadata = {
//   title: "Tables",
// };

const CategoryPage = () => {
  const { user } = useUser();
  const [profile, setProfile] = useState();
  const [categories, setCategories] = useState<any[]>([]);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [mode, setMode] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryData, setCategoryData] = useState({
    id: "",
    name: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const deleteCategory = async (id: any) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await client.from("category").delete().eq("id", id);

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      toast.success("Success delete data");
      setCategoryData({
        id: "",
        name: "",
      });
      setPhoto(null);
      setPhotoPreview(null);
      setIsModalOpen(false);
      setLoading(false);
    }
  };

  const handleClick = (id: any, mode: string) => {
    if (mode !== "add") {
      const category = categories.find((cat) => cat.id === id);

      setCategoryData({
        id: id,
        name: category.name,
      });
      setPhotoPreview(category.photo);
    }
    setIsModalOpen(true);
    setMode(mode);
  };

  const handleClose = () => {
    setCategoryData({
      id: "",
      name: "",
    });
    setPhoto(null);
    setPhotoPreview(null);
    setIsModalOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategoryData({
      ...categoryData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let photoUrl = null;

      // Upload photo if provided
      if (photo) {
        const fileExt = photo.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `categories/${fileName}`;

        const { error: uploadError } = await client.storage
          .from("images") // Make sure this bucket exists in Supabase
          .upload(filePath, photo, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const {
          data: { publicUrl },
        } = client.storage.from("images").getPublicUrl(filePath);

        photoUrl = publicUrl;
      }

      let getError;

      if (mode === "add") {
        // Insert category
        const { error } = await client.from("category").insert({
          name: categoryData.name,
          photo: photoUrl,
          created_by: profile?.name,
        });

        getError = error;
      } else if (mode === "edit") {
        // Update category
        const { data, error } = await client
          .from("category")
          .update({
            name: categoryData.name,
            photo: photo ? photoUrl : photoPreview,
            updated_by: profile?.name,
            updated_at: new Date(),
          })
          .eq("id", categoryData.id)
          .select();

        getError = error;
      }

      if (getError) throw getError;
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      toast.success(`Success ${mode} data`);
      setCategoryData({
        id: "",
        name: "",
      });
      setPhoto(null);
      setPhotoPreview(null);
      setLoading(false);
      setIsModalOpen(false);
    }
  };

  useEffect(() => {
    getProfile();
    getCategory();
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
                <TableHead>Created By</TableHead>
                <TableHead>Updated By</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {categories.map((category: any) => (
                <TableRow
                  className="text-center text-base font-medium text-dark dark:text-white"
                  key={category.id}
                >
                  <TableCell className="flex min-w-fit items-center gap-3">
                    <Image
                      src={category.photo}
                      className="aspect-[6/5] w-15 rounded-[5px] object-cover"
                      width={60}
                      height={50}
                      alt={"Image for category " + category.name}
                      role="presentation"
                    />
                    <div className="">{category.name}</div>
                  </TableCell>

                  <TableCell>{category.created_by}</TableCell>

                  <TableCell>{category.updated_by}</TableCell>

                  <TableCell className="xl:pr-7.5">
                    <div className="flex items-center justify-center gap-x-3.5">
                      <button
                        className="hover:text-primary"
                        onClick={() => handleClick(category.id, "edit")}
                      >
                        <span className="sr-only">Edit</span>
                        <PreviewIcon />
                      </button>

                      <button
                        className="hover:text-primary"
                        onClick={() => handleClick(category.id, "delete")}
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
                ? "Add Category"
                : mode === "edit"
                  ? "Edit Category"
                  : mode === "delete"
                    ? "Delete Category"
                    : null}
            </h2>

            {mode === "delete" ? (
              <>
                You sure deleting category {categoryData.name} ?
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
                    onClick={() => deleteCategory(categoryData.id)}
                    disabled={loading}
                    className="flex-1 rounded-lg bg-dark px-4 py-2.5 font-medium text-white hover:bg-dark/90 disabled:opacity-50"
                  >
                    {loading ? "Deleting..." : "Delete Category"}
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name field */}
                <InputGroup
                  type="text"
                  name="name"
                  label="Name"
                  value={categoryData.name}
                  handleChange={handleChange}
                  required
                  className="mb-4 [&_input]:py-[15px]"
                  placeholder="Enter category name"
                />

                <InputGroup
                  type="file"
                  fileStyleVariant="style1"
                  label="Photo"
                  placeholder="Photo"
                  handleChange={handlePhotoChange}
                />

                {/* Photo field */}
                {/* <div>
                <label className="mb-2 block text-sm font-medium text-dark dark:text-white">
                  Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-dark outline-none focus:border-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div> */}

                {/* Photo preview */}
                {photoPreview && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium text-dark dark:text-white">
                      Preview
                    </p>
                    <div className="relative h-40 w-full overflow-hidden rounded-lg">
                      <Image
                        src={photoPreview}
                        alt="Photo preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}

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
                      ? "Add Category"
                      : !loading && mode === "edit"
                        ? "Edit Category"
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

export default CategoryPage;
