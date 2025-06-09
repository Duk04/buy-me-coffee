"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BankFormData, schemaBank } from "@/hook/profileValidation";
import { ProfilePageProps } from "@/hook/typeProfile";
import { countries, month, year } from "@/hook/allCOuntry";
import { createCard } from "@/app/actions/createcard";

export const ProfileSecondPage: React.FC<ProfilePageProps> = ({
  onPrev,
  onFormChange,
  onError,
  formValue,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<BankFormData>({
    resolver: zodResolver(schemaBank),
    defaultValues: formValue,
  });

  const cardNumber = watch("cardNumber") || "";
  const [formattedCardNumber, setFormattedCardNumber] = useState("");
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  useEffect(() => {
    const rawValue = cardNumber.replace(/\D/g, "").slice(0, 16);
    const formatted = rawValue.match(/.{1,4}/g)?.join(" ") || "";
    setFormattedCardNumber(formatted);
  }, [cardNumber]);

  useEffect(() => {
    const subscription = watch((data) => {
      onFormChange(data);
    });
    return () => subscription.unsubscribe();
  }, [watch, onFormChange]);

  const onSubmit = async (data: BankFormData) => {
    onFormChange(data);

    const formData = new FormData();
    formData.append("country", data.country || "");
    formData.append("firstName", data.firstName || "");
    formData.append("lastName", data.lastName || "");
    formData.append("cardNumber", data.cardNumber || "");
    formData.append("expiringMonth", data.expiringMonth || "");
    formData.append("expiringYear", data.expiringYear || "");
    formData.append("cvv", data.cvv || "");

    const result = await createCard({}, formData);

    if (result?.success) {
      setSubmitMessage("Card created successfully!");
      if (onError) onError("");
      window.location.reload();
    } else {
      setSubmitMessage(result?.message || "Something went wrong.");
      if (result?.ZodError) {
        Object.keys(errors).forEach((field) => {
          setError(field as keyof BankFormData, { message: "" });
        });

        Object.entries(result.ZodError).forEach(([key, messages]) => {
          if (Array.isArray(messages) && messages.length) {
            setError(key as keyof BankFormData, { message: messages[0] });
          }
        });
        if (onError) onError(result.message || "Validation error");
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6 w-full max-w-md"
      noValidate
    >
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold">
          How would you like to be paid?
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter location and payment details
        </p>
      </div>

      <div>
        <p className="text-sm font-medium mb-1">Select country</p>
        <Select
          value={watch("country") || ""}
          onValueChange={(value) =>
            setValue("country", value, { shouldValidate: true })
          }
          aria-invalid={!!errors.country}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px] overflow-y-auto">
            {countries.map((country) => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.country && (
          <span className="text-red-500 text-xs">{errors.country.message}</span>
        )}
      </div>

      <div className="flex gap-3 w-full">
        <div className="flex flex-col gap-2 w-full">
          <p>First name</p>
          <Input
            placeholder="Enter your Firstname"
            {...register("firstName")}
            aria-invalid={!!errors.firstName}
          />
          {errors.firstName && (
            <span className="text-red-500 text-xs">
              {errors.firstName.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full">
          <p>Last name</p>
          <Input
            placeholder="Enter your Lastname"
            {...register("lastName")}
            aria-invalid={!!errors.lastName}
          />
          {errors.lastName && (
            <span className="text-red-500 text-xs">
              {errors.lastName.message}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 w-full">
        <p>Card Number</p>
        <Input
          type="text"
          placeholder="XXXX XXXX XXXX XXXX"
          value={formattedCardNumber}
          onChange={(e) => {
            const rawValue = e.target.value.replace(/\D/g, "").slice(0, 16);
            setValue("cardNumber", rawValue, {
              shouldValidate: true,
              shouldDirty: true,
            });
          }}
          name="cardNumber"
          inputMode="numeric"
          aria-invalid={!!errors.cardNumber}
        />
        {errors.cardNumber && (
          <span className="text-red-500 text-sm flex items-center gap-1">
            <XCircle className="size-4" />
            {errors.cardNumber.message}
          </span>
        )}
      </div>

      <div className="flex gap-3 w-full">
        <div className="flex flex-col gap-2 w-full">
          <p>Expires</p>
          <Select
            value={watch("expiringMonth") || ""}
            onValueChange={(value) =>
              setValue("expiringMonth", value, { shouldValidate: true })
            }
            aria-invalid={!!errors.expiringMonth}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="MM" />
            </SelectTrigger>
            <SelectContent>
              {month.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.expiringMonth && (
            <span className="text-red-500 text-xs">
              {errors.expiringMonth.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full">
          <p>Year</p>
          <Select
            value={watch("expiringYear") || ""}
            onValueChange={(value) =>
              setValue("expiringYear", value, { shouldValidate: true })
            }
            aria-invalid={!!errors.expiringYear}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="YYYY" />
            </SelectTrigger>
            <SelectContent>
              {year.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.expiringYear && (
            <span className="text-red-500 text-xs">
              {errors.expiringYear.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full">
          <p>CVV</p>
          <Input
            type="text"
            placeholder="CVV"
            maxLength={4}
            autoComplete="off"
            {...register("cvv")}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 4);
              setValue("cvv", value, { shouldValidate: true });
            }}
            inputMode="numeric"
            aria-invalid={!!errors.cvv}
          />
          {errors.cvv && (
            <span className="text-red-500 text-sm flex items-center gap-1">
              <XCircle className="size-4" />
              {errors.cvv.message}
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center gap-3 w-full">
        <Button
          type="button"
          variant="outline"
          className="h-10"
          onClick={onPrev}
        >
          Back
        </Button>
        <Button type="submit" className="h-10 bg-black text-white">
          Submit
        </Button>
      </div>

      {submitMessage && (
        <div
          className={`text-center text-sm mt-2 ${
            submitMessage.includes("success")
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {submitMessage}
        </div>
      )}
    </form>
  );
};
