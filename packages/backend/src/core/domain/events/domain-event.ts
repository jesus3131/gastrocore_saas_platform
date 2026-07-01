export interface DomainEvent {
  readonly eventName: string
  readonly aggregateId: string
  readonly aggregateType: string
  readonly occurredOn: Date
}
