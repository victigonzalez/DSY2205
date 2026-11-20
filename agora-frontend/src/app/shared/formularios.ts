import { AbstractControl, FormGroup } from '@angular/forms';

/** Clases de Bootstrap para un campo: rojo si tiene error y ya fue tocado (o se intentó enviar). */
export function claseCampo(control: AbstractControl | null, enviado: boolean): Record<string, boolean> {
  const mostrar = !!control && (control.touched || control.dirty || enviado);
  return {
    'is-invalid': mostrar && !!control?.invalid,
    'is-valid': mostrar && !!control?.valid && !!control?.value,
  };
}

/** Marca todo como tocado y lleva el foco al primer campo inválido (accesibilidad). */
export function enfocarPrimerError(form: FormGroup, raiz: HTMLElement): void {
  form.markAllAsTouched();
  setTimeout(() => raiz.querySelector<HTMLElement>('.is-invalid, .ng-invalid:not(form)')?.focus());
}
