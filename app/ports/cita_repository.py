from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any
from app.domain.cita import Cita

class CitaRepositoryPort(ABC):
    
    @abstractmethod
    def obtener_disponibilidad(self, disponibilidad_id: str) -> Optional[Dict[str, Any]]:
        """Verifica si el bloque de horario existe y su estado ('libre', 'reservada')."""
        pass

    @abstractmethod
    def guardar_cita_y_reservar(self, cita: Cita) -> Cita:
        """Persiste la cita y actualiza atómicamente el estado del horario a 'reservada'."""
        pass

    @abstractmethod
    def listar_citas_usuario(self, usuario_id: str) -> List[Cita]:
        """Recupera las citas solicitadas por un usuario anónimo."""
        pass
