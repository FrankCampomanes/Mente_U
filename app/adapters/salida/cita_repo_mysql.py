import os
import uuid
import datetime
from typing import Optional, List, Dict, Any
from app.domain.cita import Cita
from app.ports.cita_repository import CitaRepositoryPort

try:
    import pymysql
    import pymysql.cursors
except ImportError:
    pymysql = None

class CitaRepositoryMySQL(CitaRepositoryPort):
    def __init__(self, host=None, user=None, password=None, database=None, port=None):
        self.host = host or os.getenv('DB_HOST', 'localhost')
        self.user = user or os.getenv('DB_USER', 'root')
        self.password = password or os.getenv('DB_PASSWORD', '')
        self.database = database or os.getenv('DB_NAME', 'bd_menteu')
        self.port = int(port or os.getenv('DB_PORT', 3306))
        
        # Almacen en memoria de respaldo para pruebas unitarias / offline / dev
        self._mock_disponibilidad = {
            'disp-01': {'id': 'disp-01', 'estado': 'libre'},
            'disp-02': {'id': 'disp-02', 'estado': 'libre'},
            'disp-03': {'id': 'disp-03', 'estado': 'reservada'}
        }
        self._mock_citas = {
            'CITA-1024': {
                'id': 'CITA-1024',
                'usuario_id': 'usr-demo-01',
                'profesional_nombre': 'Psic. Diego Salinas',
                'especialidad': 'Ansiedad y estrés universitario',
                'fecha_hora': 'Lunes 14 Oct, 09:30 AM',
                'modalidad': 'virtual',
                'costo': 8.0,
                'estado': 'confirmada',
                'puntuacion': 5,
                'comentario': 'Atención muy empática y puntual.'
            }
        }
        self._mock_resenas = []
        self._mock_usuarios = {
            'usr-demo-01': {
                'id': 'usr-demo-01',
                'nombre': 'Frank Estudiante',
                'email': 'frank@utp.edu.pe',
                'password': 'password123',
                'telefono': '987654321',
                'codigo_estudiante': 'U20215432'
            }
        }
        self._mock_mensajes = [
            {
                'id': 'msg-1',
                'usuario_id': 'usr-demo-01',
                'remitente': 'asistente',
                'texto': '¡Hola Frank! Soy MenteBot, tu asistente de bienestar emocional de la UTP. ¿Cómo te has sentido con tus clases hoy?',
                'fecha': '2026-10-28 09:00:00'
            }
        ]

    def _get_connection(self):
        if not pymysql:
            raise ConnectionError("PyMySQL no está instalado en el entorno.")
        connect_kwargs = {
            'host': self.host,
            'user': self.user,
            'password': self.password,
            'database': self.database,
            'port': self.port,
            'cursorclass': pymysql.cursors.DictCursor,
            'autocommit': False
        }
        if self.host not in ('localhost', '127.0.0.1'):
            connect_kwargs['ssl'] = {'ssl': {}}
        return pymysql.connect(**connect_kwargs)

    # --- USUARIOS Y AUTENTICACION ---
    def registrar_usuario(self, id_usuario: str, nombre: str, email: str, password: str, telefono: str = "", codigo_estudiante: str = "") -> Dict[str, Any]:
        # Normalizar email
        email = email.lower().strip()
        # Verificar en memoria primero
        for u in self._mock_usuarios.values():
            if u['email'] == email:
                raise ValueError("El correo electrónico ya se encuentra registrado.")
                
        try:
            conn = self._get_connection()
            try:
                with conn.cursor() as cursor:
                    cursor.execute("SELECT id FROM usuarios WHERE email = %s", (email,))
                    if cursor.fetchone():
                        raise ValueError("El correo electrónico ya se encuentra registrado.")
                    sql = """
                        INSERT INTO usuarios (id, nombre, email, password_hash, rol, telefono, codigo_estudiante)
                        VALUES (%s, %s, %s, %s, 'estudiante', %s, %s)
                    """
                    cursor.execute(sql, (id_usuario, nombre, email, password, telefono, codigo_estudiante))
                conn.commit()
            except Exception as e:
                conn.rollback()
                if "ya se encuentra registrado" in str(e):
                    raise e
            finally:
                conn.close()
        except Exception as e:
            if "ya se encuentra registrado" in str(e):
                raise e

        usr_data = {
            'id': id_usuario,
            'nombre': nombre,
            'email': email,
            'password': password,
            'telefono': telefono,
            'codigo_estudiante': codigo_estudiante
        }
        self._mock_usuarios[id_usuario] = usr_data
        return {
            'id': id_usuario,
            'nombre': nombre,
            'email': email,
            'telefono': telefono,
            'codigo_estudiante': codigo_estudiante
        }

    def autenticar_usuario(self, email: str, password: str) -> Optional[Dict[str, Any]]:
        email = email.lower().strip()
        try:
            conn = self._get_connection()
            with conn.cursor() as cursor:
                cursor.execute("SELECT id, nombre, email, password_hash, telefono, codigo_estudiante FROM usuarios WHERE email = %s", (email,))
                row = cursor.fetchone()
                if row and (row['password_hash'] == password or row['password_hash'] == password.strip()):
                    return {
                        'id': row['id'],
                        'nombre': row['nombre'],
                        'email': row['email'],
                        'telefono': row.get('telefono', ''),
                        'codigo_estudiante': row.get('codigo_estudiante', '')
                    }
        except Exception:
            pass

        # Fallback en memoria
        for u in self._mock_usuarios.values():
            if u['email'] == email and u['password'] == password:
                return {
                    'id': u['id'],
                    'nombre': u['nombre'],
                    'email': u['email'],
                    'telefono': u.get('telefono', ''),
                    'codigo_estudiante': u.get('codigo_estudiante', '')
                }
        return None

    def obtener_usuario_por_id(self, usuario_id: str) -> Optional[Dict[str, Any]]:
        try:
            conn = self._get_connection()
            with conn.cursor() as cursor:
                cursor.execute("SELECT id, nombre, email, telefono, codigo_estudiante FROM usuarios WHERE id = %s", (usuario_id,))
                row = cursor.fetchone()
                if row:
                    return row
        except Exception:
            pass
        return self._mock_usuarios.get(usuario_id)

    # --- HISTORIAL DE MENSAJES DE CHAT ---
    def guardar_mensaje_chat(self, id_mensaje: str, usuario_id: str, remitente: str, texto: str) -> Dict[str, Any]:
        fecha_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        msg = {
            'id': id_mensaje,
            'usuario_id': usuario_id,
            'remitente': remitente,
            'texto': texto,
            'fecha': fecha_str
        }
        try:
            conn = self._get_connection()
            try:
                with conn.cursor() as cursor:
                    sql = """
                        INSERT INTO mensajes_chat (id, usuario_id, remitente, texto, fecha_envio)
                        VALUES (%s, %s, %s, %s, NOW())
                    """
                    cursor.execute(sql, (id_mensaje, usuario_id, remitente, texto))
                conn.commit()
            except Exception:
                conn.rollback()
            finally:
                conn.close()
        except Exception:
            pass

        self._mock_mensajes.append(msg)
        return msg

    def listar_mensajes_chat(self, usuario_id: str) -> List[Dict[str, Any]]:
        try:
            conn = self._get_connection()
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT id, usuario_id, remitente, texto, DATE_FORMAT(fecha_envio, '%Y-%m-%d %H:%i:%s') as fecha
                    FROM mensajes_chat
                    WHERE usuario_id = %s
                    ORDER BY fecha_envio ASC
                """, (usuario_id,))
                rows = cursor.fetchall()
                if rows:
                    return rows
        except Exception:
            pass

        return [m for m in self._mock_mensajes if m.get('usuario_id') == usuario_id or usuario_id == 'usr-demo-01']

    # --- DISPONIBILIDAD Y CITAS ---
    def obtener_disponibilidad(self, disponibilidad_id: str) -> Optional[Dict[str, Any]]:
        try:
            conn = self._get_connection()
            with conn.cursor() as cursor:
                cursor.execute("SELECT id, profesional_id, inicio, fin, estado FROM disponibilidad WHERE id = %s", (disponibilidad_id,))
                return cursor.fetchone()
        except Exception:
            return self._mock_disponibilidad.get(disponibilidad_id)

    def guardar_cita_y_reservar(self, cita: Cita) -> Cita:
        try:
            conn = self._get_connection()
            try:
                with conn.cursor() as cursor:
                    sql_cita = """
                        INSERT INTO citas (id, usuario_id, disponibilidad_id, modalidad, estado, costo_informado_soles, condiciones_aceptadas)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                    """
                    cursor.execute(sql_cita, (
                        cita.id,
                        cita.usuario_id,
                        cita.disponibilidad_id,
                        cita.modalidad,
                        cita.estado,
                        cita.costo_informado_soles,
                        1 if cita.condiciones_aceptadas else 0
                    ))

                    sql_disp = "UPDATE disponibilidad SET estado = 'reservada' WHERE id = %s"
                    cursor.execute(sql_disp, (cita.disponibilidad_id,))

                conn.commit()
                return cita
            except Exception as e:
                conn.rollback()
                raise e
            finally:
                conn.close()
        except Exception:
            if disponibilidad_id := cita.disponibilidad_id:
                if disponibilidad_id in self._mock_disponibilidad:
                    self._mock_disponibilidad[disponibilidad_id]['estado'] = 'reservada'
            
            # Guardar cita enriquecida en mock
            self._mock_citas[cita.id] = {
                'id': cita.id,
                'usuario_id': cita.usuario_id,
                'disponibilidad_id': cita.disponibilidad_id,
                'profesional_nombre': 'Psic. Diego Salinas',
                'especialidad': 'Ansiedad y estrés académico',
                'fecha_hora': 'Lunes 14 Oct, 09:30 AM',
                'modalidad': cita.modalidad,
                'estado': cita.estado,
                'costo': cita.costo_informado_soles
            }
            return cita

    def listar_citas_usuario(self, usuario_id: str) -> List[Dict[str, Any]]:
        try:
            conn = self._get_connection()
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT c.id, c.usuario_id, c.disponibilidad_id, c.modalidad, c.estado, c.costo_informado_soles,
                           p.nombre_mostrado as profesional_nombre, p.especialidad_descriptiva as especialidad,
                           DATE_FORMAT(d.inicio, '%W %d %b, %H:%i') as fecha_hora,
                           r.puntuacion, r.comentario
                    FROM citas c
                    LEFT JOIN disponibilidad d ON c.disponibilidad_id = d.id
                    LEFT JOIN profesionales p ON d.profesional_id = p.id
                    LEFT JOIN resenas r ON r.cita_id = c.id
                    WHERE c.usuario_id = %s
                    ORDER BY c.id DESC
                """, (usuario_id,))
                rows = cursor.fetchall()
                if rows:
                    return [
                        {
                            'id': r['id'],
                            'usuario_id': r['usuario_id'],
                            'profesional_nombre': r.get('profesional_nombre') or 'Psic. Diego Salinas',
                            'especialidad': r.get('especialidad') or 'Psicología Clínica UTP',
                            'fecha_hora': r.get('fecha_hora') or 'Lunes 14 Oct, 09:30 AM',
                            'modalidad': r['modalidad'],
                            'estado': r['estado'],
                            'costo': float(r['costo_informado_soles']),
                            'puntuacion': r.get('puntuacion'),
                            'comentario': r.get('comentario')
                        } for r in rows
                    ]
        except Exception:
            pass

        # Fallback en memoria
        res = []
        for c in self._mock_citas.values():
            if isinstance(c, dict):
                if c.get('usuario_id') == usuario_id or usuario_id == 'usr-demo-01':
                    res.append(c)
            elif hasattr(c, 'usuario_id') and (c.usuario_id == usuario_id or usuario_id == 'usr-demo-01'):
                res.append({
                    'id': c.id,
                    'usuario_id': c.usuario_id,
                    'profesional_nombre': 'Psic. Diego Salinas',
                    'especialidad': 'Ansiedad y estrés universitario',
                    'fecha_hora': 'Lunes 14 Oct, 09:30 AM',
                    'modalidad': c.modalidad,
                    'estado': c.estado,
                    'costo': float(c.costo_informado_soles)
                })
        return res

    def registrar_resena(self, id_resena: str, cita_id: str, puntuacion: int, comentario: str) -> Dict[str, Any]:
        try:
            conn = self._get_connection()
            try:
                with conn.cursor() as cursor:
                    sql = """
                        INSERT INTO resenas (id, cita_id, puntuacion, comentario)
                        VALUES (%s, %s, %s, %s)
                        ON DUPLICATE KEY UPDATE puntuacion=VALUES(puntuacion), comentario=VALUES(comentario)
                    """
                    cursor.execute(sql, (id_resena, cita_id, puntuacion, comentario))
                conn.commit()
            except Exception as e:
                conn.rollback()
                raise e
            finally:
                conn.close()
        except Exception:
            pass

        record = {
            "id": id_resena,
            "cita_id": cita_id,
            "puntuacion": puntuacion,
            "comentario": comentario
        }
        self._mock_resenas.append(record)
        if cita_id in self._mock_citas and isinstance(self._mock_citas[cita_id], dict):
            self._mock_citas[cita_id]['puntuacion'] = puntuacion
            self._mock_citas[cita_id]['comentario'] = comentario
        return record

    def listar_profesionales(self) -> List[Dict[str, Any]]:
        try:
            conn = self._get_connection()
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT p.id, p.nombre_mostrado, p.especialidad_descriptiva, o.tipo, o.costo_referencial_soles
                    FROM profesionales p
                    JOIN opciones_atencion o ON p.opcion_id = o.id
                """)
                return cursor.fetchall()
        except Exception:
            return []
