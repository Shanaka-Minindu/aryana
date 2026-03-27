export type FieldErrors = Record<string, string[] | undefined>;

export interface ServerActionResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errorType?: string;
  fieldErrors?: FieldErrors;
}


export interface carouselItem {
  id: string;
  imgUrl: string;
  heading: string;
  subHeading: string;
  linkUrl: string;
  textPosition: "LEFT"|"RIGHT"|"CENTER"
  buttonText: string;
  position: number;
}