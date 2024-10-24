// operationName: "Users"
export const UsersInput = {
  institution_id: '1',
  pageNumber: 1,
  pageSize: 10,
  username: 'username',
};
export const UsersResponse = {
  data: {
    users: {
      count: 4,
      rows: [
        {
          branch: {
            code: 'ABJ',
            id: '13',
            name: 'Abuja',
            __typename: 'Branch',
          },
          branch_id: '13',
          emailAddress: 'nirsal-user@example.com',
          firstName: 'Jack',
          id: '53',
          institution: {
            code: '057',
            country: {
              id: '1',
              name: 'Nigeria',
              __typename: 'Country',
            },
            country_id: '1',
            id: '2',
            isISW: false,
            name: 'NIRSAL MFB',
            __typename: 'Institution',
          },
          institution_id: '2',
          lastName: 'Doe',
          mobileNumber: '08167384959',
          role: {
            description: 'Administrator',
            id: '29',
            name: 'Admin',
            __typename: 'Role',
          },
          role_id: '29',
          status: true,
          username: 'jack',
          __typename: 'User',
        },
      ],
    },
  },
};

// operationName: "CreateUser"
export const CreateUserInput = {
  branch_id: '12',
  emailAddress: 'test01@test.com',
  firstName: 'Test',
  institution_id: '1',
  lastName: 'Test',
  mobileNumber: '777777777777',
  role_id: '28',
  username: 'Test01',
};
export const CreateUserResponse = {
  data: {
    createUser: {
      description: 'Request Submitted Successfully!',
      success: true,
      __typename: 'MutationResponse',
    },
  },
};

// operationName: "UpdateUser"
export const UpdateUserInput = {
  branch_id: '4',
  emailAddress: 'seun@qa.team',
  firstName: 'Seun',
  id: '26',
  institution_id: '5',
  lastName: 'Odebunmi',
  mobileNumber: '07058099158',
  role_id: '13',
  username: 'seunodebunmi',
};
export const UpdateUserResponse = {
  data: {
    updateUser: {
      description: 'Request Submitted Successfully!',
      success: true,
      __typename: 'MutationResponse',
    },
  },
};

// operationName: "DeactivateUser"
export const DeactivateUserInput = {
  id: '27',
};
export const DeactivateUserResponse = {
  data: {
    deactivateUser: {
      description: 'Request Submitted Successfully!',
      success: true,
      __typename: 'MutationResponse',
    },
  },
};

// operationName: "ActivateUser"
const ActivateUserInput = {
  id: '27',
};
const ActivateUserResponse = {
  data: {
    activateUser: {
      description: 'Request Submitted Successfully!',
      success: true,
      __typename: 'MutationResponse',
    },
  },
};

// operationName: "Countrys"
const CountrysInput = {
  pageNumber: 1,
};
const CoutrysResponse = {
  data: {
    countries: {},
    count: 3,
    rows: [
      {
        active: true,
        code: 'NG',
        id: '1',
        name: 'Nigeria',
        __typename: 'Country',
      },
      {
        active: true,
        code: 'GH',
        id: '2',
        name: 'Ghana',
        __typename: 'Country',
      },
      {
        active: true,
        code: 'MLW',
        id: '3',
        name: 'MALAWI',
        __typename: 'Country',
      },
    ],
    __typename: 'CountriesReturn',
  },
};

// operationName: "CreateCountry"
const CreateCountryInput = {
  code: 'NG',
  name: 'Nigeria',
};
const CreateCountryResponse = {
  data: {
    createCountry: {
      description: 'Request Submitted Successfully!',
      success: true,
      __typename: 'MutationResponse',
    },
  },
};

// operationName: "UpdateCountry"
const UpdateCountryInput = {
  code: 'NG',
  id: '1',
  name: 'Nigeria',
};
const UpdateCountryResponse = {
  data: {
    updateCountry: {
      description: 'Request Submitted Successfully!',
      success: true,
      __typename: 'MutationResponse',
    },
  },
};

// operationName: "Institutions"
const InstitutionsInput = {
  pageNumber: 1,
  pageSize: 10,
  country_id: '3',
};
const InstitutionsResponse = {
  data: {
    institutions: {
      count: 1,
      rows: [
        {
          accentColor: '#ff0000',
          bankCode: '090121',
          code: '056',
          country: {
            code: 'NG',
            id: '1',
            name: 'Nigeria',
            __typename: 'Country',
          },
          country_id: '1',
          currentAppVersion: '1.0.2',
          forceUpdate: true,
          id: '1',
          isISW: false,
          logo: '/logos/HASAL1.jpg',
          name: 'HASAL',
          __typename: 'Institution',
        },
      ],
      __typename: 'InstitutionsReturn',
    },
  },
};

