import {
  OrganizationEntityCustomGroupFields,
  OrganizationEntityDashboard,
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
  customGroupFields?: OrganizationEntityCustomGroupFields[];
  dashboard?: OrganizationEntityDashboard;
}
