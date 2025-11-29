export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class QuotaExceededError extends AppError {
  constructor(message: string = 'Quota exceeded') {
    super(403, message, 'QUOTA_EXCEEDED');
  }
}

export class SubscriptionRequiredError extends AppError {
  constructor(message: string = 'Valid subscription required') {
    super(403, message, 'SUBSCRIPTION_REQUIRED');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(404, message, 'NOT_FOUND');
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super(400, message, 'VALIDATION_ERROR');
  }
}
