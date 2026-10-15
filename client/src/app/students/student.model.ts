// טיפוסים שמתאימים ל-DTOs של השרת (StudentDto, PhoneDto ב-api/Dtos/StudentDtos.cs)
// interface ב-TypeScript קיים רק בזמן קומפילציה - אין לו קוד בזמן ריצה

export type PhoneType = 'Mobile' | 'Home' | 'Mother' | 'Father';

export interface Phone {
  id: number;
  number: string;
  type: PhoneType;
}

export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  birthDate: string; // מגיע מהשרת כמחרוזת ISO: "2012-03-14"
  phones: Phone[];
}

// תוויות בעברית לסוגי הטלפון (בדומה ל-Dictionary<PhoneType, string>)
export const phoneTypeLabels: Record<PhoneType, string> = {
  Mobile: 'נייד',
  Home: 'בית',
  Mother: 'אמא',
  Father: 'אבא',
};
