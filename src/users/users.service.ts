import { Injectable } from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "./user.entity";
import {Repository} from "typeorm";
import {UpdateUserDto} from "./dto/update-user.dto";

@Injectable()
export class UsersService {
    constructor(
       @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {}

    findByEmail(email: string) {
        return this.usersRepository.findOne({ where: { email } })
    }

    create(email: string, password: string) {
        const user = this.usersRepository.create({ email, password })
        return this.usersRepository.save(user)
    }

    findMe(id: number) {
        return this.usersRepository.findOne({ where: { id: id } })
    }

    async updateMe(id: number, body: UpdateUserDto) {
        const user = await this.usersRepository.findOne({ where: { id: id } })
        if (!user) return null;
        return this.usersRepository.update(id, body)
    }

    async updatePassword(id: number, hashedPassword: string) {
        return this.usersRepository.update(id, { password: hashedPassword })
    }
}
