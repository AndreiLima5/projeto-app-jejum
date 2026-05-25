"use client";

export default function WeeklyReport({ 
  meals, 
  fasts, 
  goal 
}: { 
  meals: any[]; 
  fasts: any[]; 
  goal: number;
}) {
  // 1. Gera os últimos 7 dias no formato YYYY-MM-DD
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  // Função para formatar a data para o eixo X (ex: "seg", "ter")
  const formatDay = (dateStr: string) => {
    const d = new Date(dateStr + "T12:00:00"); // Força meio-dia para evitar bug de fuso horário
    return d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
  };

  // 2. Processa os dados de Calorias dos últimos 7 dias
  const caloriesData = last7Days.map(date => {
    const dayMeals = meals?.filter(m => m.created_at && m.created_at.startsWith(date)) || [];
    const sum = dayMeals.reduce((acc, m) => acc + m.calories, 0);
    return { date, sum };
  });

  // 3. Processa os dados de Jejum dos últimos 7 dias
  const fastsData = last7Days.map(date => {
    const dayFasts = fasts?.filter(f => f.created_at && f.created_at.startsWith(date)) || [];
    const sum = dayFasts.reduce((acc, f) => acc + Number(f.duration_hours), 0);
    return { date, sum };
  });

  // 4. Calcula os Indicadores Agregados (KPIs)
  const totalCaloriesWeek = caloriesData.reduce((acc, curr) => acc + curr.sum, 0);
  const avgCalories = Math.round(totalCaloriesWeek / 7);

  const recentFasts = fasts?.filter(f => {
    const fDate = f.created_at?.split("T")[0];
    return last7Days.includes(fDate);
  }) || [];
  
  const totalFastsCount = recentFasts.length;
  const totalFastingHours = recentFasts.reduce((acc, f) => acc + Number(f.duration_hours), 0);
  const avgFastingTime = totalFastsCount > 0 ? (totalFastingHours / totalFastsCount).toFixed(1) : 0;

  // 5. Configurações visuais dos gráficos (alturas máximas)
  const maxCal = Math.max(...caloriesData.map(d => d.sum), goal, 1); 
  const maxFast = Math.max(...fastsData.map(d => d.sum), 16, 1); // 16h como base visual

  return (
    <div className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 mb-8">
      <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Desempenho dos Últimos 7 Dias</h2>

      {/* INDICADORES AGREGADOS (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-700">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Média Diária (Calorias)</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">{avgCalories} <span className="text-sm font-normal text-zinc-500">kcal</span></p>
        </div>
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-700">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Jejuns Concluídos</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">{totalFastsCount} <span className="text-sm font-normal text-zinc-500">nesta semana</span></p>
        </div>
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-700">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Tempo Médio de Jejum</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">{avgFastingTime} <span className="text-sm font-normal text-zinc-500">horas</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* GRÁFICO 1: CALORIAS */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">Calorias Consumidas vs Meta</h3>
          <div className="h-48 flex items-end gap-2 relative pt-4">
            {/* Linha de Referência da Meta */}
            {goal > 0 && (
              <div 
                className="absolute w-full border-t-2 border-dashed border-red-500 z-10 flex items-center"
                style={{ bottom: `${(goal / maxCal) * 100}%` }}
              >
                <span className="absolute -top-5 right-0 text-[10px] font-bold text-red-500 bg-white dark:bg-zinc-900 px-1">Meta: {goal}</span>
              </div>
            )}
            
            {/* Barras do Gráfico */}
            {caloriesData.map(d => {
              const heightPct = (d.sum / maxCal) * 100;
              const isOverGoal = goal > 0 && d.sum > goal;
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip ao passar o mouse */}
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-black text-white text-[10px] py-1 px-2 rounded transition-opacity whitespace-nowrap z-20">
                    {d.sum} kcal
                  </div>
                  {/* Barra */}
                  <div 
                    className={`w-full rounded-t-md transition-all duration-500 ${isOverGoal ? 'bg-red-400 dark:bg-red-500' : 'bg-black dark:bg-white'}`} 
                    style={{ height: `${heightPct}%`, minHeight: d.sum > 0 ? '4px' : '0' }}
                  ></div>
                  <span className="text-[10px] text-zinc-500 uppercase">{formatDay(d.date)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* GRÁFICO 2: HORAS DE JEJUM */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">Horas de Jejum por Dia</h3>
          <div className="h-48 flex items-end gap-2 relative pt-4">
            {/* Linha de Referência Visual (16h) */}
            <div 
              className="absolute w-full border-t border-dotted border-zinc-300 dark:border-zinc-700 z-10"
              style={{ bottom: `${(16 / maxFast) * 100}%` }}
            >
              <span className="absolute -top-4 right-0 text-[10px] text-zinc-400 px-1">16h</span>
            </div>

            {/* Barras do Gráfico */}
            {fastsData.map(d => {
              const heightPct = (d.sum / maxFast) * 100;
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip ao passar o mouse */}
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-blue-600 text-white text-[10px] py-1 px-2 rounded transition-opacity whitespace-nowrap z-20">
                    {d.sum.toFixed(1)}h
                  </div>
                  {/* Barra */}
                  <div 
                    className="w-full bg-blue-500 dark:bg-blue-600 rounded-t-md transition-all duration-500" 
                    style={{ height: `${heightPct}%`, minHeight: d.sum > 0 ? '4px' : '0' }}
                  ></div>
                  <span className="text-[10px] text-zinc-500 uppercase">{formatDay(d.date)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}