export interface Card {
  student_id: number;
  first_name: string;
  last_name: string;
  employer_name: string | null;
  check_in_date_time: string | null;
  check_out_date_time: string | null;
  check_in_time: string | null;
  check_out_time: string | null;
  emotion: string | null;
}
