import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsNotEmpty, IsString } from 'class-validator';

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

export class GoogleVerificationBodyDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJSUzI1NiIsImtpZCI6IjE2Z...dQsswA.eyJpc3MiOiJodHRwczovL2FjY...jAiwQ.QJ5o-9F...',
  })
  @IsNotEmpty()
  @IsJWT()
  public readonly idToken: string;
}

export class GoogleAuthResBody {
  public readonly token: string;
}
