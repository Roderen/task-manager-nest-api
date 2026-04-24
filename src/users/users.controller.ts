import {Body, Controller, Get, Put, Request, UseGuards} from "@nestjs/common";
import {UsersService} from "./users.service";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {UpdateUserDto} from "./dto/update-user.dto";

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getMe(@Request() req) {
        return this.usersService.findMe(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Put('me')
    updateMe(@Body() body: UpdateUserDto, @Request() req) {
        return this.usersService.updateMe(req.user.id, body)
    }
}