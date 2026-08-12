import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';

// NOTE: By the time NestJS DI runs JwtStrategy's constructor, ConfigModule
// has already called dotenv.config() and populated process.env — so reading
// process.env here is safe and matches the secret used in JwtModule.registerAsync.
const JWT_SECRET =
  process.env.JWT_SECRET || 'super_secret_ecommerce_jwt_key_2026';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    const user = await this.userModel.findById(payload.sub).select('-password');
    if (!user) {
      throw new UnauthorizedException('User not found or session expired');
    }
    return user;
  }
}
