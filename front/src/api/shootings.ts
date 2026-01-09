import { API_BASE_URL } from '@/config/api.ts';
import { authFetch } from '@/api/utils.ts';

const SHOOTINGS_BASE = `${API_BASE_URL}/api/shootings`;

export const deleteShooting = async (
  id: number
) => {
  const response = await authFetch(`${SHOOTINGS_BASE}/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) throw new Error('촬영 상품을 삭제할 수 없습니다.');
}

export const deleteShootingOption = async (
  optionId: number
) => {
  const response = await authFetch(`${SHOOTINGS_BASE}/options/${optionId}`, {
    method: 'DELETE',
  });

  if (!response.ok) throw new Error('옵션을 삭제할 수 없습니다.');
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

  if (!response.ok) throw new Error('촬영 옵션을 불러올 수 없습니다.');
  return response.json();
}

export type EditingType = "FACIAL" | "COLOR" | "BOTH" | "NONE";
export type EditingDeadline = "SAME_DAY" | "WITHIN_2_DAYS" | "WITHIN_3_DAYS" | "WITHIN_4_DAYS" | "WITHIN_5_DAYS" | "WITHIN_7_DAYS" | "WITHUP_7_DAYS";
export type SelectionAuthority = "PHOTOGRAPHER" | "CUSTOMER" | "BOTH";

export const mappingEditDeadline = (editingDeadline: EditingDeadline) => {
  switch (editingDeadline) {
    case "SAME_DAY": return 1;
    case "WITHIN_2_DAYS": return 2;
    case "WITHIN_3_DAYS": return 3;
    case "WITHIN_4_DAYS": return 4;
    case "WITHIN_5_DAYS": return 5;
    case "WITHIN_7_DAYS":
    case "WITHUP_7_DAYS": return 7;
  }
}

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

export const getMyShootings = async () : Promise<GetShootingResponse[]> => {
  const response = await authFetch(`${SHOOTINGS_BASE}/me`, {
    method: 'GET',
  });

  if (!response.ok) throw new Error('촬영 상품을 불러올 수 없습니다.');
  return response.json();
}

export const createShooting = async (
  body: CreateShootingRequest
): Promise<GetShootingResponse> => {
  const response = await authFetch(`${SHOOTINGS_BASE}`, {
    method: 'POST',
    json: body
  });

  if (!response.ok) throw new Error('촬영 상품을 생성할 수 없습니다.');
  return response.json();
}

export const createShootingOption = async (
  productId: number, body: CreateShootingOptionRequest
): Promise<GetShootingOptionResponse> => {
  const response = await authFetch(`${SHOOTINGS_BASE}/${productId}/options`, {
    method: 'POST',
    json: body
  });

  if (!response.ok) throw new Error('촬영 옵션을 생성할 수 없습니다.');
  return response.json();
}

export const updateShooting = async (
  id: number, body: CreateShootingRequest
): Promise<GetShootingResponse> => {
  const response = await authFetch(`${SHOOTINGS_BASE}/${id}`, {
    method: 'PUT',
    json: body
  });

  if (!response.ok) throw new Error('촬영 상품을 수정할 수 없습니다.');
  return response.json();
}

export const updateShootingOption = async (
  optionId: number, body: CreateShootingOptionRequest
): Promise<GetShootingOptionResponse> => {
  const response = await authFetch(`${SHOOTINGS_BASE}/options/${optionId}`, {
    method: 'PUT',
    json: body
  });

  if (!response.ok) throw new Error('촬영 옵션을 수정할 수 없습니다.');
  return response.json();
}

export const getShootings = async (
  photographerId: string
) : Promise<GetShootingResponse[]> => {
  const response = await authFetch(`${SHOOTINGS_BASE}/${photographerId}`, {
    method: 'GET',
  });

  if (!response.ok) throw new Error('촬영 상품을 불러올 수 없습니다.');
  return response.json();
}