"use client";

import { UploadIcon } from "@/assets/icons";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui-elements/button";
import { TrashIcon } from "@/assets/icons";
import { PreviewIcon } from "@/components/Tables/icons";
import { useState, useEffect } from "react";
import client from "@/api/client";
import InputGroup from "@/components/FormElements/InputGroup";
import { useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";

export function SizeForm() {
  const searchParams = useSearchParams();
  const product_id = searchParams.get("id");

  const [sizes, setSizes] = useState<any[]>([]);
  const [mode, setMode] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sizeData, setSizeData] = useState({
    id: "",
    product_id: "",
    name: "",
    qty: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSize = async () => {
    let { data: size, error } = await client
      .from("size")
      .select("*")
      .eq("product_id", product_id);
    setSizes(size || []);
  };

  const deleteSize = async (id: any) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await client
        .from("size")
        .delete()
        .eq("id", sizeData.id);

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      toast.success("Success delete data");
      setSizeData({
        id: "",
        product_id: "",
        name: "",
        qty: 0,
      });
      setIsModalOpen(false);
      setLoading(false);
    }
  };

  const handleClick = (id: any, mode: string) => {
    if (mode !== "add") {
      const size = sizes.find((size) => size.id === id);

      setSizeData({
        id: id,
        product_id: size.product_id,
        name: size.name,
        qty: size.qty,
      });
    }
    setIsModalOpen(true);
    setMode(mode);
  };

  const handleClose = () => {
    setSizeData({
      id: "",
      product_id: "",
      name: "",
      qty: 0,
    });
    setIsModalOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSizeData({
      ...sizeData,
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
        // Insert category
        const { error } = await client.from("size").insert({
          product_id: product_id,
          name: sizeData.name,
          qty: sizeData.qty,
        });

        getError = error;
      } else if (mode === "edit") {
        // Update category
        const { data, error } = await client
          .from("size")
          .update({
            name: sizeData.name,
            qty: sizeData.qty,
          })
          .eq("id", sizeData.id)
          .select();

        getError = error;
      }

      if (getError) throw getError;
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      toast.success(`Success ${mode} data`);
      setSizeData({
        id: "",
        product_id: "",
        name: "",
        qty: 0,
      });
      setLoading(false);
      setIsModalOpen(false);
    }
  };

  useEffect(() => {
    getSize();
  }, [loading]);

  return (
    <>
      <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="flex justify-between gap-3 border-b border-stroke px-4 py-4 text-dark dark:border-dark-3 dark:text-white sm:px-6 xl:px-7.5">
          <h2 className="font-medium">Size</h2>
          <button
            className="rounded-lg bg-primary px-5 py-[1px] font-medium text-gray-2 hover:bg-opacity-90"
            type="button"
            onClick={() => handleClick("", "add")}
          >
            Add
          </button>
        </div>

        <div className="!p-7 p-4 sm:p-6 xl:p-10">
          <Table>
            <TableHeader>
              <TableRow className="uppercase [&>th]:text-center">
                {/* <TableHead className="min-w-[120px] !text-left">Name</TableHead> */}
                <TableHead>Size</TableHead>
                <TableHead>Qty</TableHead>
                {/* <TableHead>Status</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Updated By</TableHead> */}
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {sizes.map((size: any) => (
                <TableRow
                  className="text-center text-base font-medium text-dark dark:text-white"
                  key={size.id}
                >
                  {/* <TableCell className="flex min-w-fit items-center gap-3"> */}
                  {/* <Image
                      src={product.image}
                      className="aspect-[6/5] w-15 rounded-[5px] object-cover"
                      width={60}
                      height={50}
                      alt={"Image for product " + product.name}
                      role="presentation"
                    /> */}
                  {/* <div className="">{product.name}</div>
                  </TableCell> */}

                  <TableCell>{size.name}</TableCell>

                  {/* <TableCell>Rp. {formatPrice(product.price)},-</TableCell> */}

                  {/* <TableCell>
                    {product.status ? "Available" : "Sold Out"}
                  </TableCell> */}

                  <TableCell>{size.qty}</TableCell>

                  <TableCell className="xl:pr-7.5">
                    <div className="flex items-center justify-center gap-x-3.5">
                      <button
                        className="hover:text-primary"
                        onClick={() => handleClick(size.id, "edit")}
                      >
                        <span className="sr-only">Edit</span>
                        <PreviewIcon />
                      </button>

                      <button
                        className="hover:text-primary"
                        onClick={() => handleClick(size.id, "delete")}
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
                ? "Add Size"
                : mode === "edit"
                  ? "Edit Size"
                  : mode === "delete"
                    ? "Delete Size"
                    : null}
            </h2>

            {mode === "delete" ? (
              <>
                You sure deleting this size {sizeData.name} ?
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
                    onClick={() => deleteSize(sizeData.id)}
                    disabled={loading}
                    className="flex-1 rounded-lg bg-dark px-4 py-2.5 font-medium text-white hover:bg-dark/90 disabled:opacity-50"
                  >
                    {loading ? "Deleting..." : "Delete Category"}
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <InputGroup
                  type="text"
                  name="name"
                  label="Name"
                  value={sizeData.name}
                  handleChange={handleChange}
                  required
                  className="mb-4 [&_input]:py-[15px]"
                  placeholder="Enter size name"
                />

                <InputGroup
                  type="number"
                  name="qty"
                  label="Qty"
                  value={sizeData.qty}
                  handleChange={handleChange}
                  required
                  className="mb-4 [&_input]:py-[15px]"
                  placeholder="Enter product qty"
                />

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
                      ? "Add Size"
                      : !loading && mode === "edit"
                        ? "Edit Size"
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
}
