"use client";

import { SignIn, useUser } from "@clerk/nextjs";
import { LoginPic } from "@/components/LoginPic";
import { CoffeePic } from "@/components/CoffeePic";

const SignInPage = () => {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  console.log(user?.id, "User ID from SignInPage");
  if (isSignedIn && user) {
    return (
      <div>
        <p>Welcome, {user.firstName}!</p>
        <p>User ID: {user.id}</p>
      </div>
    );
  }
  return (
    <div className="flex">
      <LoginPic />
      <CoffeePic />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <SignIn />
      </div>
    </div>
  );
};

export default SignInPage;
