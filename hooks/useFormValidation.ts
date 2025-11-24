/**
 * useFormValidation Hook
 * Hook personalizado para validar formularios
 */
import { useState } from "react";

export interface FormErrors {
  [key: string]: string;
}

interface ValidationRules {
  [key: string]: Array<(value: any) => string | null>;
}

export const useFormValidation = (initialErrors: FormErrors = {}) => {
  const [errors, setErrors] = useState<FormErrors>(initialErrors);

  /**
   * Valida un campo específico
   */
  const validateField = (
    fieldName: string,
    value: any,
    rules: Array<(value: any) => string | null>
  ): string | null => {
    for (const rule of rules) {
      const error = rule(value);
      if (error) return error;
    }
    return null;
  };

  /**
   * Valida todos los campos según las reglas proporcionadas
   */
  const validateForm = (
    data: Record<string, any>,
    rules: ValidationRules
  ): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    for (const [fieldName, fieldRules] of Object.entries(rules)) {
      const error = validateField(fieldName, data[fieldName], fieldRules);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  /**
   * Establece un error para un campo específico
   */
  const setFieldError = (fieldName: string, error: string | null) => {
    setErrors((prev) => {
      if (error) {
        return { ...prev, [fieldName]: error };
      } else {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      }
    });
  };

  /**
   * Limpia todos los errores
   */
  const clearErrors = () => {
    setErrors({});
  };

  /**
   * Retorna el error de un campo específico
   */
  const getFieldError = (fieldName: string): string | undefined => {
    return errors[fieldName];
  };

  /**
   * Verifica si hay errores
   */
  const hasErrors = (): boolean => {
    return Object.keys(errors).length > 0;
  };

  return {
    errors,
    validateField,
    validateForm,
    setFieldError,
    clearErrors,
    getFieldError,
    hasErrors,
  };
};

// Reglas de validación predefinidas
export const validationRules = {
  required: (message = "Este campo es requerido") => (value: any) => {
    if (!value || (typeof value === "string" && !value.trim())) {
      return message;
    }
    return null;
  },

  minLength: (min: number, message?: string) => (value: any) => {
    if (value && value.length < min) {
      return message || `Mínimo ${min} caracteres requeridos`;
    }
    return null;
  },

  maxLength: (max: number, message?: string) => (value: any) => {
    if (value && value.length > max) {
      return message || `Máximo ${max} caracteres permitidos`;
    }
    return null;
  },

  email: (message = "Correo electrónico inválido") => (value: any) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return message;
    }
    return null;
  },

  username: (message = "Usuario inválido") => (value: any) => {
    if (!value) return null;
    // Username: 3-20 caracteres, solo letras, números y guiones bajos
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(value)) {
      return (
        message ||
        "Usuario debe tener 3-20 caracteres (letras, números, guiones bajos)"
      );
    }
    return null;
  },

  date: (message = "Formato de fecha inválido") => (value: any) => {
    if (!value) return null;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) {
      return message;
    }
    // Validar que sea una fecha válida
    const date = new Date(value + "T00:00:00");
    if (isNaN(date.getTime())) {
      return message;
    }
    return null;
  },

  birthDate: (message = "Edad mínima: 13 años") => (value: any) => {
    if (!value) return null;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) {
      return "Formato de fecha inválido";
    }
    const birthDate = new Date(value + "T00:00:00");
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    if (age < 13 || (age === 13 && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)))) {
      return message;
    }
    return null;
  },

  notFutureDate: (message = "La fecha no puede ser en el futuro") => (
    value: any
  ) => {
    if (!value) return null;
    const date = new Date(value + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date > today) {
      return message;
    }
    return null;
  },
};
