import { API_BASE_URL } from '@/config/api.ts';
import { authFetch } from '@/api/utils.ts';

const SHOOTINGS_BASE = `${API_BASE_URL}/api/shootings`;

export const deleteShooting = async (
  id: number
) => {
  const response = await authFetch(`${SHOOTINGS_BASE}/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) throw new Error(`Failed to delete shooting ${response.status}`);
}

export const deleteShootingOption = async (
  optionId: number
) => {
  const response = await authFetch(`${SHOOTINGS_BASE}/options/${optionId}`, {
    method: 'DELETE',
  });

  if (!response.ok) throw new Error(`Failed to delete option ${response.status}`);
}

export interface GetShootingOptionResponse {
  id: number;
  productId: number;
  name: string;
  description: string;
  price: number;
  additionalTime: number; // minute
}

export const getShootingOptions = async (
  productId: number
): Promise<GetShootingOptionResponse[]>=> {
  const response = await authFetch(`${SHOOTINGS_BASE}/${productId}/options`, {
    method: 'GET',
  })

  if (!response.ok) throw new Error(`Failed to get shooting options ${response.status}`);
  return response.json();
}

export type EditingType = "FACIAL" | "COLOR" | "BOTH" | "NONE";
export type EditingDeadline = "SAME_DAY" | "WITHIN_2_DAYS" | "WITHIN_3_DAYS" | "WITHIN_4_DAYS" | "WITHIN_5_DAYS" | "WITHIN_7_DAYS";
export type SelectionAuthority = "PHOTOGRAPHER" | "CUSTOMER" | "BOTH";

export interface GetShootingResponse {
  id: number;
  isDefault: boolean;
  shoootingName: string;
  basePrice: number;
  description: string;
  photoTime: number; // minute
  personnel: number;
  providesRawFile: boolean;
  editingType: EditingType;
  editingDeadline: EditingDeadline;
  selectionAuthority: SelectionAuthority;
  providedEditCount: number;
}

export interface CreateShootingRequest {
  isDefault: boolean;
  PhotographerId: string;
  shootingName: string;
  basePrice: number;
  description: string;
  photoTime: number; // minute
  personnel: number;
  providesRawFile: boolean;
  editingType: EditingType;
  editingDeadline: EditingDeadline;
  selectionAuthority: SelectionAuthority;
  providedEditCount: number;
}

export interface CreateShootingOptionRequest {
  shootingProductId: number;
  name: string;
  description: string;
  price: number;
  additionalTime: number; // minute
}

export const getShootings = async () : Promise<GetShootingResponse[]> => {
  const response = await authFetch(`${SHOOTINGS_BASE}/me`, {
    method: 'GET',
  });

  if (!response.ok) throw new Error(`Failed to get shootings ${response.status}`);
  return response.json();
}

export const createShooting = async (
  body: CreateShootingRequest
): Promise<GetShootingResponse> => {
  const response = await authFetch(`${SHOOTINGS_BASE}`, {
    method: 'POST',
    json: body
  });

  if (!response.ok) throw new Error(`Failed to create shooting ${response.status}`);
  return response.json();
}

export const createShootingOption = async (
  productId: number, body: CreateShootingOptionRequest
): Promise<GetShootingOptionResponse> => {
  const response = await authFetch(`${SHOOTINGS_BASE}/${productId}/options`, {
    method: 'POST',
    json: body
  });

  if (!response.ok) throw new Error(`Failed to create shooting option ${response.status}`);
  return response.json();
}

export const updateShooting = async (
  id: number, body: CreateShootingRequest
): Promise<GetShootingResponse> => {
  const response = await authFetch(`${SHOOTINGS_BASE}/${id}`, {
    method: 'PUT',
    json: body
  });

  if (!response.ok) throw new Error(`Failed to update shooting ${response.status}`);
  return response.json();
}

export const updateShootingOption = async (
  optionId: number, body: CreateShootingOptionRequest
): Promise<GetShootingOptionResponse> => {
  const response = await authFetch(`${SHOOTINGS_BASE}/options/${optionId}`, {
    method: 'POST',
    json: body
  });

  if (!response.ok) throw new Error(`Failed to update shooting option ${response.status}`);
  return response.json();
}
