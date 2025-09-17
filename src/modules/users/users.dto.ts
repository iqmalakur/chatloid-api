import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UserInfoResDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  public readonly id: string;

  @ApiProperty({
    example: 'johndoe@gmail.com',
  })
  public readonly email: string;

  @ApiProperty({
    example: 'johndoe',
  })
  public readonly username: string;

  @ApiProperty({
    example: 'John Doe',
  })
  public readonly name: string;

  @ApiProperty({
    example: 'https://lh3.googleusercontent.com/a-/AOh14GhRkq9dXyZb12345=s96-c',
  })
  public readonly picture: string;
}

export class UserUpdateReqDto {
  @ApiProperty({
    example: 'johndoe',
  })
  @IsOptional()
  @IsString()
  public readonly username?: string;

  @ApiProperty({
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  public readonly name?: string;

  @ApiProperty({
    example: 'https://lh3.googleusercontent.com/a-/AOh14GhRkq9dXyZb12345=s96-c',
  })
  @IsOptional()
  @IsUrl()
  public readonly picture?: string;
}
