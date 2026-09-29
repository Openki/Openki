import {
  OrganizationCustomGroupFields,
  OrganizationDashboard,
} from "../../organizations/organizations";

export interface Template {
  _id?: string;
  name: string;
  short: string;
  claim: string;
  description: string;
  members?: string[];
  createdby?: string;
  logoUrl?: string;
  customGroupFields?: OrganizationCustomGroupFields[];
  dashboard?: OrganizationDashboard;
}
