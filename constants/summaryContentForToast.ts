export default function summaryContent(key: string): string {
  const map: Record<string, string> = {
    CREATE_SUCCESS: "Creación exitosa",
    UPDATE_SUCCESS: "Actualización exitosa",
    DELETE_SUCCESS: "Eliminación completada",
    FORM_ERROR: "Error en el formulario",
    AUTH_ERROR: "Error de autenticación",
    NETWORK_ERROR: "Error de conexión",
    DUPLICATE_REPORT: "Reporte duplicado",
    REPORT_SUCCESS: "¡Reporte enviado!",
  };

  return map[key] ?? key;
}
