/**
 * useReports Hook
 * Custom hook para manejar la lógica de reportes
 */
import { useState } from "react";
import { createReport } from "@/services/report.service";
import { showNotifier } from "@/services/notifier";
import type {
  CreateReportDTO,
  ReportResponseDTO,
  ReportObjectType,
  ReportReason,
} from "@/types/api/report.type";

export interface UseReportsReturn {
  loading: boolean;
  error: string | null;
  submitReport: (dto: CreateReportDTO) => Promise<boolean>;
  clearError: () => void;
}

export const useReports = (): UseReportsReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitReport = async (dto: CreateReportDTO): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const result = await createReport(dto);

      if (result) {
        // No mostramos notifier aquí porque el modal de éxito es más visible
        return true;
      } else {
        setError("No se pudo enviar el reporte");
        showNotifier("Error al enviar el reporte", "error");
        return false;
      }
    } catch (err) {
      // Manejar error de reporte duplicado
      if (err instanceof Error && err.message === "DUPLICATE_REPORT") {
        const errorMsg = "Ya reportaste este elemento. El equipo de administración está revisando tu reporte anterior.";
        setError(errorMsg);
        showNotifier(errorMsg, "warn", "DUPLICATE_REPORT");
        return false;
      }
      
      // Manejar error de autenticación
      if (err instanceof Error && err.message === "AUTH_ERROR") {
        const errorMsg = "No estás autorizado. Por favor inicia sesión nuevamente.";
        setError(errorMsg);
        showNotifier(errorMsg, "error", "AUTH_ERROR");
        return false;
      }
      
      // Manejar error de objeto no encontrado
      if (err instanceof Error && err.message === "NOT_FOUND") {
        const errorMsg = "El elemento que intentas reportar no existe o fue eliminado.";
        setError(errorMsg);
        showNotifier(errorMsg, "error");
        return false;
      }
      
      // Otros errores
      console.error("Error al enviar reporte:", err);
      const errorMsg = "No se pudo enviar el reporte. Por favor intenta nuevamente.";
      setError(errorMsg);
      showNotifier(errorMsg, "error");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    loading,
    error,
    submitReport,
    clearError,
  };
};
