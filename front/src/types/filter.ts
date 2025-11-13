import { ComponentType } from 'react';
import { SvgProps } from 'react-native-svg';

/**
 * Base filter category structure
 */
export interface BaseFilterCategory {
  id: string;
  name: string;
  icon: ComponentType<SvgProps>;
  activeIcon: ComponentType<SvgProps>;
}

/**
 * ENUM type filter category (multi-select from list)
 */
export interface EnumFilterCategory extends BaseFilterCategory {
  type: 'ENUM';
  items: string[];
}

/**
 * NUMBER type filter category (range slider)
 */
export interface NumberFilterCategory extends BaseFilterCategory {
  type: 'NUMBER';
  min: number;
  max: number;
  unit?: string;
}

/**
 * Union type for all filter categories
 */
export type FilterCategory = EnumFilterCategory | NumberFilterCategory;

/**
 * Selected filter value for ENUM type
 */
export interface EnumFilterValue {
  categoryId: string;
  type: 'ENUM';
  values: string[];
}

/**
 * Selected filter value for NUMBER type
 */
export interface NumberFilterValue {
  categoryId: string;
  type: 'NUMBER';
  min: number;
  max: number;
}

/**
 * Union type for all filter values
 */
export type FilterValue = EnumFilterValue | NumberFilterValue;

/**
 * Filter chip for display (selected filters)
 */
export interface FilterChip {
  id: string;
  categoryId: string;
  label: string;
}
