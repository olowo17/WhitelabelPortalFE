interface IUserRole {
  roleID: number;
  name: string;
  dateCreated: string;
}

interface IUserBranch {
  id: number;
  code: string;
  name: string;
  activeStatus: true;
  institution_id: number;
}

interface IUserInstitution {
  id: number | string;
  name: string;
  code: string;
  isISW: boolean;
}

export interface IPortalUser {
  id: number;
  userName: string;
  emailAddress: string;
  mobileNumber: string;
  firstName: string;
  lastName: string;
  status: boolean;
  dateCreated: string;
  lastPasswordChangeDate: string;
  clientIP: string | number;
  firstLogin: boolean;
  branch: IUserBranch;
  role: IUserRole;
  institution: IUserInstitution;
}

export interface IGetUsersBody {
  pageNumber: number;
  pageSize?: number;
  username?: string;
  institutionCode?: string;
  country_id?: string;
}

export interface IGetUsersData {
  data: IPortalUser[];
  description: string;
  totalCount: number;
}

export interface ICreateUserBody {
  firstName: string;
  lastName: string;
  // userName: string;
  email: string;
  password: string;
  roleId: number | string;
  mobileNumber: string;
  institutionCode: string;
  branchCode: string;
}

export interface ICreateUserSearch extends ICreateUserBody {
  passwordConfirmation: string;
}

export interface IUpdateUserBody {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  institutionCode: string;
}
