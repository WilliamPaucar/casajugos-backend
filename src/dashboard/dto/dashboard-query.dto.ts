import { IsDateString, IsOptional, IsInt, Min } from 'class-validator';

export class DashboardQueryDto {
  @IsDateString()
  from: string;

  @IsDateString()
  to: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  top?: number = 5;
}
