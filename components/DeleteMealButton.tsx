"use client";

import { deleteMeal } from "@/app/actions/mealActions";
import { useTransition } from "react";

export default function DeleteMealButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    // Requisito: Excluir registro com confirmação
    if (window.confirm("Tem certeza que deseja excluir esta refeição?")) {
      startTransition(() => {
        deleteMeal(id);
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-500 hover:text-red-700 disabled:opacity-50 text-sm font-medium transition-colors cursor-pointer"
      title="Excluir"
    >
      {isPending ? "Excluindo..." : "Excluir"}
    </button>
  );
}