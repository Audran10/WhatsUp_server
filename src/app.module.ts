import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { ConversationsModule } from './conversations/conversations.module';
import 'dotenv/config';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.URL || 'mongodb://localhost:27017', {
      dbName: 'Whatsup_db',
    }),
    UsersModule,
    ConversationsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
