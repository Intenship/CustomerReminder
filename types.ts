// types.ts
export interface Customer {
  id?: string;
  name: string;
  phone: string;
  address: string;
  // local preview we used before (optional)
  photo?: string;
  // URL after upload to Firebase Storage
  photoURL?: string | null;
  // notifyDate either Date (read from Firestore Timestamp) or ISO-string
  notifyDate?: Date | string | null;
  createdAt?: any;
}

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Home: undefined;
  AddCustomer: undefined;
    EditCustomer: { customerId: string };      // Add this
  CustomerDetails: { customerId: string }; 
  
};
