import { UsersService } from 'src/users/users.service';

class UserSeeder {
    constructor(private usersService: UsersService) {}

    async createTestUsers(count: number) {        
        const userPromises = Array.from({ length: count }, async (_, i) => {
            const user = {
                email: `user${i+1}@example.com`,
                userLoginId: `user${i+1}`,
                nickname: `테스트사용자${i+1}`,
                password: `password${i+1}`
            }
            return this.usersService.create(user);
        });
        return Promise.all(userPromises);
    }

    async createTestUser(id: number) {
        const user = {
            email: `user${id}@example.com`,
            userLoginId: `user${id}`,
            nickname: `테스트사용자${id}`,
            password: `password${id}`
        }
        return this.usersService.create(user);
    }

    async getTestUser(id: number) {
        return this.usersService.findOne({
            where: {
                id
            }
        });
    }
}

export default UserSeeder;