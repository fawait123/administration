import { IsDate, IsNotEmpty, IsString } from "class-validator"

export class PushNotificationDto {
    @IsNotEmpty()
    @IsString()
    title: string

    @IsNotEmpty()
    @IsString()
    body: string

    @IsNotEmpty()
    @IsDate()
    date: Date

    @IsNotEmpty()
    @IsString()
    companyId: string;
}