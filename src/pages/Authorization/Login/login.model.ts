interface IRole {
  dateCreated: string;
  description: string;
  name: string;
  roleID: number;
}

interface IBranch {
  activeStatus: boolean;
  code: string;
  id: string;
  institution: IInstitution;
  name: string;
}

interface IInstitution {
  accentColor: string;
  bankCode: string;
  code: string;
  id: string;
  isISW: boolean;
  logo: string;
  name: string;
}

export interface IUser {
  branch: IBranch;
  clientIP: string;
  dateCreated: string;
  emailAddress: string;
  firstLogin: boolean;
  firstName: string;
  id: number;
  institution: IInstitution;
  lastName: string;
  lastPasswordChangeDate: string | null;
  mobileNumber: string;
  roles: IRole[];
  status: boolean;
  userName: string;
}

export interface IMenu {
  id: string;
  hasSubMenu: boolean;
  href: string;
  icon: string;
  routerLink: string;
  target: string;
  title: string;
  parent_id: string;
}

export interface IVerticalMenuItems {
  hasSubMenu: boolean;
  icon: string;
  id: number;
  parentID: number;
  roleID: number;
  routerLink: string;
  title: string;
}

export interface ILoginBody {
  email: string;
  password: string;
  authToken?: string;
}

export interface ILoginData {
  token: string;
  user: IUser;
  verticalMenuItems: IVerticalMenuItems[];
}

export interface ILoginReturn {
  code: number;
  description: string;
  data: ILoginData;
}

export interface IAuthUser extends ILoginData {
  firstLogin: boolean;
  lastLogin: number;
}

export type ILogin = (body: ILoginBody) => Promise<ILoginReturn>;
