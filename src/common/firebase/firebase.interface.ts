
export interface PushDataPayload {
  title: string;
  body: string;
  image_logo: string;
  image_detail: string;
  count: string; // iOS badge
  targetScreen: string; // custom
  notificationId: string; // custom
  data: string; // custom (stringfy)
  [key: string]: string; 
}
