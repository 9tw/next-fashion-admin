"use client";

import {
  CallIcon,
  EmailIcon,
  PencilSquareIcon,
  UserIcon,
  UploadIcon,
} from "@/assets/icons";
import Image from "next/image";
import InputGroup from "@/components/FormElements/InputGroup";
import { TextAreaGroup } from "@/components/FormElements/InputGroup/text-area";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import client from "@/api/client";
import { useUser } from "@/context/UserContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export function PersonalInfoForm() {
  const router = useRouter();

  const { user } = useUser();
  const [profile, setProfile] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");

  const getProfile = async () => {
    let { data: profile, error } = await client
      .from("profile")
      .select("*")
      .eq("id", user?.id)
      .single();
    setProfile(profile);
    setPhotoPreview(profile.photo);
    setLoading(false);
  };

  const handleClose = () => {
    setPassword("");
    setVerifyPassword("");
    setIsModalOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({
      ...profile,
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
        const filePath = `profile/${fileName}`;

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

      // Update category
      const { data, error: updateError } = await client
        .from("profile")
        .update({
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          photo: photo ? photoUrl : photoPreview,
        })
        .eq("id", profile.id)
        .select();

      if (updateError) throw updateError;
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      toast.success(`Success update data`);
      setProfile({
        id: "",
        name: "",
        email: "",
        phone: "",
      });
      setPhoto(null);
      setPhotoPreview(null);
      setLoading(false);
      router.refresh();
    }
  };

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== verifyPassword) {
      toast.error(`Password Not Same`);
      setLoading(false);
    } else {
      try {
        // const { data, error: updateError } = await client
        //   .from("profile")
        //   .update({
        //     name: profile.name,
        //     email: profile.email,
        //     phone: profile.phone,
        //     photo: photo ? photoUrl : photoPreview,
        //   })
        //   .eq("id", profile.id)
        //   .select();
        // if (updateError) throw updateError;
        await client.auth.updateUser({ password: password });
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        toast.success(`Success changed password`);
        setPassword("");
        setVerifyPassword("");
        setIsModalOpen(false);
        setLoading(false);
        router.refresh();
      }
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  return (
    <ShowcaseSection title="Update" className="!p-7">
      <form onSubmit={handleSubmit}>
        <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
          <InputGroup
            className="w-full sm:w-1/2"
            type="text"
            name="name"
            label="Name"
            // placeholder="David Jhon"
            defaultValue={profile?.name}
            handleChange={handleChange}
            icon={<UserIcon />}
            iconPosition="left"
            height="sm"
          />

          <InputGroup
            className="w-full sm:w-1/2"
            type="text"
            name="phone"
            label="Phone Number"
            // placeholder="+990 3343 7865"
            defaultValue={profile?.phone}
            handleChange={handleChange}
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
          // placeholder="devidjond45@gmail.com"
          defaultValue={profile?.email}
          handleChange={handleChange}
          icon={<EmailIcon />}
          iconPosition="left"
          height="sm"
        />

        {/* <InputGroup
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
        /> */}

        <div className="flex flex-col items-center justify-center p-4 sm:py-7.5">
          {/* <div className="mb-4 flex items-center gap-3"> */}
          <Image
            src={
              photoPreview ? photoPreview : "/images/carousel/carousel-03.jpg"
            }
            width={55}
            height={55}
            alt="User"
            className="size-14 rounded-full object-cover"
            quality={90}
          />

          <div>
            <span className="mb-1.5 font-medium text-dark dark:text-white">
              Edit your photo
            </span>
            {/* <span className="flex gap-3">
              <button type="button" className="text-body-sm hover:text-red">
                Delete
              </button>
              <button className="text-body-sm hover:text-primary">
                Update
              </button>
            </span> */}
            {/* </div> */}
          </div>
        </div>

        <div className="relative mb-5.5 block w-full rounded-xl border border-dashed border-gray-4 bg-gray-2 hover:border-primary dark:border-dark-3 dark:bg-dark-2 dark:hover:border-primary">
          <input
            type="file"
            name="photo"
            id="photo"
            accept="image/png, image/jpg, image/jpeg"
            onChange={handlePhotoChange}
            hidden
          />

          <label
            htmlFor="photo"
            className="flex cursor-pointer flex-col items-center justify-center p-4 sm:py-7.5"
          >
            <div className="flex size-13.5 items-center justify-center rounded-full border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
              <UploadIcon />
            </div>

            <p className="mt-2.5 text-body-sm font-medium">
              <span className="text-primary">Click to upload</span> or drag and
              drop
            </p>

            <p className="mt-1 text-body-xs">
              SVG, PNG, JPG or GIF (max, 800 X 800px)
            </p>
          </label>
        </div>

        {/* Error message */}
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex justify-between">
          <div>
            <button
              className="rounded-lg bg-primary px-6 py-[7px] font-medium text-gray-2 hover:bg-opacity-90"
              type="button"
              onClick={() => setIsModalOpen(true)}
            >
              Change Password
            </button>
          </div>

          <div className="flex gap-3">
            <button
              className="rounded-lg border border-stroke px-6 py-[7px] font-medium text-dark hover:shadow-1 dark:border-dark-3 dark:text-white"
              type="button"
              disabled={loading}
              onClick={() => setLoading(true)}
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
        </div>
      </form>

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
              Change Password
            </h2>

            <form onSubmit={handleSubmitPassword} className="space-y-4">
              <InputGroup
                type="text"
                name="password"
                label="Password"
                value={password}
                handleChange={(e) => setPassword(e.target.value)}
                required
                className="mb-4 [&_input]:py-[15px]"
                placeholder="Enter password"
              />

              <InputGroup
                type="text"
                name="verifyPassword"
                label="Verify Password"
                value={verifyPassword}
                handleChange={(e) => setVerifyPassword(e.target.value)}
                required
                className="mb-4 [&_input]:py-[15px]"
                placeholder="Enter again password"
              />

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
                  {!loading ? "Change" : "Processing..."}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </ShowcaseSection>
  );
}
