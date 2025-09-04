import { ApiProperty } from '@nestjs/swagger';

export class UserInfoResDto {
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
