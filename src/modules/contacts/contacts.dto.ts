import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class GetContactsParamDto {
  @ApiProperty({ example: 'john', required: false })
  @IsOptional()
  public readonly search?: string;
}

export class ContactUser {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  public readonly id: string;

  @ApiProperty({ example: 'John Doe' })
  public readonly name: string;

  @ApiProperty({ example: 'https://lh3.googleusercontent.com/a-/AOh14Gj2...' })
  public readonly picture: string;
}

export class ContactsResDto {
  @ApiProperty({ example: 2 })
  public readonly total: number;

  @ApiProperty({ isArray: true, type: ContactUser })
  public readonly contacts: ContactUser[];
}

export class AddContactsReqDto {
  @ApiProperty({ example: 'johndoe' })
  @IsNotEmpty()
  public readonly username: string;
}

export class AddContactsResDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  public readonly id: string;

  @ApiProperty({ example: 'johndoe' })
  public readonly username: string;

  @ApiProperty({ example: false })
  public readonly accepted: boolean;
}
