export type UserSelection = {
  email: string;
  name: string;
  username: string;
  picture: string;
};

export type UserInsert = UserSelection & {
  googleId: string;
};
