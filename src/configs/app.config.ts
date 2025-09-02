import { config } from 'dotenv';

config();

export const PORT = parseInt(process.env.PORT || '3000');
export const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
