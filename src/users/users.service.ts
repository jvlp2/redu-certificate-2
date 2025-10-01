import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientService } from 'src/client/client.service';
import { ReduApiService } from 'src/redu-api/redu-api.service';
import { User } from 'src/users/entities/user.entity';
import { FindOneOptions, Repository } from 'typeorm';

type ReduUser = {
  id: number;
  name: string;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly reduApi: ReduApiService,
    private readonly clientService: ClientService,
  ) {}

  async create(reduUser?: ReduUser) {
    const client = await this.clientService.getClient();
    const { id, name } = reduUser ?? (await this.reduUser());
    const user = this.userRepository.create({
      client,
      reduUserId: id,
      name,
    });
    return await this.userRepository.save(user);
  }

  async findOneBy(options: FindOneOptions<User>) {
    const user = await this.userRepository.findOne(options);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findOrCreate(reduUser: ReduUser) {
    try {
      return await this.findOneBy({ where: { reduUserId: reduUser.id } });
    } catch (error) {
      if (!(error instanceof NotFoundException)) throw error;
      return this.create(reduUser);
    }
  }

  async reduUser() {
    const url = this.reduApi.buildUrl('/v2/certificates/me');
    return this.reduApi.get<ReduUser>(url);
  }
}
