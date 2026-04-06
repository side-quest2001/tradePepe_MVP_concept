const SCALE = 100000000n;

function padFraction(value: string): string {
  return (value + "00000000").slice(0, 8);
}

export function decimalToScaledInteger(value: string): bigint {
  const normalized = value.trim();

  if (!/^-?\d+(\.\d+)?$/.test(normalized)) {
    throw new Error(`Invalid decimal value: ${value}`);
  }

  const sign = normalized.startsWith("-") ? -1n : 1n;
  const unsignedValue = normalized.replace("-", "");
  const [wholePart, fractionalPart = ""] = unsignedValue.split(".");

  return sign * (BigInt(wholePart) * SCALE + BigInt(padFraction(fractionalPart)));
}

export function scaledIntegerToDecimal(value: bigint): string {
  const sign = value < 0 ? "-" : "";
  const unsignedValue = value < 0 ? value * -1n : value;
  const wholePart = unsignedValue / SCALE;
  const fractionalPart = (unsignedValue % SCALE).toString().padStart(8, "0");

  return `${sign}${wholePart.toString()}.${fractionalPart}`;
}

export function addDecimalStrings(left: string, right: string): string {
  return scaledIntegerToDecimal(decimalToScaledInteger(left) + decimalToScaledInteger(right));
}

export function subtractDecimalStrings(left: string, right: string): string {
  return scaledIntegerToDecimal(decimalToScaledInteger(left) - decimalToScaledInteger(right));
}

export function compareDecimalStrings(left: string, right: string): number {
  const difference = decimalToScaledInteger(left) - decimalToScaledInteger(right);

  if (difference === 0n) {
    return 0;
  }

  return difference > 0n ? 1 : -1;
}

export function multiplyDecimalStrings(left: string, right: string): string {
  const result = (decimalToScaledInteger(left) * decimalToScaledInteger(right)) / SCALE;
  return scaledIntegerToDecimal(result);
}

export function divideDecimalStrings(left: string, right: string): string {
  const divisor = decimalToScaledInteger(right);

  if (divisor === 0n) {
    throw new Error("Cannot divide by zero");
  }

  const result = (decimalToScaledInteger(left) * SCALE) / divisor;
  return scaledIntegerToDecimal(result);
}

export function isZeroDecimal(value: string): boolean {
  return decimalToScaledInteger(value) === 0n;
}
