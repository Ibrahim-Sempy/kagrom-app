export function parseScoreInput(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function calculateAverage(theory: number, practical: number) {
  return (theory + practical) / 2;
}

export function getMentionFromAverage(average: number) {
  if (average >= 16) {
    return "Tres bien";
  }

  if (average >= 14) {
    return "Bien";
  }

  if (average >= 12) {
    return "Assez bien";
  }

  if (average >= 10) {
    return "Passable";
  }

  if (average > 0) {
    return "Insuffisant";
  }

  return "-";
}

export function formatScore(value: number) {
  return value > 0 ? value.toFixed(2) : "-";
}
