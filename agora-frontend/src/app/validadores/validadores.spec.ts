import { FormControl, FormGroup } from '@angular/forms';

import { coinciden, correoCompleto, nombreValido, passwordSegura, usernameValido } from './validadores';

const errores = (fn: typeof passwordSegura, valor: string) => fn(new FormControl(valor));

describe('Validaciones de formularios', () => {
  describe('passwordSegura (7 reglas)', () => {
    it('acepta una contraseña que cumple todas las reglas', () => {
      expect(errores(passwordSegura, 'Clave#2026')).toBeNull();
    });

    it.each([
      ['Ab#1', 'largoMinimo'],
      ['Abcdefgh#1234567890xyz', 'largoMaximo'],
      ['clave#2026', 'mayuscula'],
      ['CLAVE#2026', 'minuscula'],
      ['Clave#Segura', 'numero'],
      ['Clave2026', 'especial'],
      ['Clave #2026', 'sinEspacios'],
    ])('"%s" incumple la regla %s', (valor, regla) => {
      expect(errores(passwordSegura, valor)?.['passwordInsegura']).toContain(regla);
    });

    it('deja el campo vacío a Validators.required', () => {
      expect(errores(passwordSegura, '')).toBeNull();
    });
  });

  it('coinciden marca el error en la confirmación', () => {
    const form = new FormGroup(
      { password: new FormControl('Clave#2026'), confirmar: new FormControl('Otra#2026') },
      { validators: coinciden('password', 'confirmar') },
    );
    expect(form.controls.confirmar.hasError('noCoinciden')).toBe(true);
    form.controls.confirmar.setValue('Clave#2026');
    expect(form.controls.confirmar.valid).toBe(true);
  });

  it('nombreValido exige letras y al menos nombre y apellido', () => {
    expect(errores(nombreValido, 'José Muñoz')).toBeNull();
    expect(errores(nombreValido, 'José')).toEqual({ nombreIncompleto: true });
    expect(errores(nombreValido, 'R2D2 Robot')).toEqual({ nombreInvalido: true });
  });

  it('usernameValido: empieza con letra, solo minúsculas, números, punto y guion bajo', () => {
    expect(errores(usernameValido, 'victor_g.2')).toBeNull();
    expect(errores(usernameValido, '2victor')).toEqual({ usernameInvalido: true });
    expect(errores(usernameValido, 'Victor G')).toEqual({ usernameInvalido: true });
  });

  it('correoCompleto exige dominio con extensión', () => {
    expect(errores(correoCompleto, 'ana@correo.cl')).toBeNull();
    expect(errores(correoCompleto, 'ana@correo')).toEqual({ correoInvalido: true });
  });
});
