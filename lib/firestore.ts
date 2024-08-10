import { Timestamp } from "firebase/firestore";

export interface Item {
  id?: string;
  name: string;
  operation: 'input' | 'output';
  quantity: number;
  email?: string;
  timeUpdated: Date;
  price: number;
  uid: string;
  mostRecentOperationCount: number;
}

export interface Transaction {
  id?: string;
  name: string;
  uid: string;
  operation: 'input' | 'output' | 'dump';
  quantity: number;
  email?: string;
  price: number;
  time: Timestamp | Date;
  status: 'completed' | 'in progress' | 'failed';
}
