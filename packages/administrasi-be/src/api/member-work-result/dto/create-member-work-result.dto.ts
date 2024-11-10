import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { Allow, IsArray, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

class ActivityDto {
    @IsNotEmpty()
    @IsString()
    plot: string;

    @IsNotEmpty()
    @Transform(({ value }) => typeof value == "string" ? +value : value)
    @IsNumber()
    wide: number;

    @IsNotEmpty()
    @Transform(({ value }) => typeof value == "string" ? +value : value)
    @IsNumber()
    price: number;

    @IsNotEmpty()
    @IsString()
    activityId: string;

    @IsOptional()
    @IsString()
    ql: string;

    @IsNotEmpty()
    @Transform(({ value }) => typeof value == "string" ? +value : value)
    @IsNumber()
    subTotal: number;

    @IsOptional()
    id: string | null
}

class BonDto {
    @IsOptional()
    @IsString()
    note: string;

    @IsOptional()
    @Transform(({ value }) => typeof value == "string" ? +value : value)
    @IsNumber()
    total: number;
}



export class CreateMemberWorkResultDto {
    @ApiProperty({
        example: "1"
    })
    @IsNotEmpty()
    @IsString()
    employeeId: string;

    @ApiProperty({
        example: "1"
    })
    @Transform(() => undefined)
    @Allow()
    companyId: string;

    @ApiProperty({
        example: new Date()
    })
    @IsNotEmpty()
    date: string;

    @ApiProperty({
        isArray: true,
        type: ActivityDto
    })
    @ValidateNested({ each: true })
    @IsArray()
    @Type(() => ActivityDto)
    activities: ActivityDto[]

    @ApiProperty({
        isArray: true,
        type: BonDto
    })
    @ValidateNested({ each: true })
    @IsArray()
    @Type(() => BonDto)
    bon: BonDto[]
}

