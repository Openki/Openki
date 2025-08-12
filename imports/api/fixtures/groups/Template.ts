import { GroupEntityCustomCourseFields, GroupEntityDashboard } from "../../groups/groups";

export interface Template {
  _id?: string;
  name: string;
  short: string;
  claim: string;
  description: string;
  members?: string[];
  createdby?: string;
  logoUrl?: string;
  customCourseFields?: GroupEntityCustomCourseFields[];
  dashboard?: GroupEntityDashboard;
}
