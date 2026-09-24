export interface IStaffMember {
  id: number;
  name: string;
  contactPersonal: string;
  contactOffice: string;
  cpr: string;
  cprExpiry: string;
  conIdBnet: string;
  bnetIdExpiry: string;
  conIdBatelco: string;
  batelcoExpiry: string;
  rpExpiry: string;
  nationality: string;
  passportExpiry: string;
  noc: string;
  picture: string;
  visa: string;
  missingData: string;
  checkBnetCard: string;
  checkCprExpiry: string;
  checkRpExpiry: string;
  checkPassportExpiry: string;
  checkBatelcoExpiry: string;
  commentsOnExpiry: string;
  bnetCardStatus: string;
  status: string;
  staffCategory: string;
}

export interface IStaffResponse {
  data: IStaffMember[];
  total: number;
  page: number;
  limit: number;
}
