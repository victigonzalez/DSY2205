import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validaciones personalizadas de Ágora (se suman a las de Angular y a los
 * atributos HTML required, minlength, maxlength y type="email").
 */

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 20;

/** Reglas de seguridad de la contraseña. La vista las muestra como lista de chequeo. */
export const REGLAS_PASSWORD: { clave: string; texto: string; cumple: (v: string) => boolean }[] = [
  { clave: 'largoMinimo', texto: `Al menos ${PASSWORD_MIN} caracteres`, cumple: (v) => v.length >= PASSWORD_MIN },
  { clave: 'largoMaximo', texto: `Máximo ${PASSWORD_MAX} caracteres`, cumple: (v) => v.length > 0 && v.length <= PASSWORD_MAX },
  { clave: 'mayuscula', texto: 'Una letra mayúscula', cumple: (v) => /[A-ZÁÉÍÓÚÑ]/.test(v) },
  { clave: 'minuscula', texto: 'Una letra minúscula', cumple: (v) => /[a-záéíóúñ]/.test(v) },
  { clave: 'numero', texto: 'Un número', cumple: (v) => /\d/.test(v) },
  { clave: 'especial', texto: 'Un carácter especial (#, $, !, @, %...)', cumple: (v) => /[^A-Za-z0-9ÁÉÍÓÚÑáéíóúñ\s]/.test(v) },
  { clave: 'sinEspacios', texto: 'Sin espacios', cumple: (v) => v.length > 0 && !/\s/.test(v) },
];

/** Contraseña segura: devuelve { passwordInsegura: { reglas incumplidas } } o null. */
export const passwordSegura: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const valor = (control.value ?? '') as string;
  if (!valor) return null; // de lo vacío se encarga Validators.required
  const incumplidas = REGLAS_PASSWORD.filter((r) => !r.cumple(valor)).map((r) => r.clave);
  return incumplidas.length ? { passwordInsegura: incumplidas } : null;
};

/** En un FormGroup: el campo `confirmar` debe ser igual a `campo`. El error queda en `confirmar`. */
export function coinciden(campo: string, confirmar: string): ValidatorFn {
  return (grupo: AbstractControl): ValidationErrors | null => {
    const a = grupo.get(campo);
    const b = grupo.get(confirmar);
    if (!a || !b) return null;
    const errores = { ...(b.errors ?? {}) };
    if (b.value && a.value !== b.value) {
      errores['noCoinciden'] = true;
    } else {
      delete errores['noCoinciden'];
    }
    b.setErrors(Object.keys(errores).length ? errores : null);
    return null;
  };
}

/** Nombre real: solo letras (con tildes), espacios, apóstrofo y guion; al menos nombre y apellido. */
export const nombreValido: ValidatorFn = (control) => {
  const v = ((control.value ?? '') as string).trim();
  if (!v) return null;
  if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/.test(v)) return { nombreInvalido: true };
  if (v.split(/\s+/).length < 2) return { nombreIncompleto: true };
  return null;
};

/** Username: empieza con letra; luego letras minúsculas, números, punto o guion bajo. */
export const usernameValido: ValidatorFn = (control) => {
  const v = (control.value ?? '') as string;
  if (!v) return null;
  return /^[a-z][a-z0-9._]*$/.test(v) ? null : { usernameInvalido: true };
};

/** Correo con dominio y extensión (Validators.email acepta "a@b" sin punto). */
export const correoCompleto: ValidatorFn = (control) => {
  const v = (control.value ?? '') as string;
  if (!v) return null;
  return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v) ? null : { correoInvalido: true };
};

/** No permite un texto hecho solo de espacios. */
export const noSoloEspacios: ValidatorFn = (control) => {
  const v = control.value;
  return typeof v === 'string' && v.length > 0 && v.trim().length === 0 ? { soloEspacios: true } : null;
};

/** Valida contra una función de unicidad (ej: username ya registrado). */
export function unico(enUso: (valor: string) => boolean, error: string): ValidatorFn {
  return (control) => {
    const v = (control.value ?? '') as string;
    return v && enUso(v) ? { [error]: true } : null;
  };
}

/** Color hexadecimal #RRGGBB. */
export const colorHex: ValidatorFn = (control) => {
  const v = (control.value ?? '') as string;
  return !v || /^#[0-9a-f]{6}$/i.test(v) ? null : { colorInvalido: true };
};

/** Textos de error por clave, para mostrarlos de forma consistente en todos los formularios. */
export const MENSAJES_ERROR: Record<string, (e: any) => string> = {
  required: () => 'Este campo es obligatorio.',
  requiredTrue: () => 'Debes aceptar para continuar.',
  minlength: (e) => `Debe tener al menos ${e.requiredLength} caracteres (tiene ${e.actualLength}).`,
  maxlength: (e) => `No puede superar los ${e.requiredLength} caracteres.`,
  email: () => 'Escribe un correo válido, por ejemplo nombre@dominio.cl.',
  correoInvalido: () => 'Escribe un correo válido, por ejemplo nombre@dominio.cl.',
  pattern: () => 'El formato no es válido.',
  passwordInsegura: () => 'La contraseña no cumple todas las reglas de seguridad.',
  noCoinciden: () => 'Las contraseñas no coinciden.',
  nombreInvalido: () => 'Usa solo letras, espacios, apóstrofo o guion.',
  nombreIncompleto: () => 'Escribe tu nombre y apellido.',
  usernameInvalido: () => 'Empieza con una letra y usa solo minúsculas, números, punto o guion bajo.',
  usernameEnUso: () => 'Ese nombre de usuario ya está en uso.',
  correoEnUso: () => 'Ese correo ya tiene una cuenta. ¿Quieres iniciar sesión?',
  categoriaEnUso: () => 'Ya existe una categoría con ese nombre.',
  soloEspacios: () => 'No puede contener solo espacios.',
  colorInvalido: () => 'Usa un color en formato #RRGGBB.',
  codigoInvalido: () => 'El código tiene 6 dígitos.',
};
