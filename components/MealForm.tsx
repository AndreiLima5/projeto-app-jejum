"use client";

import { useRef, useState, useEffect } from "react";
import { addMeal } from "@/app/actions/mealActions";

export default function MealForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [dateTime, setDateTime] = useState("");

  // Pega a data e hora exatas do computador do usuário ao carregar a tela
  useEffect(() => {
    const agora = new Date();
    agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset());
    setDateTime(agora.toISOString().slice(0, 16));
  }, []);

  const handleSubmit = async (formData: FormData) => {
    await addMeal(formData);
    // Limpa a descrição e calorias, mas mantém a data
    if (formRef.current) {
      formRef.current.description.value = "";
      formRef.current.calories.value = "";
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
        Registrar Refeição
      </h2>
      <form action={handleSubmit} ref={formRef} className="space-y-4">
        
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">O que você comeu?</label>
          <input type="text" name="description" required placeholder="Ex: 2 ovos mexidos e café" className="mt-1 block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm focus:ring-1 focus:ring-black dark:text-white" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Calorias (kcal)</label>
            <input type="number" name="calories" required placeholder="Ex: 350" className="mt-1 block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm focus:ring-1 focus:ring-black dark:text-white" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Tipo</label>
            <select name="meal_type" required className="mt-1 block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm focus:ring-1 focus:ring-black dark:text-white">
              <option value="Café da Manhã">Café da Manhã</option>
              <option value="Almoço">Almoço</option>
              <option value="Lanche">Lanche</option>
              <option value="Jantar">Jantar</option>
              <option value="Ceia">Ceia</option>
            </select>
          </div>
        </div>

        {/* NOVO CAMPO: Data e Hora */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Data e Hora</label>
          <input 
            type="datetime-local" 
            name="created_at" 
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            required 
            className="mt-1 block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm focus:ring-1 focus:ring-black dark:text-white" 
          />
        </div>

        <button type="submit" className="w-full bg-black text-white dark:bg-white dark:text-black py-2 rounded-md font-semibold hover:opacity-80 transition-opacity cursor-pointer">
          Salvar Registro
        </button>
      </form>
    </div>
  );
}