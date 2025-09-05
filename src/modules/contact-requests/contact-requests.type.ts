export type ContactRequestUserSelection = {
  id: string;
  name: string;
  username: string;
  createdAt: Date;
};

export type ContactRequestSelection = {
  userOne: ContactRequestUserSelection;
};

export type UpdateContactRequestUserSelection = {
  id: string;
  username: string;
};

export type UpdateContactRequestSelection = {
  userOne: UpdateContactRequestUserSelection;
  isAccepted: boolean;
};
