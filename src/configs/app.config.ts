import { config } from 'dotenv';

config();

export const PORT = parseInt(process.env.PORT || '3000');
export const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
export const CLIENT_AUTHORIZED_URL =
  process.env.CLIENT_AUTHORIZED_URL || 'http://localhost:3001/login';
export const DEFAULT_PICTURE_URL = process.env.DEFAULT_PICTURE_URL || '';
export const SECRET_KEY = process.env.SECRET_KEY || '';
