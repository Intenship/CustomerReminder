import { Timestamp } from "@firebase/firestore";

// types.ts
export interface Customer {
  messageType: string;
  notificationMethod: string;
  id: string;
  name: string;
  phone: string;
  address: string;
  // local preview we used before (optional)
  photo?: string;
  photoBase64?: string;
  // URL after upload to Firebase Storage
  photoURL?: string | null;
  customMessage?: string;
  // notifyDate either Date (read from Firestore Timestamp) or ISO-string
  notifyDate?: Date | string | null;
  createdAt?: any;
}

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Home: undefined;
  AddCustomer: { customerToEdit?: Customer } | undefined;
 ViewCustomer: { customer: Customer }; 
  // AddCustomer: { customerToEdit?: Customer };
  EditCustomer: { customerId: string };      // Add this
  CustomerDetails: { customerId: string }; 

};

export interface NotificationReminder {
  id: string;
  customerId: string;
  customerName: string;
  scheduledTime: Timestamp;
  message: string;
  sent: boolean;
  expoPushToken: string;
  errorCount: number;
}
