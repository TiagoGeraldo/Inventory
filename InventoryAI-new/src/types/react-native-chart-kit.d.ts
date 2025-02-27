declare module 'react-native-chart-kit' {
  import { ViewStyle } from 'react-native';
  
  interface ChartConfig {
    backgroundColor?: string;
    backgroundGradientFrom?: string;
    backgroundGradientTo?: string;
    decimalPlaces?: number;
    color?: (opacity?: number) => string;
    style?: ViewStyle;
  }

  interface PieChartData {
    name: string;
    population: number;
    color: string;
    legendFontColor?: string;
  }

  interface LineChartData {
    labels: string[];
    datasets: Array<{
      data: number[];
    }>;
  }

  export interface PieChartProps {
    data: PieChartData[];
    width: number;
    height: number;
    chartConfig: ChartConfig;
    accessor: string;
    backgroundColor?: string;
    paddingLeft?: string;
  }

  export interface LineChartProps {
    data: LineChartData;
    width: number;
    height: number;
    chartConfig: ChartConfig;
    bezier?: boolean;
    style?: ViewStyle;
  }

  export class PieChart extends React.Component<PieChartProps> {}
  export class LineChart extends React.Component<LineChartProps> {}
} 