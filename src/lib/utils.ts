import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Génère un hashblock Hedera simulé pour un signalement
 * Format: 0.0.xxxxxx@timestamp (format Hedera Transaction ID)
 */
export function generateHederaHash(reportId: string, timestamp?: string): string {
  const ts = timestamp || Date.now().toString();
  // Générer un hash simulé basé sur l'ID et le timestamp
  const hash = Array.from({ length: 6 }, () => 
    Math.floor(Math.random() * 10)
  ).join('');
  return `0.0.${hash}@${ts}`;
}
