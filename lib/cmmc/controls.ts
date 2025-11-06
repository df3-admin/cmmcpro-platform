import cmmcData from '@/shared/cmmc-controls.json';
import type { CMMCData, CMMCControl } from '@/lib/types/cmmc';

export const CMMC_DATA = cmmcData as CMMCData;

export function getControlsByLevel(level: 1 | 2): CMMCControl[] {
  return CMMC_DATA.levels[level.toString()].controls;
}

export function getControlById(controlId: string, level: 1 | 2): CMMCControl | undefined {
  const controls = getControlsByLevel(level);
  return controls.find(c => c.id === controlId);
}

export function getControlsByDomain(level: 1 | 2, domain: string): CMMCControl[] {
  const controls = getControlsByLevel(level);
  return controls.filter(c => c.domain === domain);
}

export function getAllDomains(): string[] {
  return CMMC_DATA.domains;
}

export function getDomainsByLevel(level: 1 | 2): string[] {
  const controls = getControlsByLevel(level);
  const domains = new Set(controls.map(c => c.domain));
  return Array.from(domains);
}

export function getTotalControlsForLevel(level: 1 | 2): number {
  return CMMC_DATA.levels[level.toString()].totalControls;
}

