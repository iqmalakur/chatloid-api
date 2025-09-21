export type ContactRequestUserSelection = {
  id: string;
  name: string;
  username: string;
};

export type ContactRequestSelection = {
  userOne: ContactRequestUserSelection;
  isAccepted: boolean;
  createdAt: Date;
};

export type UpdateContactRequestUserSelection = {
  id: string;
  username: string;
};

export type UpdateContactRequestSelection = {
  userOne: UpdateContactRequestUserSelection;
  isAccepted: boolean;
};
