"use server";

import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Livro de regras do Zod para Refeições
const mealSchema = z.object({
  description: z.string().min(2, "A descrição deve ter pelo menos 2 caracteres."),
  calories: z.coerce.number().min(1, "A refeição deve ter pelo menos 1 caloria."),
  meal_type: z.enum(["Café da Manhã", "Almoço", "Lanche", "Jantar", "Ceia"]),
});

// 1. CREATE (Adicionar)
export async function addMeal(formData: FormData) {
  const supabase = (await createClient()) as any;
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Usuário não autenticado");

  // Passamos os dados pela catraca de validação do Zod
  const validatedFields = mealSchema.safeParse({
    description: formData.get("description"),
    calories: formData.get("calories"),
    meal_type: formData.get("meal_type"),
  });

  // Se o Zod barrar, nós abortamos e mostramos o erro no console do servidor
  if (!validatedFields.success) {
    console.error("Zod barrou a entrada (CREATE):", validatedFields.error.flatten().fieldErrors);
    throw new Error("Dados inválidos. Não foi possível passar pela validação de segurança.");
  }

  const createdAtInput = formData.get("created_at") as string;
  const createdAt = createdAtInput ? new Date(createdAtInput).toISOString() : new Date().toISOString();

  const newMeal = {
    user_id: user.id,
    // Usamos os dados "limpos" e validados pelo Zod
    description: validatedFields.data.description,
    calories: validatedFields.data.calories,
    meal_type: validatedFields.data.meal_type,
    created_at: createdAt, 
  };

  const { error } = await supabase.from("meals" as any).insert(newMeal);

  if (error) throw new Error("Falha ao registrar a refeição.");
  
  const { revalidatePath } = require("next/cache");
  revalidatePath("/dashboard");
}

// 2. DELETE (Excluir)
export async function deleteMeal(mealId: string) {
  const supabase = (await createClient()) as any;
  
  const { error } = await supabase.from("meals").delete().eq("id", mealId);

  if (error) throw new Error("Falha ao deletar a refeição.");
  
  revalidatePath("/dashboard");
}

// 3. UPDATE (Atualizar)
export async function updateMeal(formData: FormData) {
  const supabase = (await createClient()) as any;
  const mealId = String(formData.get("id"));
  
  // Aplicando Zod na atualização também para ficar 100% blindado!
  const validatedFields = mealSchema.safeParse({
    description: formData.get("description"),
    calories: formData.get("calories"),
    meal_type: formData.get("meal_type"),
  });

  if (!validatedFields.success) {
    console.error("Zod barrou a entrada (UPDATE):", validatedFields.error.flatten().fieldErrors);
    throw new Error("Dados inválidos. Não foi possível atualizar a refeição.");
  }

  const updatedData = {
    description: validatedFields.data.description,
    calories: validatedFields.data.calories,
    meal_type: validatedFields.data.meal_type,
  };

  const { error } = await supabase
    .from("meals")
    .update(updatedData)
    .eq("id", mealId);

  if (error) {
    console.error("Erro ao atualizar:", error);
    throw new Error("Falha ao atualizar a refeição.");
  }
  
  revalidatePath("/dashboard");
}

// === NOVA FUNÇÃO DO JEJUM ===
export async function saveFastRecord(formData: FormData) {
  const supabase = (await createClient()) as any;
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Usuário não autenticado");

  const start_time = String(formData.get("start_time"));
  const end_time = String(formData.get("end_time"));
  const protocol = String(formData.get("protocol"));
  const duration_hours = Number(formData.get("duration_hours"));

  const { error } = await supabase.from("fasts").insert({
    user_id: user.id,
    start_time,
    end_time,
    protocol,
    duration_hours
  });

  if (error) {
    console.error("Erro ao salvar jejum:", error);
    throw new Error(`Erro do Supabase: ${error.message}`);
  }

  revalidatePath("/dashboard");
}

// === FUNÇÃO DE LOGOUT (SAIR) ===
export async function handleSignOut() {
  const supabase = (await createClient()) as any;
  
  await supabase.auth.signOut();
  
  const { redirect } = require("next/navigation");
  redirect("/login");
}