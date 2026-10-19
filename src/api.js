const API_ROOT = "/api";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function api(path, { token, ...options } = {}) {
  const headers = new Headers(options.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
    options.body = JSON.stringify(options.body);
  }

  let response;
  try {
    response = await fetch(`${API_ROOT}${path}`, { ...options, headers });
  } catch {
    throw new ApiError(
      "Cannot reach the expense service. Check that the API is running.",
      0,
    );
  }

  const contentType = response.headers.get("content-type") || "";
  const result = contentType.includes("application/json")
    ? await response.json()
    : null;
  if (!response.ok) {
    throw new ApiError(
      result?.error || "Something went wrong. Please try again.",
      response.status,
    );
  }
  return result;
}

export function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(String(value ?? "0.00"));
}

export function toPaise(value) {
  const match = /^(-?)(\d+)(?:\.(\d{1,2}))?$/.exec(String(value ?? ""));
  if (!match) return null;
  const paise =
    BigInt(match[2]) * 100n + BigInt((match[3] || "").padEnd(2, "0"));
  return match[1] ? -paise : paise;
}

export function addMoney(left, right) {
  const leftPaise = toPaise(left);
  const rightPaise = toPaise(right);
  if (leftPaise === null || rightPaise === null) return "0.00";
  const total = leftPaise + rightPaise;
  const sign = total < 0n ? "-" : "";
  const absolute = total < 0n ? -total : total;
  return `${sign}${absolute / 100n}.${String(absolute % 100n).padStart(2, "0")}`;
}

export function shortDate(value, options = {}) {
  if (!value) return "Not recorded";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    ...(options.withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(new Date(value));
}

export function roleLabel(role) {
  return (
    { employee: "Employee", manager: "Manager", accounts: "Accounts" }[role] ||
    role
  );
}

export function statusLabel(status) {
  return (
    {
      pending_manager: "Waiting for manager",
      pending_accounts: "Waiting for accounts",
      approved: "Approved",
      rejected: "Rejected",
      cancelled: "Cancelled",
    }[status] || status
  );
}

export function initials(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
