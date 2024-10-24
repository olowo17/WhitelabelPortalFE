interface IInstitution {
  name: string;
}

interface IRole {
  name: string;
}

interface IBranch {
  name: string;
}

export interface IGetProfileReturn {
  emailAddress: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  username: string;
  branch: IBranch;
  role: IRole;
  institution: IInstitution;
}

export interface IGetProfileBody {
  id: number;
}
