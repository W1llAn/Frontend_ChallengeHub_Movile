/**
 * Report Service
 * Servicio para manejar operaciones relacionadas con reportes
 */
import { api } from "../api/api";
import type {
  CreateReportDTO,
  ReportResponseDTO,
} from "../types/api/report.type";

/**
 * Crea un nuevo reporte
 * POST /api/reports
 */
export const createReport = async (
  dto: CreateReportDTO
): Promise<ReportResponseDTO | null> => {
  try {
    const { data } = await api.post<ReportResponseDTO>("/reports", dto);
    console.log("Reporte creado exitosamente:", data.id);
    return data;
  } catch (error: any) {
    // Detectar error de reporte duplicado (status 400)
    // Cualquier error 400 en este endpoint significa que ya existe el reporte
    if (error.response?.status === 400) {
      console.log("Reporte duplicado detectado - Usuario ya reportó este elemento");
      throw new Error("DUPLICATE_REPORT");
    }
    
    // Detectar error de autenticación (status 401)
    if (error.response?.status === 401) {
      console.log("Error de autenticación al crear reporte");
      throw new Error("AUTH_ERROR");
    }
    
    // Detectar error de objeto no encontrado (status 404)
    if (error.response?.status === 404) {
      console.log("Objeto a reportar no encontrado");
      throw new Error("NOT_FOUND");
    }
    
    // Log otros errores y propagar
    console.error("Error creating report:", error);
    throw error;
  }
};

/**
 * Obtiene todos los reportes del usuario actual
 * GET /api/reports/my-reports
 */
export const getMyReports = async (): Promise<ReportResponseDTO[]> => {
  try {
    const { data } = await api.get<ReportResponseDTO[]>("/reports/my-reports");
    return data;
  } catch (error) {
    console.error("Error fetching my reports:", error);
    return [];
  }
};
