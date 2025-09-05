export type ContactRequestUserSelection = {
  id: string;
  name: string;
  username: string;
  createdAt: Date;
};

export type ContactRequestSelection = {
  userOne: ContactRequestUserSelection;
};
