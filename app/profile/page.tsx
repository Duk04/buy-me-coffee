"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ProfileFirstPage } from "./components/ProfileFirstPAge";
import { ProfileSecondPage } from "./components/ProfileSecondPage";
import { useUser } from "@clerk/nextjs";
const steps = [ProfileFirstPage, ProfileSecondPage];

const ProfilePage = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  console.log(user?.id, "User ID from ProfilePage");
  const [currentStep, setCurrentStep] = useState(0);
  const [formValue, setFormValue] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);

  const CurrentComponent = steps[currentStep];

  const addStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };
  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleFormChange = (newValue: object) => {
    setFormValue((prev) => ({ ...prev, ...newValue }));
  };

  const handleError = (errorMessage: string | null) => setError(errorMessage);

  const handleReset = () => {
    setCurrentStep(0);
    setFormValue({});
    setError(null);
  };

  const handleSubmit = () => {
    console.log("Final form submitted with values:", formValue);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md p-6 bg-white rounded-lg shadow-md"
        >
          <CurrentComponent
            onNext={addStep}
            onPrev={prevStep}
            onFormChange={handleFormChange}
            onError={handleError}
            onSubmited={handleSubmit}
            formValue={formValue}
            error={error}
            onReset={handleReset}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;
