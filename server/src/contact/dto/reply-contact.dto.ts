import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ReplyContactDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(3000)
  reply: string;
}
