import Link from "next/link";

export function Logo({ size = "default" }: { size?: "default" | "large" }) {
  return (
    <Link
      href="/"
      className={`font-bold tracking-tight ${
        size === "large" ? "text-3xl" : "text-xl"
      }`}
    >
      Winable
    </Link>
  );
}
