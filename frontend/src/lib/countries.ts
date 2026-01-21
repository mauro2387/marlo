// Países de habla hispana con códigos telefónicos
export const SPANISH_SPEAKING_COUNTRIES = [
  { code: 'UY', name: 'Uruguay', dialCode: '+598', flag: '🇺🇾', phoneLength: 8 },
  { code: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷', phoneLength: 10 },
  { code: 'CL', name: 'Chile', dialCode: '+56', flag: '🇨🇱', phoneLength: 9 },
  { code: 'BR', name: 'Brasil', dialCode: '+55', flag: '🇧🇷', phoneLength: 11 },
  { code: 'PY', name: 'Paraguay', dialCode: '+595', flag: '🇵🇾', phoneLength: 9 },
  { code: 'ES', name: 'España', dialCode: '+34', flag: '🇪🇸', phoneLength: 9 },
  { code: 'MX', name: 'México', dialCode: '+52', flag: '🇲🇽', phoneLength: 10 },
  { code: 'CO', name: 'Colombia', dialCode: '+57', flag: '🇨🇴', phoneLength: 10 },
  { code: 'PE', name: 'Perú', dialCode: '+51', flag: '🇵🇪', phoneLength: 9 },
  { code: 'VE', name: 'Venezuela', dialCode: '+58', flag: '🇻🇪', phoneLength: 10 },
  { code: 'EC', name: 'Ecuador', dialCode: '+593', flag: '🇪🇨', phoneLength: 9 },
  { code: 'BO', name: 'Bolivia', dialCode: '+591', flag: '🇧🇴', phoneLength: 8 },
  { code: 'CR', name: 'Costa Rica', dialCode: '+506', flag: '🇨🇷', phoneLength: 8 },
  { code: 'PA', name: 'Panamá', dialCode: '+507', flag: '🇵🇦', phoneLength: 8 },
  { code: 'DO', name: 'República Dominicana', dialCode: '+1-809', flag: '🇩🇴', phoneLength: 10 },
  { code: 'GT', name: 'Guatemala', dialCode: '+502', flag: '🇬🇹', phoneLength: 8 },
  { code: 'HN', name: 'Honduras', dialCode: '+504', flag: '🇭🇳', phoneLength: 8 },
  { code: 'SV', name: 'El Salvador', dialCode: '+503', flag: '🇸🇻', phoneLength: 8 },
  { code: 'NI', name: 'Nicaragua', dialCode: '+505', flag: '🇳🇮', phoneLength: 8 },
  { code: 'CU', name: 'Cuba', dialCode: '+53', flag: '🇨🇺', phoneLength: 8 },
];

export function validatePhone(phone: string, countryCode: string): boolean {
  // Limpiar el número (solo dígitos)
  const cleaned = phone.replace(/\D/g, '');
  
  const country = SPANISH_SPEAKING_COUNTRIES.find(c => c.code === countryCode);
  if (!country) return false;
  
  // Verificar longitud según el país
  // Aceptar también +/- 1 dígito de flexibilidad
  const minLength = country.phoneLength - 1;
  const maxLength = country.phoneLength + 1;
  
  return cleaned.length >= minLength && cleaned.length <= maxLength;
}

export function formatPhoneNumber(phone: string, countryCode: string): string {
  // Limpiar el número
  const cleaned = phone.replace(/\D/g, '');
  
  const country = SPANISH_SPEAKING_COUNTRIES.find(c => c.code === countryCode);
  if (!country) return phone;
  
  // Si el número ya tiene el código de país, devolverlo
  if (phone.startsWith('+')) return phone;
  
  // Agregar código de país
  return `${country.dialCode}${cleaned}`;
}

export function getCountryByCode(code: string) {
  return SPANISH_SPEAKING_COUNTRIES.find(c => c.code === code);
}
