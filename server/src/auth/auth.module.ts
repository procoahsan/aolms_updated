import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard } from './jwt-auth.guard';
import { SupabaseModule } from '../supabase/supabase.module';

@Global()
@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    SupabaseModule,
  ],
  providers: [JwtAuthGuard],
  // Feature controllers resolve the globally provided guard in their own module
  // context, so its dependencies must be exported as well.
  exports: [JwtModule, SupabaseModule, JwtAuthGuard],
})
export class AuthModule {}
