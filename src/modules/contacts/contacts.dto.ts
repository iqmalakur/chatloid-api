import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class GetContactsParamDto {
  @ApiProperty({ example: 'john' })
  @IsOptional()
  public readonly search?: string;
}

export class ContactsResDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  public readonly id: string;

  @ApiProperty({ example: 'John Doe' })
  public readonly name: string;

  @ApiProperty({ example: 'https://lh3.googleusercontent.com/a-/AOh14Gj2...' })
  public readonly picture: string;
}
