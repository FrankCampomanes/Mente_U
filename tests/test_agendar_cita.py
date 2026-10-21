import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pytest
from app.domain.cita import Cita
from app.application.agendar_cita import AgendarCitaUseCase, HorarioNoDisponibleError
from app.ports.cita_repository import CitaRepositoryPort


class FakeCitaRepository(CitaRepositoryPort):
    def __init__(self):
        self.disponibilidades = {
            'disp-libre-1': {'id': 'disp-libre-1', 'estado': 'libre'},
            'disp-ocupada-2': {'id': 'disp-ocupada-2', 'estado': 'reservada'}
        }
        self.citas_guardadas = []

    def obtener_disponibilidad(self, disponibilidad_id: str):
        return self.disponibilidades.get(disponibilidad_id)

    def guardar_cita_y_reservar(self, cita: Cita):
        self.citas_guardadas.append(cita)
        self.disponibilidades[cita.disponibilidad_id]['estado'] = 'reservada'
        return cita

    def listar_citas_usuario(self, usuario_id: str):
        return [c for c in self.citas_guardadas if c.usuario_id == usuario_id]

# CP-01 (Verifica CA-01): Registro Exitoso
def test_agendar_cita_exitosamente():
    repo = FakeCitaRepository()
    use_case = AgendarCitaUseCase(repo)

    cita = use_case.ejecutar(
        usuario_id="usr-test-1",
        disponibilidad_id="disp-libre-1",
        modalidad="virtual",
        costo=15.0
    )

    assert cita.id is not None
    assert cita.estado == "solicitada"
    assert cita.costo_informado_soles == 15.0
    assert repo.disponibilidades['disp-libre-1']['estado'] == 'reservada'

# CP-02 (Verifica CA-02): Conflicto de Horario
def test_no_permite_agendar_horario_ya_reservado():
    repo = FakeCitaRepository()
    use_case = AgendarCitaUseCase(repo)

    with pytest.raises(HorarioNoDisponibleError):
        use_case.ejecutar(
            usuario_id="usr-test-2",
            disponibilidad_id="disp-ocupada-2",
            modalidad="presencial",
            costo=0.0
        )
