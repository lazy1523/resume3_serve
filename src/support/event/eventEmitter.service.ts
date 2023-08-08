import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter } from 'events';

@Injectable()
export class EventEmitterService {
    private logger = new Logger(EventEmitterService.name);
    public emitter: EventEmitter;
    public addressData = new Map<string, any>();

    constructor() {
        this.emitter = new EventEmitter();
    }
}
