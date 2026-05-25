"use client";

import { useState, useEffect } from "react";
import { saveFastRecord } from "@/app/actions/mealActions";

export default function FastingTimer() {
  const [isFasting, setIsFasting] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [protocol, setProtocol] = useState("16:8");
  const [isSaving, setIsSaving] = useState(false);
  
  // NOVO: Estado para controlar o Toast
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isFasting && startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setElapsedTime(diffInSeconds);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isFasting, startTime]);

  const handleStart = () => {
    setStartTime(new Date());
    setIsFasting(true);
    setElapsedTime(0);
  };

  const handleStop = async () => {
    if (!startTime) return;
    setIsSaving(true);
    
    const endTime = new Date();
    const durationHours = elapsedTime / 3600;

    const formData = new FormData();
    formData.append("start_time", startTime.toISOString());
    formData.append("end_time", endTime.toISOString());
    formData.append("protocol", protocol);
    formData.append("duration_hours", durationHours.toFixed(2));

    await saveFastRecord(formData);
    
    setIsFasting(false);
    setStartTime(null);
    setElapsedTime(0);
    setIsSaving(false);
    
    // NOVO: Dispara o Toast e esconde depois de 3 segundos
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col items-center text-center relative">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">Cronômetro de Jejum</h2>
      
      {!isFasting ? (
        <div className="w-full space-y-4 mt-2">
          <div>
            <label className="block text-sm text-zinc-500 mb-1">Escolha o Protocolo:</label>
            <select 
              value={protocol} 
              onChange={(e) => setProtocol(e.target.value)}
              className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm dark:text-white focus:ring-1 focus:ring-black"
            >
              <option value="12:12">12 horas (Iniciante)</option>
              <option value="14:10">14 horas (Intermediário)</option>
              <option value="16:8">16 horas (Clássico)</option>
              <option value="18:6">18 horas (Avançado)</option>
              <option value="24:0">24 horas (OMAD)</option>
            </select>
          </div>
          <button 
            onClick={handleStart}
            className="w-full bg-black text-white dark:bg-white dark:text-black py-2.5 rounded-md font-semibold hover:opacity-80 transition-opacity cursor-pointer"
          >
            Iniciar Jejum
          </button>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center mt-4">
          <p className="text-sm text-zinc-500 mb-2">Protocolo Atual: <strong>{protocol}</strong></p>
          <div className="text-4xl sm:text-5xl font-bold font-mono text-zinc-900 dark:text-white tracking-wider mb-6">
            {formatTime(elapsedTime)}
          </div>
          <button 
            onClick={handleStop}
            disabled={isSaving}
            className="w-full bg-red-600 text-white py-2.5 rounded-md font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {isSaving ? "Salvando..." : "Encerrar Jejum"}
          </button>
        </div>
      )}

      {/* NOVO: Componente do Toast Flutuante */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-fade-in-up z-50">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span className="text-sm font-medium">Jejum registrado com sucesso!</span>
        </div>
      )}
    </div>
  );
}