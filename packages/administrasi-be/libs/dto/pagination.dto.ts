import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { Allow } from "class-validator";

export class PaginationDto {
    @ApiProperty({ example: 1 })
    @Allow()
    @Transform(({ value }) => typeof value == "string" ? +value : value)
    page?: number = 1;

    @ApiProperty({ example: 10 })
    @Allow()
    @Transform(({ value }) => typeof value == "string" ? +value : value)
    limit?: number = 10;

    @ApiProperty({ example: null })
    @Allow()
    @Transform(() => null)
    search?: string;

    @ApiProperty({ example: { id: 'asc' } })
    @Allow()
    @Transform(({ value }) => typeof value != "object" ? {} : value)
    order: object

    @Allow()
    where: any
}