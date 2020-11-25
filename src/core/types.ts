export type BoardType = Int8Array[];
export type SegmentType = [number, number] | [number, number, number, number];
export type MoveType = SegmentType[];
export type TreeType = { [key: string]: TreeType };
export type FormationType = [number, number, number][];
export type ScoresType = [FormationType, number][][][];
