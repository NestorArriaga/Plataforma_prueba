// src/scripts/login.js

import { supabase } from './supabase-client.js';

// Al cargar la página, asignamos el evento al formulario
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');

    if (!form) {
        console.error('No se encontró el formulario con ID #login-form');
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // CORREGIDOS para coincidir con el HTML actual
        const email = document.getElementById('login-usuario')?.value;
        const password = document.getElementById('login-password')?.value;

        if (!email || !password) {
            alert('Por favor, completa todos los campos');
            return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            alert('Error de autenticación: ' + error.message);
            return;
        }

        if (data?.user) {
            // Redirige al dashboard principal si el login fue exitoso
            window.location.href = '../index.html';
        }
    });
});