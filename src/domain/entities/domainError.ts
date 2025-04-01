export class DomainError extends Error {
    constructor(
      public readonly code: string,
      public readonly message: string
    ) {
      super(message)
      Object.setPrototypeOf(this, new.target.prototype)
    }
  }