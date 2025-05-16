// src/scripts/register.js

import { supabase } from './supabase-client.js';

// PARTE 0: Verificación de sesión activa
(async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (session && session.user) {
        // Si ya hay sesión activa, redirige al dashboard
        window.location.href = '../index.html';
    }
})();

// Espera a que cargue el DOM antes de asignar eventos
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register-form');

    if (!form) {
        console.error('No se encontró el formulario de registro.');
        return;
    }

    // Evento al enviar formulario
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Obtener valores de los inputs
        const name = document.getElementById('name')?.value.trim();
        const email = document.getElementById('email')?.value.trim();
        const password = document.getElementById('password')?.value;
        const confirmPassword = document.getElementById('confirm-password')?.value;

        // Validaciones básicas
        if (!name || !email || !password || !confirmPassword) {
            alert('Por favor completa todos los campos.');
            return;
        }

        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden.');
            return;
        }

        try {
            // Registro en Supabase Auth
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { name }
                }
            });

            if (error) {
                alert('Error al registrar: ' + error.message);
                return;
            }

            if (data?.user) {
                form.reset();
                mostrarModalExito();
            }
        } catch (err) {
            console.error('Error inesperado:', err);
            alert('Error inesperado durante el registro.');
        }
    });
});

function mostrarModalExito() {
    const modal = document.getElementById('modal-registro-exitoso');
    if (modal) {
        modal.classList.remove('hidden');
    }
    setTimeout(() => {
        window.location.href = './authentication-login.html';
    }, 4000);
}

function ocultarModalExito() {
    const modal = document.getElementById('modal-registro-exitoso');
    if (modal) {
        modal.classList.add('hidden');
        window.location.href = './authentication-login.html';
    }
}
