"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveGoal(formData: FormData) {
  // Desligamos a tipagem estrita aqui para evitar telas vermelhas
  const supabase = (await createClient()) as any;
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Usuário não autenticado");

  const daily_calories = Number(formData.get("daily_calories"));

  // 1. Primeiro verificamos se o usuário já tem uma meta salva
  const { data: existingGoal } = await supabase
    .from("user_goals")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (existingGoal) {
    // Se já tem, atualizamos (UPDATE)
    await supabase
      .from("user_goals")
      .update({ daily_calories })
      .eq("id", existingGoal.id);
  } else {
    // Se não tem, criamos a primeira (INSERT)
    await supabase
      .from("user_goals")
      .insert({
        user_id: user.id,
        daily_calories
      });
  }

  // Atualiza a tela instantaneamente
  revalidatePath("/dashboard");
}