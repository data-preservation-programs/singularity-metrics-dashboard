import { VerifiedClient, Version } from '@/app/api/types';

export interface MonthlySealed {
    barData: { [key: string]: string | number }[];
    details: Map<string, [VerifiedClient, number][]>;
    keys: string[];
}

interface ChartData {
    id: String;
    data: Array<{ x: string; y: number }>;
}

export interface DataPreparedChartProps {
    data: { id: Version; data: { x: string; y: number }[] }[];
    title: string;
}

export interface DealsChartProps {
    data: ChartData[];
    title: string;
}

export interface BigNumbersProps {
    overviewData: {
      label: string;
      value: string | JSX.Element;
    }[];
}
