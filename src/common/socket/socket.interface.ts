export interface ISensor {
  temperature: number;
  humidity: number;
  current: number;
  timestamp?: number;
}

export interface ISensorStatus {
  key: string;
  status: 'online' | 'offline';
  timestamp?: number;
}


export interface ISensorHome {
  userHomeCode: string;
  temperature: number;
  humidity: number;
  current: number;
}
