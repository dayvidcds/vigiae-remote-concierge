import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LinksConviteController } from './invitation-links.controller';
import { LinksConviteService } from './invitation-links.service';
import { InvitationLink, InvitationLinkSchema } from './schemas/invitation-link.schema';
import { Visitor, VisitorSchema } from '../visitors/schemas/visitor.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: InvitationLink.name, schema: InvitationLinkSchema },
        { name: Visitor.name, schema: VisitorSchema },
      ],
      'portal-cliente',
    ),
    AuthModule,
  ],
  controllers: [LinksConviteController],
  providers: [LinksConviteService],
  exports: [LinksConviteService],
})
export class LinksConviteModule {}
