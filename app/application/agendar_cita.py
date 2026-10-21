import uuid
from app.domain.cita import Cita
from app.ports.cita_repository import CitaRepositoryPort

class HorarioNoDisponibleError(Exception):
    pass

class AgendarCitaUseCase:
    def __init__(self, repository: CitaRepositoryPort):
        self.repository = repository

    def ejecutar(self, usuario_id: str, disponibilidad_id: str, modalidad: str, costo: float = 0.0) -> Cita:
        # 1. Verificar existencia y estado del horario
        disp = self.repository.obtener_disponibilidad(disponibilidad_id)
        if not disp:
            raise ValueError(f"El bloque de horario '{disponibilidad_id}' no existe.")
        
        if disp.get('estado') != 'libre':
            raise HorarioNoDisponibleError(f"El horario seleccionado ya no está disponible (estado: {disp.get('estado')}).")

        # 2. Instanciar y validar entidad de dominio
        nueva_cita = Cita(
            id=str(uuid.uuid4()),
            usuario_id=usuario_id,
            disponibilidad_id=disponibilidad_id,
            modalidad=modalidad,
            estado='solicitada',
            costo_informado_soles=costo,
            condiciones_aceptadas=True
        )
        nueva_cita.validar_para_registro()

        # 3. Persistir atómicamente a través del puerto
        return self.repository.guardar_cita_y_reservar(nueva_cita)
