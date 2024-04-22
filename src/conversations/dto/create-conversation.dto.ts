export class CreateConversationDto {
  name?: string;
  users: string[];
  data?: Express.Multer.File;
}