// operationName: "CreateInstitution"
const CreateInstitutionInput = {
  accentColor: '#ff0000',
  bankCode: '090121',
  code: '056',
  configFile: null,
  country_id: '1',
  currentAppVersion: '1.0.2',
  forceUpdate: true,
  logo: '',
  name: 'HASAL',
};
const CreateInstitutionResponse = {
  data: {
    createInstitution: {
      description: 'Request Submitted Successfully!',
      success: true,
      __typename: 'MutationResponse',
    },
  },
};

// operationName: "UpdateInstitution"
const UpdateInstitutionInput = {
  accentColor: '#ff0000',
  bankCode: '090121',
  code: '056',
  configFile: null,
  country_id: '1',
  currentAppVersion: '1.0.2',
  forceUpdate: true,
  id: '1',
  logo: '',
  name: 'HASAL',
};
const UpdateInstitutionResponse = {
  data: {
    updateInstitution: {
      description: 'Request Submitted Successfully!',
      success: true,
      __typename: 'MutationResponse',
    },
  },
};

// operationName: "Roles"
const RolesInput = {
  institution_id: '1',
  pageNumber: 1,
  pageSize: 10,
};
const RolesResponse = {
  data: {
    roles: {
      count: 20,
    },
    rows: [
      {
        authorizer: true,
        description: 'Administrator',
        id: '13',
        institution: {
          code: 'ISW',
          country: {
            id: '1',
            name: 'Nigeria',
            __typename: 'Country',
          },
          country_id: '1',
          id: '5',
          isISW: true,
          name: 'Interswitch',
          __typename: 'Institution',
        },
        institution_id: '5',
        name: 'Administrator',
        __typename: 'Role',
      },
    ],
  },
};

// operationName: "CreateRole"
const CreateRoleInput = {
  authorizer: true,
  description: 'Test role',
  institution_id: '3',
  name: 'Test01',
};
const CreateRoleResponse = {
  data: {
    createRole: {
      description: 'Request Submitted Successfully!',
      success: true,
      __typename: 'MutationResponse',
    },
  },
};

// operationName: "UpdateRole"
const UpdateRoleInput = {
  authorizer: true,
  description: 'Adminstrates',
  id: '28',
  institution_id: '1',
  name: 'Admin',
};
const UpdateRoleResponse = {
  data: {
    updateRole: {
      description: 'Request Submitted Successfully!',
      success: true,
      __typename: 'MutationResponse',
    },
  },
};

// operationName: "Menus"
const MenusInput = {
  institution_id: '1',
};
const MenusResponse = {
  data: {
    menus: [
      {
        hasSubMenu: false,
        href: null,
        icon: 'tachometer',
        id: '601',
        parent_id: '0',
        routerLink: '/pages/dashboard',
        target: null,
        title: 'Dashboard',
        __typename: 'Menu',
      },
      {
        hasSubMenu: true,
        href: null,
        icon: 'file-text-o',
        id: '607',
        parent_id: '0',
        routerLink: null,
        target: null,
        title: 'Admin Management',
        __typename: 'Menu',
      },
      {
        hasSubMenu: false,
        href: null,
        icon: 'file-text-o',
        id: '608',
        parent_id: '607',
        routerLink: '/pages/admin/users',
        target: null,
        title: 'Users',
        __typename: 'Menu',
      },
    ],
  },
};

// operationName: "RoleFunctions"
const RoleFunctionsInput = {
  role_id: '28',
};
const RoleFunctionsResponse = {
  data: {
    roleFunctions: [
      {
        menu: {
          hasSubMenu: false,
          href: null,
          icon: 'tachometer',
          id: '601',
          parent_id: '0',
          routerLink: '/pages/dashboard',
          target: null,
          title: 'Dashboard',
          __typename: 'Menu',
        },
        menu_id: '601',
        role_id: '28',
        __typename: 'RoleFunction',
      },
      {
        menu: {
          hasSubMenu: true,
          href: null,
          icon: 'file-text-o',
          id: '607',
          parent_id: '0',
          routerLink: null,
          target: null,
          title: 'Admin Management',
          __typename: 'Menu',
        },
        menu_id: '607',
        role_id: '28',
        __typename: 'RoleFunction',
      },
      {
        menu: {
          hasSubMenu: true,
          href: null,
          icon: 'file-text-o',
          id: '607',
          parent_id: '0',
          routerLink: null,
          target: null,
          title: 'Admin Management',
          __typename: 'Menu',
        },
        menu_id: '607',
        role_id: '28',
        __typename: 'RoleFunction',
      },
    ],
  },
};

