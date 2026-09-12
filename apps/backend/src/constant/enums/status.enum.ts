export enum Status {
  NEW = "NEW",
  ACTIVE = "ACTIVE",
  PENDING = "PENDING",
  INACTIVE = "INACTIVE",
  EXPIRED = "EXPIRED",
}

export enum ActiveInactiveStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum SubscriptionStatus {
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  PENDING = "PENDING",
}

export enum AppointmentStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
  NO_SHOW = "NO_SHOW",
  RESCHEDULED = "RESCHEDULED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export enum PaymentMethod {
  SSL_COMMERZ = "sslcommerz",
  BKASH = "bkash",
  NAGAD = "nagad",
  ROCKET = "rocket",
  CASH = "CASH",
}

export enum QueueStatus {
  WAITING = "WAITING",
  CALLED = "CALLED",
  IN_CONSULTATION = "IN_CONSULTATION",
  COMPLETED = "COMPLETED",
  SKIPPED = "SKIPPED",
  CANCELLED = "CANCELLED",
}
