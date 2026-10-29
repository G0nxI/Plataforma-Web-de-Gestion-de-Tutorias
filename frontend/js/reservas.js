/*
 * Reserva de tutorías: prototipo LOCAL, sin autenticación ni backend.
 * La disponibilidad es de demostración y NO registra, bloquea ni persiste plazas.
 * Reutiliza el mismo calendario semanal de ejemplo que frontend/js/horarios.js.
 */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reservas-form');
    const profesor = document.getElementById('reservas-profesor');
    const fecha = document.getElementById('reservas-fecha');
    const listaHoras = document.getElementById('reservas-lista-horas');
    const resumenProfesor = document.getElementById('reservas-resumen-profesor');
    const resumenFecha = document.getElementById('reservas-resumen-fecha');
    const resumenHora = document.getElementById('reservas-resumen-hora');
    const resumenEstado = document.getElementById('reservas-resumen-estado');
    const confirmar = document.getElementById('reservas-confirmar');
    const resultado = document.getElementById('reservas-resultado-texto');
    const resultadoPanel = document.querySelector('.reservas-resultado');
    if (![form, profesor, fecha, listaHoras, resumenProfesor, resumenFecha,
          resumenHora, resumenEstado, confirmar, resultado, resultadoPanel].every(Boolean)) return;

    const tutores = [
        { id: 1, nombre: 'Tutor 1 — García Hernández' },
        { id: 2, nombre: 'Tutor 2 — López Martín' },
        { id: 3, nombre: 'Tutor 3 — Ruiz Pérez' },
        { id: 4, nombre: 'Tutor 4 — Gómez Navarro' },
        { id: 5, nombre: 'Tutor 5 — Morales Ortega' },
        { id: 6, nombre: 'Tutor 6 — Sánchez Romero' },
        { id: 7, nombre: 'Tutor 7 — Díaz Fernández' }
    ];
    const tramos = ['8:30–9:30', '9:30–10:30', '10:30–11:30', '12:00–13:00', '13:00–14:00', '14:00–15:00'];
    // Misma matriz y desplazamiento que Horarios: fila=tramo, columna=lunes..viernes.
    const disponibilidadBase = [
        [true, false, true, false, true],
        [true, true, true, false, true],
        [false, false, false, false, true],
        [true, false, false, true, false],
        [false, true, true, true, false],
        [false, false, true, true, false]
    ];
    const formatoFecha = new Intl.DateTimeFormat('es-ES', {
        weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
    });
    let horaSeleccionada = '';

    function diaLaborable(date) { return date.getDay() >= 1 && date.getDay() <= 5; }
    function isoLocal(date) {
        return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    }
    function fechaLocal(iso) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
        const [y,m,d] = iso.split('-').map(Number);
        const out = new Date(y, m-1, d);
        return isoLocal(out) === iso ? out : null;
    }
    function formatearFecha(iso) {
        const date = fechaLocal(iso);
        return date ? formatoFecha.format(date) : 'Sin seleccionar';
    }
    function estaDisponible(id, iso, tramoIndex) {
        const date = fechaLocal(iso);
        const columna = date ? date.getDay()-1 : -1;
        if (!tutores.some(t => t.id === id) || columna < 0 || columna > 4 ||
            !Number.isInteger(tramoIndex) || tramoIndex < 0 || tramoIndex >= tramos.length) return false;
        return disponibilidadBase[tramoIndex][(columna + id - 1) % 5];
    }
    function informar(mensaje, estado) {
        resultado.textContent = mensaje;
        resultadoPanel.dataset.estado = estado || '';
    }
    function limpiarResultado() {
        informar('Al confirmar, aquí se mostrará el resultado de la demostración. No se guardará ninguna reserva.', '');
    }
    function actualizarResumen() {
        const tutor = tutores.find(t => t.id === Number(profesor.value));
        resumenProfesor.textContent = tutor ? tutor.nombre : 'Sin seleccionar';
        resumenFecha.textContent = fecha.value ? formatearFecha(fecha.value) : 'Sin seleccionar';
        resumenHora.textContent = horaSeleccionada || 'Sin seleccionar';
        const completo = Boolean(tutor && fecha.value && horaSeleccionada &&
            estaDisponible(tutor.id, fecha.value, tramos.indexOf(horaSeleccionada)));
        resumenEstado.textContent = completo ? 'Pendiente de confirmar (demo)' : 'Incompleta';
        confirmar.disabled = !completo;
    }
    function pintarHoras() {
        horaSeleccionada = '';
        listaHoras.replaceChildren();
        const id = Number(profesor.value);
        if (!tutores.some(t => t.id === id) || !fecha.value) {
            const mensaje = document.createElement('p');
            mensaje.className = 'reservas-placeholder';
            mensaje.textContent = 'Selecciona profesor y fecha para consultar las franjas.';
            listaHoras.appendChild(mensaje);
            actualizarResumen();
            return;
        }
        tramos.forEach((tramo, index) => {
            const libre = estaDisponible(id, fecha.value, index);
            const boton = document.createElement('button');
            boton.type = 'button';
            boton.className = 'reservas-hora';
            boton.textContent = tramo;
            boton.disabled = !libre;
            boton.dataset.tramo = String(index);
            boton.setAttribute('aria-pressed', 'false');
            boton.setAttribute('aria-label', `${tramo}: ${libre ? 'disponible' : 'ocupado'}`);
            boton.title = libre ? 'Seleccionar franja' : 'Horario ocupado (simulado)';
            listaHoras.appendChild(boton);
        });
        actualizarResumen();
    }
    function crearFechas() {
        // 15 próximos días lectivos a partir de mañana, sin fines de semana.
        // No se interpretan como fechas realmente disponibles: son datos de ejemplo.
        const hoy = new Date();
        const fechaBase = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        fecha.replaceChildren();
        let lectivos = 0;
        let offset = 1;
        while (lectivos < 15) {
            const dia = new Date(fechaBase.getFullYear(), fechaBase.getMonth(), fechaBase.getDate() + offset);
            if (diaLaborable(dia)) {
                const option = document.createElement('option');
                option.value = isoLocal(dia);
                option.textContent = formatoFecha.format(dia);
                fecha.appendChild(option);
                lectivos++;
            }
            offset++;
        }
    }
    function aplicarParametros() {
        const args = new URLSearchParams(window.location.search);
        const id = Number(args.get('tutor'));
        if (tutores.some(t => t.id === id)) profesor.value = String(id);
        const fechaURL = args.get('fecha');
        if (fechaURL && [...fecha.options].some(op => op.value === fechaURL)) fecha.value = fechaURL;
        const diaURL = (args.get('dia') || '').toLocaleLowerCase('es-ES');
        if (!fechaURL && diaURL) {
            const dias = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];
            const indice = dias.indexOf(diaURL);
            const primera = [...fecha.options].find(op => {
                const date = fechaLocal(op.value);
                return date && date.getDay() === indice+1;
            });
            if (primera) fecha.value = primera.value;
        }
        pintarHoras();
        const horaURL = args.get('hora');
        const indiceHora = tramos.findIndex(h => h === horaURL || h.startsWith(`${horaURL}–`) || h.startsWith(`${horaURL}-`));
        const idActual = Number(profesor.value);
        if (indiceHora !== -1 && estaDisponible(idActual, fecha.value, indiceHora)) {
            seleccionarHora(indiceHora);
        }
    }
    function seleccionarHora(index) {
        const id = Number(profesor.value);
        if (!estaDisponible(id, fecha.value, index)) return;
        horaSeleccionada = tramos[index];
        listaHoras.querySelectorAll('button[data-tramo]').forEach(b => {
            const activo = Number(b.dataset.tramo) === index;
            b.classList.toggle('is-selected', activo);
            b.setAttribute('aria-pressed', String(activo));
        });
        actualizarResumen();
        limpiarResultado();
    }

    profesor.addEventListener('change', () => { pintarHoras(); limpiarResultado(); });
    fecha.addEventListener('change', () => { pintarHoras(); limpiarResultado(); });
    listaHoras.addEventListener('click', (evento) => {
        const boton = evento.target.closest('button[data-tramo]');
        if (!boton || boton.disabled || !listaHoras.contains(boton)) return;
        seleccionarHora(Number(boton.dataset.tramo));
    });
    form.addEventListener('submit', (evento) => {
        evento.preventDefault();
        const id = Number(profesor.value);
        const index = tramos.indexOf(horaSeleccionada);
        if (!horaSeleccionada || !estaDisponible(id, fecha.value, index)) {
            informar('Selecciona un profesor, un día lectivo y una franja disponible antes de continuar.', 'error');
            actualizarResumen();
            return;
        }
        // Confirmación explícitamente demostrativa: no se crea ningún recurso.
        informar(`Demostración completada: ${resumenProfesor.textContent}, ${formatearFecha(fecha.value)}, ${horaSeleccionada}. No se ha realizado ni registrado ninguna reserva real.`, 'demo');
        resumenEstado.textContent = 'Simulación completada (no registrada)';
    });
    crearFechas();
    aplicarParametros();
});
