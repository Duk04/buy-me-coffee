import { Coffee } from "lucide-react";

export const LoginPic = () => {
  return (
    <div className="w-1/2 h-screen bg-amber-400 flex items-center justify-center ">
      <h1 className="flex absolute top-[32px] left-[80px] items-center justify-center text-[16px] gap-2 font-bold">
        <Coffee className="size-[20px]" />
        Buy Me Coffee
      </h1>
      <div className="flex flex-col justify-between items-center w-[455px] gap-[40px]">
        <img src="./illustration.svg" alt="" />
        <div className="flex flex-col gap-3">
          <p className="text-[24px] font-bold flex items-center justify-center">
            Fund your creative work
          </p>
          <p className="flex text-center text-[16px]">
            Accept support. Start a membership. Setup a shop. It’s easier than
            you think.
          </p>
        </div>
      </div>
    </div>
  );
};
