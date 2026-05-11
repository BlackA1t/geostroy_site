import type { Metadata } from "next";
import { FaqSection } from "@/components/FaqSection";

export const metadata: Metadata = {
  title: "Вопросы и ответы | ООО «Геострой»",
  description: "Ответы на частые вопросы о заявках, файлах, регистрации и отслеживании статуса."
};

export default function FaqPage() {
  return (
    <main>
      <FaqSection />
    </main>
  );
}
