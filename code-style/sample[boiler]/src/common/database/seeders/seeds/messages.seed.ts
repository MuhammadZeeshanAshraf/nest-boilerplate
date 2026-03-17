import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { join } from 'path';
import { In } from 'typeorm';
import { Message } from '../../../../modules/message/entities/message.entity';
import dataSource from '../../dbConfig';

@Injectable()
export class MessageSeed {
  async seed() {
    const json = JSON.parse(
      fs.readFileSync(join(__dirname, '../store/messages.json'), 'utf-8'),
    );
    const messagesFromJson = json.map((msg) => ({
      message: msg.message,
      tone: msg.tone,
    }));
    const messagesRepository = dataSource.getRepository(Message);
    const messages = messagesFromJson.map((msg) => msg.message);
    const existingMessages = await messagesRepository.find({
      where: {
        message: In(messages),
      },
    });
    const newMessages = messagesFromJson.filter(
      (message) =>
        !existingMessages.some(
          (existingMessage) => existingMessage.message === message.message,
        ),
    );
    const oldMessages = messagesFromJson.filter((message) =>
      existingMessages.some(
        (existingMessage) => existingMessage.message === message.message,
      ),
    );
    if (newMessages.length > 0) {
      const Messages = newMessages.map((val) => {
        return messagesRepository.create(val);
      });
      await messagesRepository.save(Messages);
    }
    const updates = oldMessages.map((message) => {
      return messagesRepository.update({ message: message.message }, message);
    });
    await Promise.all(updates);
  }
}
