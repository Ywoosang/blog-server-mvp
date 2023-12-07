import * as faker from 'faker';
import { UsersRole } from 'src/users/users-role.enum';
import { UsersService } from 'src/users/users.service';

class UserSeeder {
    constructor(private usersService: UsersService) {}

    async createTestUser(role: UsersRole) {
        const user = {
            email: faker.internet.email(),
            userLoginId: faker.random.alphaNumeric(faker.datatype.number({ min: 4, max: 20 })),
            nickname: faker.name.findName(),
            password: 'test@1234',
            role
        };

        return this.usersService.create(user);
    }
}

export default UserSeeder;
