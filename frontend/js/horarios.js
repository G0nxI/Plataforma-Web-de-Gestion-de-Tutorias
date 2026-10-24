/*
 * Página de horarios: selección de tutor y ejemplo local de disponibilidad.
 * Los horarios son de demostración. No hay peticiones de red, reservas reales,
 * almacenamiento de datos ni autenticación.
 * La navegación y los avisos globales siguen siendo responsabilidad de main.js.
 */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const selector = document.getElementById('horarios-elegir-tutor');
    const botones = [...document.querySelectorAll('.horarios-tutor[data-tutor]')];
    const nombre = document.getElementById('horarios-nombre');
    const apellidos = document.getElementById('horarios-apellidos');
    const contador = document.getElementById('horarios-disponibles');
    const cuerpo = document.getElementById('horarios-cuerpo');
    const estado = document.getElementById('horarios-estado');
    if (!selector || !nombre || !apellidos || !contador || !cuerpo || !estado) return;

    // Datos de ejemplo, sin información identificativa real ni llamadas a APIs.
    const tutores = [
        { id: 1, nombre: 'Tutor 1', apellidos: 'García Hernández' },
        { id: 2, nombre: 'Tutor 2', apellidos: 'López Martín' },
        { id: 3, nombre: 'Tutor 3', apellidos: 'Ruiz Pérez' },
        { id: 4, nombre: 'Tutor 4', apellidos: 'Gómez Navarro' },
        { id: 5, nombre: 'Tutor 5', apellidos: 'Morales Ortega' },
        { id: 6, nombre: 'Tutor 6', apellidos: 'Sánchez Romero' },
        { id: 7, nombre: 'Tutor 7', apellidos: 'Díaz Fernández' }
    ];
    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
    const horas = ['8:30–9:30', '9:30–10:30', '10:30–11:30', '12:00–13:00', '13:00–14:00', '14:00–15:00'];

    // Matriz [franja][día]: el tutor 1 reproduce exactamente los 15 huecos libres
    // de los wireframes. Para los demás tutores se desplaza el patrón por día.
    const disponibilidadBase = [
        [true, false, true, false, true],
        [true, true, true, false, true],
        [false, false, false, false, true],
        [true, false, false, true, false],
        [false, true, true, true, false],
        [false, false, true, true, false]
    ];
    let tutorActivo = 1;

    function disponible(tutorId, fila, columna) {
        return disponibilidadBase[fila][(columna + tutorId - 1) % dias.length];
    }

    function crearCelda(tutorId, fila, columna) {
        const celda = document.createElement('td');
        const libre = disponible(tutorId, fila, columna);
        if (libre) {
            const boton = document.createElement('button');
            boton.type = 'button';
            boton.className = 'horarios-hora horarios-hora--libre';
            boton.textContent = 'Disponible';
            boton.dataset.dia = dias[columna];
            boton.dataset.hora = horas[fila];
            boton.setAttribute('aria-label', `${dias[columna]}, ${horas[fila]}: disponible. Consultar reserva`);
            celda.appendChild(boton);
        } else {
            const texto = document.createElement('span');
            texto.className = 'horarios-hora horarios-hora--ocupada';
            texto.textContent = 'Ocupado';
            celda.appendChild(texto);
        }
        return celda;
    }

    function seleccionarTutor(id) {
        const tutor = tutores.find((elemento) => elemento.id === id);
        if (!tutor) return;
        tutorActivo = tutor.id;
        nombre.textContent = tutor.nombre;
        apellidos.textContent = tutor.apellidos;
        selector.value = String(tutor.id);
        botones.forEach((boton) => {
            const activo = Number(boton.dataset.tutor) === tutor.id;
            boton.classList.toggle('is-selected', activo);
            boton.setAttribute('aria-pressed', String(activo));
        });

        const fragmento = document.createDocumentFragment();
        let libres = 0;
        horas.forEach((hora, fila) => {
            const tr = document.createElement('tr');
            const encabezado = document.createElement('th');
            encabezado.scope = 'row';
            encabezado.textContent = hora;
            tr.appendChild(encabezado);
            dias.forEach((_, columna) => {
                if (disponible(id, fila, columna)) libres += 1;
                tr.appendChild(crearCelda(id, fila, columna));
            });
            fragmento.appendChild(tr);
        });
        cuerpo.replaceChildren(fragmento);
        contador.textContent = String(libres);
        estado.hidden = true;
        estado.textContent = '';
    }

    botones.forEach((boton) => {
        boton.addEventListener('click', () => seleccionarTutor(Number(boton.dataset.tutor)));
    });
    selector.addEventListener('change', () => seleccionarTutor(Number(selector.value)));

    // Delegación: los botones de la tabla cambian con el tutor seleccionado.
    cuerpo.addEventListener('click', (evento) => {
        const boton = evento.target.closest('button.horarios-hora--libre');
        if (!boton || !cuerpo.contains(boton)) return;
        const tutor = tutores.find((elemento) => elemento.id === tutorActivo);
        estado.textContent = `${boton.dataset.dia}, ${boton.dataset.hora} (${tutor.nombre}): la reserva todavía no está disponible. No se ha realizado ninguna reserva.`;
        estado.hidden = false;
    });

    seleccionarTutor(tutorActivo);
});
