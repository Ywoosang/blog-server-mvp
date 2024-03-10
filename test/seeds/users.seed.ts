import * as faker from 'faker';
import { UsersRole } from 'src/users/users-role.enum';
import { UsersService } from 'src/users/users.service';

class UserSeeder {
    constructor(private readonly usersService: UsersService) { }

    async createTestUser(email: string, role: UsersRole) {
        const user = {
            email,
            userId: faker.random.alphaNumeric(faker.datatype.number({ min: 4, max: 20 })),
            nickname: faker.name.findName(),
            role,
        };

        return this.usersService.create(user);
    }
}

export default UserSeeder;
