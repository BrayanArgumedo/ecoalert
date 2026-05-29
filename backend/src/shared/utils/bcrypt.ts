// src/shared/utils/bcrypt.ts
// Funciones para el manejo seguro de contraseñas usando bcrypt.
// Las contraseñas nunca se almacenan en texto plano — siempre se hashean.

import bcrypt from 'bcryptjs';
import { config } from '../../config';

/**
 * Genera el hash seguro de una contraseña en texto plano.
 * El número de rondas (saltRounds) determina el costo computacional:
 * más rondas = más seguro pero más lento. Se configura en config.bcrypt.saltRounds (12).
 *
 * @param password - Contraseña en texto plano ingresada por el usuario
 * @returns Hash bcrypt listo para guardar en la base de datos
 */
export const hashPassword = (password: string): Promise<string> => {
  return bcrypt.hash(password, config.bcrypt.saltRounds);
};

/**
 * Compara una contraseña en texto plano con su hash almacenado.
 * Usada en login y al verificar la contraseña actual antes de cambiarla.
 *
 * @param password - Contraseña ingresada por el usuario
 * @param hash     - Hash almacenado en la base de datos
 * @returns true si coinciden, false si no
 */
export const comparePassword = (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
