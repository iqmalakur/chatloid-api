export type Contact = {
  id: string;
  name: string;
  picture: string;
};

export type ContactSelection = {
  userOne: Contact;
  userTwo: Contact;
};

export type AddContactSelection = {
  userOneId: string;
  userTwoId: string;
  isAccepted: boolean;
};
