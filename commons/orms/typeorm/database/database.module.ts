import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DatabaseModule as DatabaseConfigModule } from "./index";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfigModule,
    }),
  ],
})
export class DatabaseModule {}
