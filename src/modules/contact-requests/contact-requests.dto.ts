import { ApiProperty } from '@nestjs/swagger';

export class ContactRequestsResDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  public readonly id: string;

  @ApiProperty({ example: 'John Doe' })
  public readonly name: string;

  @ApiProperty({ example: 'johndoe' })
  public readonly username: string;

  @ApiProperty({ example: '2025-09-05T10:15:30.000Z' })
  public readonly createdAt: Date;
}
