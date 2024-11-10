import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { Allow, IsNotEmpty, IsString } from "class-validator";

export class CreateEmployeeDto {
    @ApiProperty({
        example: "Johan"
    })
    @IsNotEmpty()
    @IsString()
    name: string

    @Allow()
    @Transform(() => undefined)
    companyId: string
}
