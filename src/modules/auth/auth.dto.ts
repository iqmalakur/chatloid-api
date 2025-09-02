import { ApiProperty } from '@nestjs/swagger';

export class GoogleAuthCallbackParamDto {
  @ApiProperty({
    example: '4/P7q7W91a-oMsCeLvIaQm6bTrgtp7',
  })
  public readonly code?: string;

  @ApiProperty({
    example: 'access_denied',
  })
  public readonly error?: string;
}
