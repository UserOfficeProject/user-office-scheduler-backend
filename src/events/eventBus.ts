type EventHandler<T> = (event: T) => Promise<void>;

export class EventBus<T extends { type: string }> {
  constructor(private handlers: Promise<EventHandler<T>>[]) {}

  public async publish(event: T) {
    for (let i = 0; i < this.handlers.length; i++) {
      const handler = await this.handlers[i];
      try {
        await handler(event);
      } catch (err) {
        // Something happened, log it and continue
        console.error(`Error handling ${event.type} with handler ${i}`, err);
      }
    }
  }
}
