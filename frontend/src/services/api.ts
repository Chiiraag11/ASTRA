/**
 * ASTRA API Service
 * Connects frontend to the FastAPI backend.
 */

export interface APKMetadata {
  file_name: string;
  apk_size_bytes: number;
  app_name: string;
  package_name: string;
  version_name: string;
  version_code: string;
  min_sdk: string;
  target_sdk: string;
  permissions: string[];
  activities: string[];
  services: string[];
  receivers: string[];
  providers: string[];
  main_activity: string;
  signatures: string[];
}

export interface RiskResult {
  risk_score: number;
  verdict: 'Safe' | 'Suspicious' | 'Malicious';
  flags: string[];
  permission_score: number;
  package_score: number;
  signature_score: number;
  behavior_score: number;
  dangerous_permissions: string[];
}

export interface APKScanResponse {
  success: boolean;
  metadata: APKMetadata;
  risk: RiskResult;
}

export interface URLScanResponse {
  success: boolean;
  url: string;
  malicious: boolean;
  risk_score: number;
  verdict: 'Safe' | 'Suspicious' | 'Malicious';
  flags: string[];
}

const API_BASE = '/';

export async function scanAPK(file: File): Promise<APKScanResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}scan-apk`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).detail || `Scan failed (HTTP ${res.status})`);
  }

  return res.json();
}

export async function scanURL(url: string): Promise<URLScanResponse> {
  const res = await fetch(`${API_BASE}scan-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).detail || `URL scan failed (HTTP ${res.status})`);
  }

  return res.json();
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}health`);
    return res.ok;
  } catch {
    return false;
  }
}
