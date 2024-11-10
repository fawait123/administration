import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString } from "class-validator"

export class AuthDto {
    @ApiProperty({
        example: "johndo"
    })
    @IsNotEmpty()
    @IsString()
    username: string

    @ApiProperty({
        example: "123@Password"
    })
    @IsNotEmpty()
    @IsString()
    password: string
}
