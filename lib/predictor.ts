import rawRows from '@/data/predictor-data.json';

type DatasetRow = { mark: number; rank: number; from: number; to: number };

export type Prediction = {
  enteredScore: number;
  equivalentLegacyScore: number;
  predictedRank: number;
  rankFrom: number;
  rankTo: number;
};

const rows = (rawRows as DatasetRow[]).sort((a, b) => a.mark - b.mark);
const NEW_MAX = 720;
const DATASET_MAX = 800;

const round = (value: number) => Math.max(1, Math.round(value));
const lerp = (a: number, b: number, ratio: number) => a + (b - a) * ratio;

export function validateScore(value: string): number {
  if (value.trim() === '') throw new Error('Enter your NEET PG score.');
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) throw new Error('Enter a whole-number score.');
  if (parsed < 0 || parsed > NEW_MAX) throw new Error('Score must be between 0 and 720.');
  return parsed;
}

export function predictRank(enteredScore: number): Prediction {
  const legacyScore = (enteredScore / NEW_MAX) * DATASET_MAX;

  let upperIndex = rows.findIndex((row) => row.mark >= legacyScore);
  if (upperIndex < 0) upperIndex = rows.length - 1;
  const lowerIndex = Math.max(0, upperIndex - 1);
  const lower = rows[lowerIndex];
  const upper = rows[upperIndex];
  const span = upper.mark - lower.mark;
  const ratio = span === 0 ? 0 : (legacyScore - lower.mark) / span;

  return {
    enteredScore,
    equivalentLegacyScore: Math.round(legacyScore * 10) / 10,
    predictedRank: round(lerp(lower.rank, upper.rank, ratio)),
    rankFrom: round(lerp(lower.from, upper.from, ratio)),
    rankTo: round(lerp(lower.to, upper.to, ratio)),
  };
}