// operationName: "Branches"
const BranchesInput = {
  institution_id: '',
  pageNumber: 1,
  pageSize: 10,
};
const BranchesResponse = {
  data: {
    branches: {
      count: 19,
      rows: [
        {
          activeStatus: false,
          code: 'kkkk',
          id: '3',
          institution: {
            code: 'ISW',
            country: {
              id: '1',
              name: 'Nigeria',
              __typename: 'Country',
            },
            country_id: '1',
            id: '5',
            isISW: true,
            name: 'Interswitch',
            __typename: 'Institution',
          },
          institution_id: '5',
          name: 'Gbagadah',
          __typename: 'Branch',
        },
        {
          activeStatus: true,
          code: 'VI001',
          id: '4',
          institution: {
            code: 'ISW',
            country: {
              id: '1',
              name: 'Nigeria',
              __typename: 'Country',
            },
            country_id: '1',
            id: '5',
            isISW: true,
            name: 'Interswitch',
            __typename: 'Institution',
          },
          institution_id: '5',
          name: 'Victoria Island',
          __typename: 'Branch',
        },
      ],
    },
  },
};

// operationName: "CreateBranch"
const CreateBranchInput = {
  code: 'kkkk',
  institution_id: '5',
  name: 'Gbagadah',
};
const CreateBranchResponse = {
  data: {
    createBranch: {
      description: 'Request Submitted Successfully!',
      success: true,
      __typename: 'MutationResponse',
    },
  },
};

// operationName: "UpdateBranch"
const UpdateBranchInput = {
  code: 'kkkk',
  id: '3',
  institution_id: '5',
  name: 'Gbagadah',
};
const UpdateBranchResponse = {
  data: {
    updateBranch: {
      description: 'Request Submitted Successfully!',
      success: true,
      __typename: 'MutationResponse',
    },
  },
};

// operationName: "ActivateBranch"
const ActivateBranchInput = {
  id: '3',
};
const ActivateBranchResponse = {
  data: {
    activateBranch: {
      description: 'Request Submitted Successfully!',
      success: true,
      __typename: 'MutationResponse',
    },
  },
};

// operationName: "DeactivateBranch"
const DeactivateBranchInput = {
  id: '3',
};
const DeactivateBranchResponse = {
  data: {
    deactivateBranch: {
      description: 'Request Submitted Successfully!',
      success: true,
      __typename: 'MutationResponse',
    },
  },
};

// operationName: "RequestTypes"
// No Input
const RequestTypesResponse = {
  data: {
    requestTypes: [
      {
        key: 'ADD_BILLER',
        value: 'ADD_BILLER',
        __typename: 'RequestTypes',
      },
      {
        key: 'ADD_CONFIG_PROPERTY',
        value: 'ADD_CONFIG_PROPERTY',
        __typename: 'RequestTypes',
      },
      {
        key: 'ADD_FILTERED_BANK',
        value: 'ADD_FILTERED_BANK',
        __typename: 'RequestTypes',
      },
      {
        key: 'ADD_ROLE_FUNCTION',
        value: 'ADD_ROLE_FUNCTION',
        __typename: 'RequestTypes',
      },
    ],
  },
};

// operationName: "PendingRequests"
const PendingRequestsInput = {
  endDate: '',
  pageNumber: 1,
  pageSize: 10,
  requestType: '',
  startDate: '',
};
const PendingRequestsResponse = {
  data: {
    pendingRequests: {
      count: 24,
      rows: [
        {
          actionOn: 'Victoria Island',
          additionalInfo: '{"id":"4","institution_id":"5"}',
          description:
            'Deactivate branch request - [Victoria Island] for: Interswitch, initiated by: seunodebunmi from: Interswitch',
          id: '60715',
          portalAction: true,
          requestDate: '2022-05-10 07:03:00',
          requestType: 'DISABLE_BRANCH',
          requestor: 'seunodebunmi',
          requestorEmail: 'seun@qa.team',
          status: 'PENDING',
          __typename: 'PendingRequest',
        },
        {
          actionOn: 'Gbagadah',
          additionalInfo: '{"id":"3","institution_id":"5"}',
          description:
            'Activate branch request - [Gbagadah] for: Interswitch, initiated by: seunodebunmi from: Interswitch',
          id: '60714',
          portalAction: true,
          requestDate: '2022-05-10 07:01:55',
          requestType: 'ENABLE_BRANCH',
          requestor: 'seunodebunmi',
          requestorEmail: 'seun@qa.team',
          status: 'PENDING',
          __typename: 'PendingRequest',
        },
      ],
    },
  },
};

// operationName: "ApprovePendingRequest"
const ApprovePendingRequestInput = {
  requestId: '60712',
};
const ApprovePendingRequestResponse = {
  data: {
    approvePendingRequest: {
      description: 'Request Approved Successfully!',
      success: true,
      __typename: 'MutationResponse',
    },
  },
};

// operationName: "DeclinePendingRequest"
const DeclinePendingRequestInput = {
  requestId: '60715',
};
const DeclinePendingRequestResponse = {
  data: {
    declinePendingRequest: {
      description: 'Request Declined Successfully!',
      success: true,
      __typename: 'MutationResponse',
    },
  },
};
