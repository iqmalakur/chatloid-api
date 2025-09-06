import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class ChatRoomsQueryDto {
  @ApiProperty({ example: 'Hello' })
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

export class ChatsResDto {
  @ApiProperty({ example: 'Hello' })
  @IsOptional()
  public readonly search: string;
}
