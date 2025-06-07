import { defaultLocale } from "@/i18n/request";
import { redirect } from "next/navigation";

// This page only renders when the user is on the root path
export default function RootPage() {
  redirect(`/${defaultLocale}`);
}
