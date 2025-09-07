import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class ChatRoomsQueryDto {
  @ApiProperty({ example: 'Hello', required: false })
  @IsOptional()
  public readonly search: string;
}

export class LastMessage {
  @ApiProperty({ example: 'Hello Jane' })
  public readonly content: string;

  @ApiProperty({ example: '2025-09-05T10:15:30.000Z' })
  public readonly createdAt: Date;
}

export class ChatRoomResDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  public readonly id: string;

  @ApiProperty({ example: 'https://lh3.googleusercontent.com/a-/AOh14Gj2...' })
  public readonly picture: string;

  @ApiProperty({ example: 'Jane Doe' })
  public readonly displayName: string;

  @ApiProperty({ type: LastMessage })
  public readonly lastMessage: LastMessage | null;
}

export class CreateChatRoomReqDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  public readonly contactId: string;
}

export class DetailChatRoomParamsDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  public readonly id: string;
}

export class ChatDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  public readonly id: string;

  @ApiProperty({ example: 'Alice' })
  public readonly sender: string;

  @ApiProperty({ example: 'Hai, apa kabar?' })
  public readonly content: string;

  @ApiProperty({ example: '2025-09-07T09:30:00.000Z' })
  public readonly createdAt: Date;

  @ApiProperty({ example: false })
  public readonly isEdited: boolean;
}

export class DetailChatRoomResDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  public readonly id: string;

  @ApiProperty({ example: 'Bob Marley' })
  public readonly displayName: string;

  @ApiProperty({ example: 'https://example.com/bob.png' })
  public readonly picture: string;

  @ApiProperty({ example: 'Online' })
  public readonly status: string;

  @ApiProperty({ type: ChatDto, isArray: true })
  public readonly chats: ChatDto[];
}
