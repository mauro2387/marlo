// Validadores de formularios reutilizables
import { VALIDATION_RULES } from '@/config/constants';

// Tipos de errores de validación
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// ==================== UTILIDADES DE PEDIDOS ====================

/**
 * Genera un código de pedido único y consistente
 * Formato: MLO-XXXXXXXX (donde X son los últimos 8 caracteres del ID en mayúsculas)
 */
export const generateOrderCode = (orderId: string): string => {
  if (!orderId) return 'MLO-NUEVO';
  return `MLO-${orderId.slice(-8).toUpperCase()}`;
};

/**
 * Extrae solo el código sin el prefijo MLO
 */
export const getOrderCodeShort = (orderId: string): string => {
  if (!orderId) return 'NUEVO';
  return orderId.slice(-8).toUpperCase();
};

// ==================== VALIDADORES INDIVIDUALES ====================

// Email
export const validateEmail = (email: string): string | null => {
  if (!email || email.trim() === '') {
    return 'El email es requerido';
  }

  if (!VALIDATION_RULES.email.pattern.test(email)) {
    return 'El email no es válido';
  }

  return null;
};

// Teléfono uruguayo
export const validatePhone = (phone: string): string | null => {
  if (!phone || phone.trim() === '') {
    return 'El teléfono es requerido';
  }

  // Limpiar el teléfono de espacios y caracteres especiales
  const cleanPhone = phone.replace(/[\s-()]/g, '');

  if (!VALIDATION_RULES.phone.pattern.test(cleanPhone)) {
    return 'El teléfono debe ser un número uruguayo válido (ej: 099123456)';
  }

  return null;
};

// Contraseña
export const validatePassword = (password: string): string | null => {
  if (!password || password.trim() === '') {
    return 'La contraseña es requerida';
  }

  if (password.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres';
  }

  // Validar que tenga al menos una mayúscula, minúscula y número
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    return 'La contraseña debe incluir al menos una mayúscula, una minúscula y un número';
  }

  return null;
};

// Confirmar contraseña
export const validatePasswordConfirm = (password: string, confirm: string): string | null => {
  if (!confirm || confirm.trim() === '') {
    return 'Debes confirmar la contraseña';
  }

  if (password !== confirm) {
    return 'Las contraseñas no coinciden';
  }

  return null;
};

// Nombre
export const validateName = (name: string, fieldName = 'nombre'): string | null => {
  if (!name || name.trim() === '') {
    return `El ${fieldName} es requerido`;
  }

  if (name.trim().length < 2) {
    return `El ${fieldName} debe tener al menos 2 caracteres`;
  }

  if (name.trim().length > 50) {
    return `El ${fieldName} no puede exceder 50 caracteres`;
  }

  return null;
};

// Cédula uruguaya
export const validateCI = (ci: string): string | null => {
  if (!ci || ci.trim() === '') {
    return 'La cédula es requerida';
  }

  // Limpiar CI
  const cleanCI = ci.replace(/[.\-]/g, '');
  
  if (cleanCI.length < 6 || cleanCI.length > 8) {
    return 'La cédula no es válida';
  }

  // Verificar que sean solo números
  if (!/^\d+$/.test(cleanCI)) {
    return 'La cédula solo debe contener números';
  }

  return null;
};

// Dirección
export const validateAddress = (address: string): string | null => {
  if (!address || address.trim() === '') {
    return 'La dirección es requerida';
  }

  if (address.trim().length < 5) {
    return 'La dirección debe tener al menos 5 caracteres';
  }

  if (address.trim().length > 200) {
    return 'La dirección no puede exceder 200 caracteres';
  }

  return null;
};

// Cantidad
export const validateQuantity = (quantity: number, max?: number): string | null => {
  if (!quantity || quantity < 1) {
    return 'La cantidad debe ser mayor a 0';
  }

  if (max && quantity > max) {
    return `La cantidad máxima es ${max}`;
  }

  return null;
};

// Precio
export const validatePrice = (price: number): string | null => {
  if (price === undefined || price === null) {
    return 'El precio es requerido';
  }

  if (price < 0) {
    return 'El precio no puede ser negativo';
  }

  return null;
};

// Mensaje/Texto largo
export const validateMessage = (message: string, minLength = 10, maxLength = 500): string | null => {
  if (!message || message.trim() === '') {
    return 'El mensaje es requerido';
  }

  if (message.trim().length < minLength) {
    return `El mensaje debe tener al menos ${minLength} caracteres`;
  }

  if (message.trim().length > maxLength) {
    return `El mensaje no puede exceder ${maxLength} caracteres`;
  }

  return null;
};

// Selección requerida
export const validateRequired = (value: any, fieldName: string): string | null => {
  if (value === undefined || value === null || value === '') {
    return `${fieldName} es requerido`;
  }

  return null;
};

