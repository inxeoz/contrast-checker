export interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type CheckType = 'text' | 'border';

export interface ContrastResult {
  selector: string;
  tag: string;
  text: string;
  foreground: string;
  background: string;
  contrastRatio: number;
  wcagAA: 'pass' | 'fail';
  wcagAAA: 'pass' | 'fail';
  checkType: CheckType;
  isLargeText: boolean;
}

export interface ExportData {
  url: string;
  region: Region;
  timestamp: string;
  results: ContrastResult[];
}
