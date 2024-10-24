export interface IProduct {
  amountFixed: boolean;
  billerID: number;
  code: string;
  maxAmount: number;
  minAmount: number;
  name: string;
  productID: number;
  status: boolean;
}

export interface IGetProductsReturn {
  code: number;
  description: string;
  products: IProduct[];
  totalRecordCount: number;
}

export interface ICreateProduct {
  billerID: number;
  code: string;
  maxAmount: number;
  minAmount: number;
  name: string;
}

export interface IUpdateProduct extends ICreateProduct {
  productID: number;
}

export interface IGetProducts {
  pageNumber: number;
  pageSize?: number;
  productName?: string;
  billerID: string;
}

// replace from Billers page

export interface IBiller {
  billerID: number;
  name: string;
  code: string;
  gatewayCode: string;
  label: string;
  productGroup: string;
  charge: number;
  status: boolean;
  validationSupported: boolean;
  processor: string;
  categoryID: number;
  categoryName: string;
  billerType: string;
}

export interface IGetBillersReturn {
  code: number;
  description: string;
  billers: IBiller[];
  totalRecordCount: number;
}
