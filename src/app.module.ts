import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import 'dotenv/config';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.URL || 'mongodb://localhost:27017', {
      dbName: 'Whatsup_db',
    }),
    UsersModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
