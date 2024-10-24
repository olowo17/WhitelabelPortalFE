export interface ICategory {
  categoryID: number;
  code: string;
  name: string;
  description?: string;
  status?: boolean;
  gatewayCode?: string;
}

export interface IGetCategories {
  pageNumber: number;
  pageSize?: number;
  categoryName?: string;
}

export interface IGetCategoriesReturn {
  categories: ICategory[];
  code: number;
  description: string | null;
  totalRecordCount: number;
}

export interface IUpdateCategory {
  categoryID: number;
  code: string;
  name: string;
  description?: string;
  gatewayCode?: string;
}

export interface ICreateCategory {
  code: string;
  name: string;
  description?: string;
  gatewayCode?: string;
}
