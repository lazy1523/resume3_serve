import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';

@Injectable()
export class EventEmitterService {
  public emitter: EventEmitter;
  public addressData = new Map<string, any>();

  constructor() {
    this.emitter = new EventEmitter();
  }
}
