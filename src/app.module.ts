import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AiModule } from './ai/ai.module';
import { AiService } from './ai/ai.service';
import { DomainMiddleware } from './common/middleware/domain.middleware';
import { WebsocketModule } from './common/socket/websocket.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuthModule } from './modules/auth/auth.module';
import { SeedModule } from './modules/seeders/seeders.module';
import { PermissionModule } from './modules/permission/permission.module';
import { RoleModule } from './modules/role/role.module';
import { FinanceModule } from './modules/finance/finance.module';
import { KanbanModule } from './modules/kanban/kanban.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AiModule,
    WebsocketModule,
    NotificationsModule,
    AuthModule,
    SeedModule,
    PermissionModule,
    RoleModule,
    FinanceModule,
    KanbanModule,
  ],
  providers: [AiService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(DomainMiddleware)
      .forRoutes('*');
  }
}