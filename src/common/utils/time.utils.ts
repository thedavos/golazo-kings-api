export function parseTimeToMs(time: string): number {
  const regex = /^(\d+)([smhd])$/;
  const match = time.match(regex);

  if (!match) {
    throw new Error(
      'Invalid time format. Use format: number + s|m|h|d (e.g., "30s", "15m", "12h", "7d")',
    );
  }

  const [, value, unit] = match;
  const num = parseInt(value, 10);

  switch (unit) {
    case 's':
      return num * 1000;
    case 'm':
      return num * 60 * 1000;
    case 'h':
      return num * 60 * 60 * 1000;
    case 'd':
      return num * 24 * 60 * 60 * 1000;
    default:
      return num * 1000;
  }
}

export function parseTimeToSeconds(time: string): number {
  return Math.floor(parseTimeToMs(time) / 1000);
}
