import { Allow, IsBoolean, IsDate, IsNotEmpty, IsOptional, IsString } from "class-validator"

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

    @IsOptional()
    additional?: string | Record<string, any>
}


export class NotificationFilter {
    @Allow()
    @IsBoolean()
    _where: boolean = true;

    @IsOptional()
    where: Record<string, any>
}