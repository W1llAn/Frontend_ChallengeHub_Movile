/**
 * Countries Service
 * Servicio para obtener lista de países desde una API pública
 */
import axios from "axios";

export interface Country {
  name: string;
  code: string;
}

class CountriesService {
  private static _instance: CountriesService | null = null;
  private countries: Country[] = [];
  private loading = false;
  private error: string | null = null;

  private constructor() {}

  public static getInstance(): CountriesService {
    if (!CountriesService._instance) {
      CountriesService._instance = new CountriesService();
    }
    return CountriesService._instance;
  }

  /**
   * Obtiene la lista de países desde la API
   * Usa REST Countries API como fuente pública confiable
   */
  async getCountries(): Promise<Country[]> {
    // Si ya tenemos los países en caché, devolverlos
    if (this.countries.length > 0) {
      return this.countries;
    }

    if (this.loading) {
      // Esperar a que se complete la carga anterior
      let attempts = 0;
      while (this.loading && attempts < 50) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }
      return this.countries;
    }

    try {
      this.loading = true;
      this.error = null;

      const response = await axios.get(
        "https://restcountries.com/v3.1/all?fields=name,cca2"
      );

      // Transformar respuesta a nuestro formato y ordenar alfabéticamente
      this.countries = response.data
        .map((country: any) => ({
          name: country.name.common || country.name,
          code: country.cca2,
        }))
        .sort((a: Country, b: Country) => a.name.localeCompare(b.name));

      console.log(`Países cargados: ${this.countries.length}`);
      return this.countries;
    } catch (err) {
      this.error =
        err instanceof Error ? err.message : "Error al cargar países";
      console.error("Error cargando países:", this.error);
      // Retornar lista vacía en caso de error
      return [];
    } finally {
      this.loading = false;
    }
  }

  /**
   * Limpia el caché de países
   */
  clearCache(): void {
    this.countries = [];
    this.error = null;
  }

  /**
   * Retorna el error actual si existe
   */
  getError(): string | null {
    return this.error;
  }
}

export const countriesService = CountriesService.getInstance();
