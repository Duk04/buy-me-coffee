"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { XCircle, Camera } from "lucide-react";
import { createProfile } from "@/app/actions/createProfile";

type ZodErrorType = {
  avatarImage?: string[];
  name?: string[];
  about?: string[];
  socialMediaURL?: string[];
};

type FormStateType = {
  data: any;
  message: string;
  ZodError: ZodErrorType;
};

type ProfileFirstPageProps = {
  onNext: () => void;
  onFormChange: (values: { [key: string]: any }) => void;
  onError: (message: string | null) => void;
  formValue: {
    name?: string;
    about?: string;
    socialMediaURL?: string;
    avatarImage?: string;
  };
};

const INITIAL_STATE: FormStateType = {
  data: null,
  message: "",
  ZodError: { avatarImage: [], name: [], about: [], socialMediaURL: [] },
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ErrorMessage: React.FC<{ message?: string }> = ({ message }) =>
  message ? (
    <span className="text-red-500 text-xs flex items-center gap-1 mt-1">
      <XCircle size={16} />
      {message === "Something went wrong"
        ? "Something went wrong. Please try again or check your input."
        : message}
    </span>
  ) : null;

export const ProfileFirstPage: React.FC<ProfileFirstPageProps> = ({
  onNext,
  onFormChange,
  onError,
  formValue,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [formState, setFormState] = useState<FormStateType>(INITIAL_STATE);
  const [previewLink, setPreviewLink] = useState<string | null>(
    formValue.avatarImage || null
  );
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [name, setName] = useState(formValue.name || "");
  const [about, setAbout] = useState(formValue.about || "");
  const [socialMediaURL, setSocialMediaURL] = useState(
    formValue.socialMediaURL || ""
  );

  useEffect(() => {
    setName(formValue.name || "");
    setAbout(formValue.about || "");
    setSocialMediaURL(formValue.socialMediaURL || "");
    setPreviewLink(formValue.avatarImage || null);
  }, [formValue]);

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setName(e.target.value);
      onFormChange({ name: e.target.value });
      setFormState((prev) => ({
        ...prev,
        ZodError: { ...prev.ZodError, name: [] },
        message: prev.message && prev.ZodError.name?.length ? prev.message : "",
      }));
    },
    [onFormChange]
  );

  const handleAboutChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setAbout(e.target.value);
      onFormChange({ about: e.target.value });
      setFormState((prev) => ({
        ...prev,
        ZodError: { ...prev.ZodError, about: [] },
        message:
          prev.message && prev.ZodError.about?.length ? prev.message : "",
      }));
    },
    [onFormChange]
  );

  const handleSocialMediaChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSocialMediaURL(e.target.value);
      onFormChange({ socialMediaURL: e.target.value });
      setFormState((prev) => ({
        ...prev,
        ZodError: { ...prev.ZodError, socialMediaURL: [] },
        message:
          prev.message && prev.ZodError.socialMediaURL?.length
            ? prev.message
            : "",
      }));
    },
    [onFormChange]
  );

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    );

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
      { method: "POST", body: formData }
    );

    if (!res.ok) {
      throw new Error("Cloudinary upload failed");
    }

    const data = await res.json();

    if (!data.secure_url) {
      throw new Error("Invalid Cloudinary response");
    }

    return data.secure_url as string;
  };

  const openBrowse = () => fileInputRef.current?.click();

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith("image/")) {
      return "Only image files are allowed.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "Image size must be less than 5MB.";
    }
    return null;
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    await handleFileSelectInternal(file);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    await handleFileSelectInternal(file);
  };

  const handleFileSelectInternal = async (file?: File) => {
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setFormState((prev) => ({
        ...prev,
        message: validationError,
      }));
      return;
    }

    setUploading(true);
    setFormState((prev) => ({
      ...prev,
      message: "",
      ZodError: { ...prev.ZodError, avatarImage: [] },
    }));

    try {
      const url = await handleUpload(file);
      setPreviewLink(url);
      onFormChange({ avatarImage: url });
    } catch {
      setFormState((prev) => ({
        ...prev,
        message: "Failed to upload image",
      }));
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = () => {
    setPreviewLink(null);
    onFormChange({ avatarImage: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState(INITIAL_STATE);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("about", about);
    formData.append("socialMediaURL", socialMediaURL);
    if (previewLink) formData.append("avatarImage", previewLink);

    const result = await createProfile(formData);

    setFormState({
      data: "data" in (result ?? {}) ? (result as any).data : null,
      message: result?.message ?? "",
      ZodError: result?.ZodError ?? INITIAL_STATE.ZodError,
    });

    if (result?.message === "Profile created successfully") {
      onNext();
    } else {
      onError(result?.message ?? "Something went wrong");
    }
    console.log(result);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
      <h1 className="text-[24px] font-semibold">Complete your profile page</h1>
      <label htmlFor="avatarImage" className="sr-only">
        Upload Avatar
      </label>
      <input
        hidden
        id="avatarImage"
        name="avatarImage"
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
      />

      <div className="flex flex-col gap-3">
        <p>Add photo</p>
        <div
          className={`rounded-full flex justify-center items-center w-40 h-40 border-2 border-dashed cursor-pointer ${
            isDragging ? "border-blue-400" : "border-gray-300"
          }`}
          onClick={openBrowse}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
        >
          {previewLink ? (
            <div className="relative w-full h-full">
              <img
                src={previewLink}
                alt="Preview"
                className="rounded-full object-cover w-40 h-40"
              />
              <Button
                type="button"
                className="absolute top-0 right-0 bg-accent text-black w-5 h-5 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteImage();
                }}
              >
                <XCircle size={12} />
              </Button>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              {uploading ? "Uploading..." : <Camera />}
            </p>
          )}
        </div>
        <ErrorMessage message={formState.ZodError.avatarImage?.[0]} />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="name">Name</label>
        <Input
          type="text"
          id="name"
          name="name"
          placeholder="Enter your name"
          value={name}
          onChange={handleNameChange}
        />
        <ErrorMessage message={formState.ZodError.name?.[0]} />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="about">About</label>
        <Input
          type="text"
          id="about"
          name="about"
          placeholder="Write about yourself"
          value={about}
          onChange={handleAboutChange}
        />
        <ErrorMessage message={formState.ZodError.about?.[0]} />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="socialMediaURL">Social Media URL</label>
        <Input
          type="text"
          id="socialMediaURL"
          name="socialMediaURL"
          placeholder="https://"
          value={socialMediaURL}
          onChange={handleSocialMediaChange}
        />
        <ErrorMessage message={formState.ZodError.socialMediaURL?.[0]} />
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          className="w-full sm:w-[246px] h-10 bg-black text-white rounded-md"
          disabled={uploading}
        >
          Continue
        </Button>
      </div>

      {formState.message && (
        <div className="text-center text-sm mt-2 text-red-600">
          {formState.message}
        </div>
      )}
    </form>
  );
};
