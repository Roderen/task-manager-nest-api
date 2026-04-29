import {IsNotEmpty} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class ChangePasswordDto {
    @ApiProperty()
    @IsNotEmpty()
    newPassword: string;
}