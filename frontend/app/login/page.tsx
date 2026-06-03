import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthForm } from "@/components/AuthForm";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/");

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center dot-grid px-4 overflow-hidden">
      {/* Animated gradient mesh orbs */}
      <div
        className="pointer-events-none fixed rounded-full"
        style={{
          width: "70vw",
          height: "70vw",
          top: "-25vh",
          left: "-15vw",
          background: "radial-gradient(circle, oklch(0.62 0.22 215 / 100%), transparent 70%)",
          opacity: 0.065,
          animation: "orb-drift-1 18s ease-in-out infinite",
          zIndex: 0,
        }}
      />
      <div
        className="pointer-events-none fixed rounded-full"
        style={{
          width: "55vw",
          height: "55vw",
          bottom: "-20vh",
          right: "-12vw",
          background: "radial-gradient(circle, oklch(0.72 0.20 190 / 100%), transparent 70%)",
          opacity: 0.05,
          animation: "orb-drift-2 22s ease-in-out infinite",
          zIndex: 0,
        }}
      />
      <div
        className="pointer-events-none fixed rounded-full"
        style={{
          width: "40vw",
          height: "40vw",
          top: "40vh",
          left: "35vw",
          background: "radial-gradient(circle, oklch(0.65 0.18 230 / 100%), transparent 70%)",
          opacity: 0.035,
          animation: "orb-drift-3 30s ease-in-out infinite",
          zIndex: 0,
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, oklch(0.55 0.22 225), oklch(0.72 0.20 190))",
              boxShadow: "0 0 18px oklch(0.62 0.22 215 / 45%)",
            }}
          >
            <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight font-heading gradient-text">
            LeadQualifier
          </span>
        </div>

        <AuthForm />
      </div>
    </div>
  );
}
