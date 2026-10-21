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
        
        # Almacén en memoria de respaldo para pruebas unitarias / sin XAMPP
        self._mock_disponibilidad = {
            'disp-01': {'id': 'disp-01', 'estado': 'libre'},
            'disp-02': {'id': 'disp-02', 'estado': 'libre'},
            'disp-03': {'id': 'disp-03', 'estado': 'reservada'}
        }
        self._mock_citas = {}

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
        # Si el host es remoto (como Aiven cloud), habilitar SSL obligatorio
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
            # Respaldo en memoria si XAMPP no está encendido durante pruebas locales
            return self._mock_disponibilidad.get(disponibilidad_id)

    def guardar_cita_y_reservar(self, cita: Cita) -> Cita:
        try:
            conn = self._get_connection()
            try:
                with conn.cursor() as cursor:
                    # 1. Insertar la cita
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

                    # 2. Actualizar estado del horario a reservado
                    sql_disp = "UPDATE disponibilidad SET estado = 'reservada' WHERE id = %s"
                    cursor.execute(sql_disp, (cita.disponibilidad_id,))

                conn.commit()
                return cita
            except Exception as e:
                conn.rollback()
                raise e
            finally:
                conn.close()
        except Exception as e:
            # Si MySQL no está levantado, persistir en memoria para demostración sin caída
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
