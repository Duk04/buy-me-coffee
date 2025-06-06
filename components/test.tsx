"use client";

import { useRef } from "react";
import Form from "next/form";
import { useActionState } from "react";
import { createCard } from "@/app/actions/createcard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { XCircle } from "lucide-react";
import { countries, month, year } from "@/hook/allCOuntry";

const ZodErrors = ({ error }: { error?: string[] }) =>
  error?.length ? (
    <div className="text-red-500 text-xs flex items-center gap-1 mt-1">
      <XCircle className="size-4" />
      {error[0]}
    </div>
  ) : null;

type ZodErrorType = {
  country?: string[];
  firstName?: string[];
  lastName?: string[];
  cardNumber?: string[];
  cardHolderName?: string[];
  expiringMonth?: string[];
  expiringYear?: string[];
  cvv?: string[];
  [key: string]: string[] | undefined;
};

const INITIAL_STATE: {
  message: string;
  ZodError: ZodErrorType;
} = {
  message: "",
  ZodError: {},
};

export function ProfileSecondPage({ userId }: { userId: string }) {
  const [formState, formAction] = useActionState(createCard, INITIAL_STATE);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Form
      action={formAction}
      ref={formRef}
      className="flex flex-col gap-6 w-127 w-max-168"
    >
      <input type="hidden" name="userId" value={userId} />

      <div>
        <h1 className="text-xl font-semibold">
          How would you like to be paid?
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter location and payment details
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Select Country</Label>
        <Select name="country">
          <SelectTrigger>
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent className="max-h-[200px]">
            {countries.map((country) => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ZodErrors error={formState?.ZodError?.country} />
      </div>

      <div className="flex gap-3">
        <div className="w-full">
          <Label>First Name</Label>
          <Input name="firstName" placeholder="First name" />
          <ZodErrors error={formState?.ZodError?.firstName} />
        </div>
        <div className="w-full">
          <Label>Last Name</Label>
          <Input name="lastName" placeholder="Last name" />
          <ZodErrors error={formState?.ZodError?.lastName} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Card Number</Label>
        <Input
          name="cardNumber"
          maxLength={16}
          placeholder="XXXX XXXX XXXX XXXX"
        />
        <ZodErrors error={formState?.ZodError?.cardNumber} />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Card Holder Name</Label>
        <Input name="cardHolderName" placeholder="Enter card holder name" />
        <ZodErrors error={formState?.ZodError?.cardHolderName} />
      </div>

      <div className="flex gap-3">
        <div className="w-full">
          <Label>Expires (Month)</Label>
          <Select name="expiringMonth">
            <SelectTrigger>
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
          <ZodErrors error={formState?.ZodError?.expiringMonth} />
        </div>
        <div className="w-full">
          <Label>Expires (Year)</Label>
          <Select name="expiringYear">
            <SelectTrigger>
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
          <ZodErrors error={formState?.ZodError?.expiringYear} />
        </div>
        <div className="w-full">
          <Label>CVV</Label>
          <Input name="cvv" maxLength={4} placeholder="CVV" />
          <ZodErrors error={formState?.ZodError?.cvv} />
        </div>
      </div>

      <Button type="submit" className="bg-black text-white w-full">
        Continue
      </Button>
    </Form>
  );
}
