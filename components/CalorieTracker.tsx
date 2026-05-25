"use client";

import { useState } from "react";
import { saveGoal } from "@/app/actions/goalActions";

export default function CalorieTracker({ 
  goal, 
  consumed 
}: { 
  goal: number; 
  consumed: number 
}) {
  const [isEditing, setIsEditing] = useState(false);

  const percentage = goal > 0 ? Math.min(Math.round((consumed / goal) * 100), 100) : 0;
  const remaining = goal > 0 ? Math.max(goal - consumed, 0) : 0;
  const overLimit = consumed > goal && goal > 0;

  const handleSave = async (formData: FormData) => {
    await saveGoal(formData);
    setIsEditing(false);
  };

  return (
    // Mudança 1: Ajuste de padding
    <div className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 w-full">
      <div className="flex justify-between items-start mb-4 gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-white">Resumo Diário</h2>
          <p className="text-xs sm:text-sm text-zinc-500">Acompanhe seu consumo de hoje</p>
        </div>
        
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 cursor-pointer whitespace-nowrap"
          >
            {goal > 0 ? "Alterar Meta" : "Definir Meta"}
          </button>
        )}
      </div>

      {isEditing ? (
        <form action={handleSave} className="flex flex-wrap gap-2 items-center mb-6 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-700">
          <label htmlFor="daily_calories" className="text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Sua meta (kcal):
          </label>
          <input
            type="number"
            id="daily_calories"
            name="daily_calories"
            defaultValue={goal || 2000}
            required
            min="500"
            className="w-20 sm:w-24 rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-2 py-1 text-sm focus:ring-1 focus:ring-black dark:text-white"
          />
          <button type="submit" className="text-xs bg-black text-white dark:bg-white dark:text-black px-3 py-1.5 rounded-md hover:opacity-80 font-semibold cursor-pointer">
            Salvar
          </button>
          <button type="button" onClick={() => setIsEditing(false)} className="text-xs text-zinc-500 hover:text-zinc-700 ml-1 cursor-pointer">
            Cancelar
          </button>
        </form>
      ) : (
        // Mudança 2: gap reduzido e p-2 para telas bem pequenas
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
          <div className="p-2 sm:p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg text-center flex flex-col justify-center">
            <p className="text-[10px] sm:text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Consumido</p>
            <p className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-white">{consumed}</p>
          </div>
          <div className="p-2 sm:p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg text-center border-b-2 border-black dark:border-white flex flex-col justify-center">
            <p className="text-[10px] sm:text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Meta</p>
            <p className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-white">{goal > 0 ? goal : "--"}</p>
          </div>
          <div className="p-2 sm:p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg text-center flex flex-col justify-center">
            <p className="text-[10px] sm:text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Restante</p>
            <p className={`text-lg sm:text-2xl font-bold ${overLimit ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
              {overLimit ? `+${consumed - goal}` : remaining}
            </p>
          </div>
        </div>
      )}

      {goal > 0 && (
        <div>
          <div className="flex justify-between text-xs font-medium text-zinc-500 mb-1">
            <span>0 kcal</span>
            <span>{percentage}%</span>
          </div>
          <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 sm:h-3 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${overLimit ? 'bg-red-500' : 'bg-black dark:bg-white'}`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          {overLimit && <p className="text-[10px] sm:text-xs text-red-500 mt-2 font-medium">Você ultrapassou sua meta diária!</p>}
        </div>
      )}
    </div>
  );
}