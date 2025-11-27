/**
 * Servicio para obtener iconos de Ionicons según el nombre de la categoría
 */

type IoniconsName = string;

const categoryIconMap: Record<string, string> = {
  "robotica": "hardware-chip",
  "ciencia y tecnologia": "flask",
  "ciencia y tecnología": "flask",
  "salud y bienestar": "fitness",
  "educacion y conocimiento": "school",
  "educación y conocimiento": "school",
  "sostenibilidad": "leaf",
  "emprendimiento": "bulb",
  "habilidades sociales": "people",
  "cocina y gastronomia": "restaurant",
  "cocina y gastronomía": "restaurant",
  "viajes y cultura": "airplane",
};

export const getCategoryIcon = (categoryName: string): IoniconsName => {
  const normalizedName = categoryName.toLowerCase().trim();
  
  const icon = categoryIconMap[normalizedName];
  if (icon) {
    return icon;
  }
  
  const partialMatch = Object.keys(categoryIconMap).find(key => 
    normalizedName.includes(key) || key.includes(normalizedName)
  );
  
  if (partialMatch) {
    return categoryIconMap[partialMatch];
  }
  
  return "grid";
};
