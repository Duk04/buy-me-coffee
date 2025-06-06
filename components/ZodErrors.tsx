import { XCircle } from "lucide-react";
// components/form/ZodErrors.tsx
export const ZodErrors = ({ error }: { error?: string[] }) => {
  if (!error || error.length === 0) return null;
  return (
    <div className="text-red-500 text-sm mt-1 flex items-center gap-1">
      <XCircle className="size-4" />
      {error[0]}
    </div>
  );
};
