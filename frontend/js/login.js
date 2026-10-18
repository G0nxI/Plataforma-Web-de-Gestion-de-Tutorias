/* Login (#20): interacciones de prototipo, sin autenticación ni backend.
 * No se guardan credenciales ni se simula una sesión iniciada.
 */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('login-formulario');
    const identificador = document.getElementById('login-identificador');
    const contrasena = document.getElementById('login-contrasena');
    const mensaje = document.getElementById('login-mensaje');
    const recuperar = document.getElementById('login-recuperar');

    if (!formulario || !identificador || !contrasena || !mensaje) return;

    function mostrarMensaje(texto, esError = false) {
        mensaje.textContent = texto;
        mensaje.hidden = false;
        mensaje.classList.toggle('login-mensaje--error', esError);
    }

    function limpiarMensaje() {
        mensaje.textContent = '';
        mensaje.hidden = true;
        mensaje.classList.remove('login-mensaje--error');
    }

    function marcarInvalido(campo, invalido) {
        if (invalido) campo.setAttribute('aria-invalid', 'true');
        else campo.removeAttribute('aria-invalid');
    }

    [identificador, contrasena].forEach((campo) => {
        campo.addEventListener('input', () => {
            marcarInvalido(campo, false);
            limpiarMensaje();
        });
    });

    formulario.addEventListener('submit', (evento) => {
        // La pantalla es únicamente un prototipo: nunca enviar contraseñas.
        evento.preventDefault();
        const faltaIdentificador = !identificador.value.trim();
        const faltaContrasena = !contrasena.value;
        marcarInvalido(identificador, faltaIdentificador);
        marcarInvalido(contrasena, faltaContrasena);

        if (faltaIdentificador || faltaContrasena) {
            mostrarMensaje('Introduce tu correo o usuario y tu contraseña.', true);
            (faltaIdentificador ? identificador : contrasena).focus();
            return;
        }

        mostrarMensaje('El acceso todavía no está disponible: la autenticación se implementará en una fase posterior.');
    });

    recuperar?.addEventListener('click', () => {
        mostrarMensaje('La recuperación de contraseñas todavía no está implementada.');
    });
});
