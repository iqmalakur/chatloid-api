import { sign } from 'jsonwebtoken';
import { SECRET_KEY } from 'src/configs/app.config';

export const makeJwt = (userId: string): string => {
  return sign({ sub: userId }, SECRET_KEY, {
    expiresIn: '1h',
  });
};
