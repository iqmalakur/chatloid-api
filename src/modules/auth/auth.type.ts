export type UserSelection = {
  id: string;
};

export type GoogleUser = {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  picture?: string | null;
};

export type UserInsert = {
  googleId: string;
  email: string;
  name: string;
  username: string;
  picture: string;
};
