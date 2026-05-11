import { notFound } from "next/navigation";
import { BackendAuthDevClient } from "@/components/BackendAuthDevClient";

export default function BackendAuthDevPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <BackendAuthDevClient />;
}
