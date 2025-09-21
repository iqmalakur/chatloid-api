import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsUUID } from 'class-validator';

export class ContactRequestsResDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  public readonly id: string;

  @ApiProperty({ example: 'John Doe' })
  public readonly name: string;

  @ApiProperty({ example: 'johndoe' })
  public readonly username: string;

  @ApiProperty({ example: '2025-09-05T10:15:30.000Z' })
  public readonly createdAt: Date;

  @ApiProperty({ example: false })
  public readonly isAccepted: boolean;
}

export class ContactRequestsParamDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  public readonly targetId: string;
}

export class ContactRequestsBodyDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  public readonly accepted: boolean;
}

export class UpdateContactRequestsResDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  public readonly id: string;

  @ApiProperty({ example: 'johndoe' })
  public readonly username: string;

  @ApiProperty({ example: true })
  public readonly accepted: boolean;
}
