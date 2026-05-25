"use client";

import { useState } from "react";
import { deleteMeal } from "@/app/actions/mealActions";

export default function MealItem({ meal }: { meal: any }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteMeal(meal.id);
  };

  // NOVO: Formata a data para o padrão Brasileiro (Ex: 24/05/2026 às 14:30)
  const dateObj = new Date(meal.created_at);
  const formattedDate = `${dateObj.toLocaleDateString("pt-BR")} às ${dateObj.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}`;

  return (
    <li className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-700 flex justify-between items-center group relative overflow-hidden">
      <div>
        <p className="text-sm font-medium text-zinc-900 dark:text-white">{meal.description}</p>
        
        {/* Aqui mostramos a data e hora cadastradas */}
        <p className="text-xs text-zinc-500 mt-1">
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">{meal.meal_type}</span> • {formattedDate}
        </p>
      </div>
      
      <div className="flex items-center gap-4">
        <span className="text-sm font-bold text-zinc-900 dark:text-white">{meal.calories} kcal</span>
        
        {/* Botão de excluir que aparece só quando passa o mouse (ou clica no mobile) */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-1/2 -translate-y-1/2 bg-zinc-100 dark:bg-zinc-700 p-1 rounded-md">
          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-xs text-red-600 font-semibold px-2 hover:text-red-800 cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? "..." : "Excluir"}
          </button>
        </div>
      </div>
    </li>
  );
}