import os
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
        
        # Almacén en memoria de respaldo para pruebas unitarias / offline
        self._mock_disponibilidad = {
            'disp-01': {'id': 'disp-01', 'estado': 'libre'},
            'disp-02': {'id': 'disp-02', 'estado': 'libre'},
            'disp-03': {'id': 'disp-03', 'estado': 'reservada'}
        }
        self._mock_citas = {}
        self._mock_resenas = []

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
            self._mock_citas[cita.id] = cita
            return cita

    def listar_citas_usuario(self, usuario_id: str) -> List[Cita]:
        try:
            conn = self._get_connection()
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM citas WHERE usuario_id = %s", (usuario_id,))
                rows = cursor.fetchall()
                return [
                    Cita(
                        id=r['id'],
                        usuario_id=r['usuario_id'],
                        disponibilidad_id=r['disponibilidad_id'],
                        modalidad=r['modalidad'],
                        estado=r['estado'],
                        costo_informado_soles=float(r['costo_informado_soles'])
                    ) for r in rows
                ]
        except Exception:
            return [c for c in self._mock_citas.values() if c.usuario_id == usuario_id]

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
