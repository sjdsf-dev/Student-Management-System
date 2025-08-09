export interface Student {
  id: number;
  first_name: string;
  last_name: string;
  dob: string; // ISO string
  gender: string;
  address_line1: string;
  address_line2: string;
  city: string;
  contact_number: string;
  contact_number_guardian: string;
  supervisor_id?: number | null;
  remarks: string;
  home_long: number;
  home_lat: number;
  employer_id?: number | null;
  check_in_time: string;
  check_out_time: string;
}
// export interface Student {
//     id: number;
//     first_name: string;
//     last_name: string;
//     dob: Date;
//     gender: string;
//     address_line1: string;
//     address_line2: string;
//     city: string;
//     contact_number: string;
//     contact_number_guardian: string;
//     supervisor_id: number;
//     employer_id: number;
//     remarks: string;
//     photo: Uint8Array;
//     home_long: string;
//     home_lat: string;
// }
