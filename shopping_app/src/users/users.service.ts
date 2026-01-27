import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CartService } from 'src/cart/cart.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private cartService: CartService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.usersRepository.findOne({ where: { email: createUserDto.email } });
    if (existingUser) throw new BadRequestException('Email already in use');

    const salt = await bcrypt.genSalt(); 
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword, 
      provider: 'local', 
      role: UserRole.USER 
    });

    const savedUser = await this.usersRepository.save(user);
    try { await this.cartService.createForUser(savedUser); } 
    catch (e) { console.error("Failed to create cart", e); }
    return savedUser;
  }

  async findAll() {
    return this.usersRepository.find({ order: { id: 'ASC' } });
  }

  async findOne(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }
  
  async findOneById(id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User #${id} not found`);
    return user;
  }

  async updateProfile(id: number, attrs: Partial<User>) {
      const user = await this.findOneById(id);
      if (attrs.firstName) user.firstName = attrs.firstName;
      if (attrs.lastName) user.lastName = attrs.lastName;
      if (typeof attrs.defaultAddress === 'string') user.defaultAddress = attrs.defaultAddress;
      if (typeof attrs.defaultCity === 'string') user.defaultCity = attrs.defaultCity;
      if (typeof attrs.defaultPhone === 'string') user.defaultPhone = attrs.defaultPhone;
      return this.usersRepository.save(user);
  }

  // --- שינוי סיסמה ---
  async changePassword(id: number, currentPass: string, newPass: string) {
      console.log(`DEBUG SERVICE: Searching for User ID: ${id}`);

      // שימוש ב-QueryBuilder כדי לוודא שליפת סיסמה
      const user = await this.usersRepository.createQueryBuilder("user")
        .addSelect("user.password")
        .addSelect("user.provider")
        .where("user.id = :id", { id })
        .getOne();
      
      if (!user) {
          console.error(`DEBUG SERVICE: User ID ${id} NOT FOUND in DB`);
          throw new NotFoundException('User not found');
      }

      console.log(`DEBUG SERVICE: User found. Provider: ${user.provider}`);

      if (user.provider === 'google' || !user.password) {
          throw new BadRequestException('לא ניתן לשנות סיסמה למשתמשי Google');
      }

      // השוואה
      console.log('DEBUG SERVICE: Comparing passwords...');
      const isMatch = await bcrypt.compare(currentPass, user.password);
      
      if (!isMatch) {
          console.error('DEBUG SERVICE: Password mismatch!');
          throw new UnauthorizedException('סיסמה נוכחית שגויה');
      }

      console.log('DEBUG SERVICE: Passwords match. Hashing new password...');
      const salt = await bcrypt.genSalt();
      const newHash = await bcrypt.hash(newPass, salt);
      
      await this.usersRepository.update(id, { password: newHash });
      console.log('DEBUG SERVICE: Password updated successfully.');
      
      return { message: 'Password updated successfully' };
  }

  async updateRole(id: number, role: string) {
    return this.usersRepository.update(id, { role: role as any });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOneById(id);
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }
    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.findOneById(id);
    return this.usersRepository.remove(user);
  }

  async findOrCreateOAuthUser(profile: any) {
    const email = profile.email;
    let user = await this.usersRepository.findOne({ where: { email } });

    if (user) {
      if (profile.picture && user.picture !== profile.picture) {
        user.picture = profile.picture;
      }
      if (!user.googleId) {
        user.googleId = profile.id;
      }
       await this.usersRepository.save(user);
       const cart = await this.cartService.findCartByUserId(user.id);
       if (!cart) await this.cartService.createForUser(user);
      return user;
    }

    const newUser = this.usersRepository.create({
      email: email,
      firstName: profile.firstName, 
      lastName: profile.lastName,
      googleId: profile.id, 
      picture: profile.picture, 
      provider: 'google',   
      password: '',         
      role: UserRole.USER   
    });

    const savedUser = await this.usersRepository.save(newUser);
    await this.cartService.createForUser(savedUser);
    return savedUser;
  }
}