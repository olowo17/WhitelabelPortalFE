import React from 'react';

export interface ISidebarItem {
  id: string | number;
  title: string;
  path: string;
  icon?: React.ReactNode;
  info?: string;
  children?: Omit<ISidebarItem, 'children'>[];
}
