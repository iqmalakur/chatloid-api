export class SendMessageDto {
  public readonly chatRoomId: string;
  public readonly content: string;
}

export class EditMessageDto {
  public readonly id: string;
  public readonly content: string;
}

export class NewMessageDto {
  public readonly id: string;
  public readonly chatRoomId: string;
  public readonly senderId: string;
  public readonly receiverId: string;
  public readonly content: string;
  public readonly timestamp: Date;
  public readonly isEdited: boolean;
  public readonly isDeleted: boolean;
}
