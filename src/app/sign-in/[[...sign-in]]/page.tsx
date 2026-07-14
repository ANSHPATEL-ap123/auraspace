import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#020202]">
      <SignIn />
    </div>
  );
}