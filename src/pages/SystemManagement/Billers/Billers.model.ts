export interface IBiller {
  billerID: number;
  name: string;
  code: string;
  gatewayCode: string;
  label: string;
  charge: number;
  status: boolean;
  validationSupported: boolean;
  categoryID: number;
  categoryName: string;
  defaultProductCode: string;
  imageUrl: string;
  removed: boolean;
}

export interface IGetBillersBody {
  pageNumber: number;
  pageSize?: number;
  billerName?: string;
}

export interface IGetBillersData {
  code: number;
  description: string;
  billers: IBiller[];
  totalRecordCount: number;
}

export interface ICreateBiller {
  name: string;
  code: string;
  gatewayCode: string;
  label: string;
  charge: string;
  categoryID: string;
  defaultProductCode: string;
  imageUrl: string;
}

export interface IUpdateBiller extends ICreateBiller {
  billerID: string;
}

export interface IGetFilteredBillers {
  code: number;
  description: string;
  billers: IBiller[];
  totalRecordCount: number;
}