// ==================== VALIDADORES DE FORMULARIOS COMPLETOS ====================

// Login
export interface LoginFormData {
  email: string;
  password: string;
}

export const validateLoginForm = (data: LoginFormData): ValidationResult => {
  const errors: Record<string, string> = {};

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  if (!data.password || data.password.trim() === '') {
    errors.password = 'La contraseña es requerida';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Registro
export interface RegisterFormData {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  password: string;
  confirmPassword: string;
}

export const validateRegisterForm = (data: RegisterFormData): ValidationResult => {
  const errors: Record<string, string> = {};

  const nombreError = validateName(data.nombre, 'nombre');
  if (nombreError) errors.nombre = nombreError;

  const apellidoError = validateName(data.apellido, 'apellido');
  if (apellidoError) errors.apellido = apellidoError;

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  const phoneError = validatePhone(data.telefono);
  if (phoneError) errors.telefono = phoneError;

  const passwordError = validatePassword(data.password);
  if (passwordError) errors.password = passwordError;

  const confirmError = validatePasswordConfirm(data.password, data.confirmPassword);
  if (confirmError) errors.confirmPassword = confirmError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Checkout
export interface CheckoutFormData {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  zona: string;
  departamento: string;
  metodoPago: string;
}

export const validateCheckoutForm = (data: CheckoutFormData): ValidationResult => {
  const errors: Record<string, string> = {};

  const nombreError = validateName(data.nombre, 'nombre');
  if (nombreError) errors.nombre = nombreError;

  const apellidoError = validateName(data.apellido, 'apellido');
  if (apellidoError) errors.apellido = apellidoError;

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  const phoneError = validatePhone(data.telefono);
  if (phoneError) errors.telefono = phoneError;

  const addressError = validateAddress(data.direccion);
  if (addressError) errors.direccion = addressError;

  const zonaError = validateRequired(data.zona, 'La zona');
  if (zonaError) errors.zona = zonaError;

  const departamentoError = validateRequired(data.departamento, 'El departamento');
  if (departamentoError) errors.departamento = departamentoError;

  const pagoError = validateRequired(data.metodoPago, 'El método de pago');
  if (pagoError) errors.metodoPago = pagoError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Contacto
export interface ContactFormData {
  nombre: string;
  email: string;
  telefono?: string;
  asunto: string;
  mensaje: string;
}

export const validateContactForm = (data: ContactFormData): ValidationResult => {
  const errors: Record<string, string> = {};

  const nombreError = validateName(data.nombre, 'nombre');
  if (nombreError) errors.nombre = nombreError;

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  if (data.telefono && data.telefono.trim() !== '') {
    const phoneError = validatePhone(data.telefono);
    if (phoneError) errors.telefono = phoneError;
  }

  const asuntoError = validateRequired(data.asunto, 'El asunto');
  if (asuntoError) errors.asunto = asuntoError;

  const mensajeError = validateMessage(data.mensaje, 10, 1000);
  if (mensajeError) errors.mensaje = mensajeError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Perfil
export interface ProfileFormData {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion?: string;
  comuna?: string;
  region?: string;
}

export const validateProfileForm = (data: ProfileFormData): ValidationResult => {
  const errors: Record<string, string> = {};

  const nombreError = validateName(data.nombre, 'nombre');
  if (nombreError) errors.nombre = nombreError;

  const apellidoError = validateName(data.apellido, 'apellido');
  if (apellidoError) errors.apellido = apellidoError;

  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;

  const phoneError = validatePhone(data.telefono);
  if (phoneError) errors.telefono = phoneError;

  if (data.direccion && data.direccion.trim() !== '') {
    const addressError = validateAddress(data.direccion);
    if (addressError) errors.direccion = addressError;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// ==================== UTILIDADES DE VALIDACIÓN ====================

// Validar campo individual con debounce (para usar en onChange)
export const createDebouncedValidator = (
  validator: (value: any) => string | null,
  delay = 500
) => {
  let timeoutId: NodeJS.Timeout;

  return (value: any, callback: (error: string | null) => void) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const error = validator(value);
      callback(error);
    }, delay);
  };
};

// Limpiar errores de un campo específico
export const clearFieldError = (
  errors: Record<string, string>,
  field: string
): Record<string, string> => {
  const { [field]: _, ...rest } = errors;
  return rest;
};

// Verificar si hay errores
export const hasErrors = (errors: Record<string, string>): boolean => {
  return Object.keys(errors).length > 0;
};

// Obtener el primer error
export const getFirstError = (errors: Record<string, string>): string | null => {
  const firstKey = Object.keys(errors)[0];
  return firstKey ? errors[firstKey] : null;
};
