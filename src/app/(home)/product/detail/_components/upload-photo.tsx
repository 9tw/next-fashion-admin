"use client";

import { UploadIcon, TrashIcon } from "@/assets/icons";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import Image from "next/image";
import { Tooltip } from "react-tooltip";
import { useEffect, useState } from "react";
import client from "@/api/client";
import { useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";

export function UploadPhotoForm() {
  const searchParams = useSearchParams();
  const product_id = searchParams.get("id");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [photos, setPhotos] = useState<any[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [fileCount, setFileCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPhotos = async () => {
    let { data: photo, error } = await client
      .from("photo")
      .select("*")
      .eq("product_id", product_id);
    setPhotos(photo || []);
  };

  const deletePhoto = async (id: any) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await client.from("photo").delete().eq("id", id);

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      toast.success("Success delete photo");
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFileCount(files.length);
      setFiles(files);
    }
  };

  const handleClose = () => {
    setFiles([]);
    setFileCount(0);
    setIsModalOpen(false);

    // Reset file input
    const fileInput = document.getElementById("photos") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Insert product first

      // 2. Upload images if any
      if (files.length > 0) {
        const imageRecords = [];

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileExt = file.name.split(".").pop();
          const fileName = `${Date.now()}-${i}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `products/${fileName}`;

          // Upload to storage
          const { error: uploadError } = await client.storage
            .from("images")
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          // Get public URL
          const {
            data: { publicUrl },
          } = client.storage.from("images").getPublicUrl(filePath);

          // Prepare record for product_images table
          imageRecords.push({
            product_id: product_id,
            path: publicUrl,
          });
        }

        // 3. Insert all image records
        const { error: imagesError } = await client
          .from("photo")
          .insert(imageRecords);

        if (imagesError) throw imagesError;

        console.log("Images saved:", imageRecords);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      toast.success(`Success save all images`);

      setFiles([]);
      setFileCount(0);

      const fileInput = document.getElementById("photos") as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }

      setLoading(false);
      setIsModalOpen(false);
    }
  };

  useEffect(() => {
    getPhotos();
  }, [loading]);

  return (
    <>
      <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="flex justify-between gap-3 border-b border-stroke px-4 py-4 text-dark dark:border-dark-3 dark:text-white sm:px-6 xl:px-7.5">
          <h2 className="font-medium">Photo</h2>
          <button
            className="rounded-lg bg-primary px-5 py-[1px] font-medium text-gray-2 hover:bg-opacity-90"
            type="button"
            onClick={() => setIsModalOpen(true)}
          >
            Add
          </button>
        </div>

        <div className="!p-7 p-4 sm:p-6 xl:p-10">
          <div className="mb-4 flex items-center gap-3">
            {photos.map((photo: any, index: number) => (
              <div
                key={index}
                className="group relative inline-block cursor-pointer"
              >
                <Image
                  src={photo.path}
                  width={200}
                  height={200}
                  alt={"Img"}
                  className="cursor-pointer transition-opacity duration-300 group-hover:opacity-25"
                />

                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <TrashIcon
                    className="hover:text-red"
                    data-tooltip-id="remove-tooltip"
                    data-tooltip-content="Delete"
                    onClick={() => deletePhoto(photo.id)}
                  />
                  <Tooltip
                    id="remove-tooltip"
                    place="top"
                    style={{ backgroundColor: "red", borderRadius: "0.5rem" }}
                  />
                </div>
              </div>
            ))}
          </div>
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
              Add Photo
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative mb-5.5 block w-full rounded-xl border border-dashed border-gray-4 bg-gray-2 hover:border-primary dark:border-dark-3 dark:bg-dark-2 dark:hover:border-primary">
                <input
                  type="file"
                  name="photos"
                  id="photos"
                  accept="image/png, image/jpg, image/jpeg"
                  onChange={handleFileChange}
                  multiple
                  hidden
                />

                <label
                  htmlFor="photos"
                  className="flex cursor-pointer flex-col items-center justify-center p-4 sm:py-7.5"
                >
                  <div className="flex size-13.5 items-center justify-center rounded-full border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
                    <UploadIcon />
                  </div>

                  <p className="mt-2.5 text-body-sm font-medium">
                    <span className="text-primary">Click to upload</span> or
                    drag and drop
                  </p>

                  <p className="mt-1 text-body-xs">
                    SVG, PNG, JPG or GIF (max, 800 X 800px)
                  </p>

                  {/* File count indicator */}
                  {fileCount > 0 && (
                    <div className="mt-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                      {fileCount} file{fileCount !== 1 ? "s" : ""} selected
                    </div>
                  )}
                </label>
              </div>

              {/* Error message */}
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  className="flex justify-center rounded-lg border border-stroke px-6 py-[7px] font-medium text-dark hover:shadow-1 dark:border-dark-3 dark:text-white"
                  type="button"
                  onClick={() => handleClose()}
                >
                  Cancel
                </button>
                <button
                  className="flex items-center justify-center rounded-lg bg-primary px-6 py-[7px] font-medium text-gray-2 hover:bg-opacity-90"
                  type="submit"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
