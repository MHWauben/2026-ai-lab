import { ReportReason } from '@domain/enums/ReportReason.enum';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, Matches, MaxLength, ValidateNested } from 'class-validator';

export class ReportLocation {
	@IsNumber({}, { message: 'Latitude must be a number' })
	lat!: number;

	@IsNumber({}, { message: 'Longitude must be a number' })
	lng!: number;
}

export class VehicleReport {
	@IsString()
	@Matches(/^[A-Z]{2}\d{2}\s?[A-Z]{3}$/, { message: 'Plate must be a valid UK vehicle registration' })
	plate!: string;

	@ValidateNested()
	@Type(() => ReportLocation)
	location!: ReportLocation;

	@IsEnum(ReportReason, { message: 'Reason must be one of: NO_OPERATOR, NO_REGISTRATION, WRONG_ZONE, OTHER' })
	reason!: ReportReason;

	@IsOptional()
	@IsString()
	@MaxLength(500)
	description?: string;
}
