import {IsNotEmpty} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class ChangePasswordConfirmDto {
    @ApiProperty()
    @IsNotEmpty()
    code: string;
}