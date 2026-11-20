import { TestBed } from '@angular/core/testing';

import { AdminService } from './admin.service';
import { AuthService } from './auth.service';
import { ComentarioService } from './comentario.service';
import { DatosService } from './datos.service';
import { ModeracionService } from './moderacion.service';
import { TemaService } from './tema.service';

/** Pruebas de la lógica de negocio sobre los arreglos en memoria. */
describe('Servicios de Ágora', () => {
  let auth: AuthService;
  let temas: TemaService;
  let comentarios: ComentarioService;
  let moderacion: ModeracionService;
  let admin: AdminService;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({});
    TestBed.inject(DatosService).restablecerTodo();
    auth = TestBed.inject(AuthService);
    temas = TestBed.inject(TemaService);
    comentarios = TestBed.inject(ComentarioService);
    moderacion = TestBed.inject(ModeracionService);
    admin = TestBed.inject(AdminService);
  });

  describe('AuthService', () => {
    it('inicia sesión con username o correo', () => {
      expect(auth.iniciarSesion('admin', 'Admin#123').ok).toBe(true);
      expect(auth.esAdmin()).toBe(true);
      auth.cerrarSesion();
      expect(auth.iniciarSesion('victor@correo.cl', 'Usuario#123').ok).toBe(true);
      expect(auth.rol()).toBe('USUARIO');
    });

    it('rechaza credenciales incorrectas y cuentas desactivadas', () => {
      expect(auth.iniciarSesion('admin', 'mala')).toEqual({ ok: false, mensaje: 'Usuario o contraseña incorrectos.' });
      const r = auth.iniciarSesion('josefa', 'Usuario#123');
      expect(r.ok).toBe(false);
      expect(auth.autenticado()).toBe(false);
    });

    it('registra con rol USUARIO y evita duplicados', () => {
      const r = auth.registrar({ nombre: 'Ana Pérez', username: 'Ana', correo: 'ANA@correo.cl', password: 'Clave#2026' });
      expect(r.ok && r.valor.rol).toBe('USUARIO');
      expect(r.ok && r.valor.username).toBe('ana');
      expect(auth.registrar({ nombre: 'Otra Ana', username: 'ana', correo: 'x@y.cl', password: 'Clave#2026' }).ok).toBe(false);
    });

    it('recupera la contraseña con el código de 6 dígitos', () => {
      const codigo = auth.solicitarCodigo('camila@correo.cl');
      expect(codigo.ok).toBe(true);
      expect(auth.restablecerPassword('camila@correo.cl', '000000', 'Nueva#2026').ok).toBe(false);
      expect(auth.restablecerPassword('camila@correo.cl', codigo.ok ? codigo.valor : '', 'Nueva#2026').ok).toBe(true);
      expect(auth.iniciarSesion('camila', 'Nueva#2026').ok).toBe(true);
    });
  });

  describe('Temas y comentarios', () => {
    it('la búsqueda oculta los temas baneados y combina filtros', () => {
      expect(temas.buscar({}).every((t) => t.estado === 'ACTIVO')).toBe(true);
      expect(temas.buscar({ categoriaId: 3 }).map((t) => t.id).sort()).toEqual([10, 2]);
      expect(temas.buscar({ texto: 'SPRING' }).map((t) => t.id)).toEqual([1]);
    });

    it('publicar exige sesión; editar solo el autor', () => {
      expect(temas.publicar({ titulo: 'Hola mundo', contenido: 'x'.repeat(20), categoriaId: 1 }).ok).toBe(false);
      auth.iniciarSesion('victor', 'Usuario#123');
      const r = temas.publicar({ titulo: 'Hola mundo', contenido: 'x'.repeat(20), categoriaId: 1 });
      expect(r.ok).toBe(true);
      expect(temas.editar(2, { titulo: 'Ajeno', contenido: 'x'.repeat(20), categoriaId: 3 }).ok).toBe(false);
    });

    it('no se puede comentar un tema baneado', () => {
      auth.iniciarSesion('victor', 'Usuario#123');
      expect(comentarios.comentar(6, 'Hola').ok).toBe(false);
      expect(comentarios.comentar(1, 'Hola').ok).toBe(true);
    });
  });

  describe('Roles: moderación y administración', () => {
    it('un USUARIO no puede banear; un MODERADOR sí, con motivo', () => {
      auth.iniciarSesion('victor', 'Usuario#123');
      expect(moderacion.banearTema(1, 'Spam publicitario').ok).toBe(false);
      auth.cerrarSesion();
      auth.iniciarSesion('moderador', 'Moder#123');
      expect(moderacion.banearTema(1, 'x').ok).toBe(false);
      expect(moderacion.banearTema(1, 'Spam publicitario').ok).toBe(true);
      expect(temas.buscar({}).some((t) => t.id === 1)).toBe(false);
      expect(moderacion.desbanearTema(1).ok).toBe(true);
    });

    it('solo ADMIN gestiona usuarios; eliminar borra también su contenido', () => {
      auth.iniciarSesion('moderador', 'Moder#123');
      expect(admin.eliminarUsuario(4).ok).toBe(false);
      auth.cerrarSesion();
      auth.iniciarSesion('admin', 'Admin#123');
      expect(admin.eliminarUsuario(4).ok).toBe(true);
      expect(temas.vistas().some((t) => t.autorId === 4)).toBe(false);
      expect(admin.eliminarUsuario(1).ok).toBe(false); // no puede eliminarse a sí mismo
    });

    it('no se elimina una categoría que tiene temas', () => {
      auth.iniciarSesion('admin', 'Admin#123');
      expect(admin.eliminarCategoria(1).ok).toBe(false);
      const nueva = admin.crearCategoria({ nombre: 'Libros', slug: '', descripcion: 'Novelas y ensayos', icono: 'bi-book', color: '#123456' });
      expect(nueva.ok && nueva.valor.slug).toBe('libros');
      expect(admin.eliminarCategoria(nueva.ok ? nueva.valor.id : 0).ok).toBe(true);
    });
  });
});
