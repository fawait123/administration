import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsNotEmpty, IsString } from "class-validator"

export class CreateCompanyDto {
    @ApiProperty({
        example: "Lentera"
    })
    @IsNotEmpty()
    @IsString()
    name: string

    @ApiProperty({
        example: "Jl Adisucipto"
    })
    @IsNotEmpty()
    @IsString()
    address: string

    @ApiProperty({
        example: "lentera@mail.com"
    })
    @IsNotEmpty()
    @IsEmail()
    email: string

    @ApiProperty({
        example: "08792372323"
    })
    @IsNotEmpty()
    phone: string
}
