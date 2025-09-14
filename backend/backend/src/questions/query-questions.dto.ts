import { IsOptional, IsString } from 'class-validator';

export class QueryQuestionsDto {
  @IsOptional() @IsString() language?: string;
  @IsOptional() @IsString() difficulty?: string;
  @IsOptional() @IsString() tag?: string;
  @IsOptional() @IsString() q?: string; // text search
  @IsOptional() page?: string;
  @IsOptional() pageSize?: string;
}
