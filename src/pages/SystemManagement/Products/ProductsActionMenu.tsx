import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CircularProgress, Menu, IconButton, MenuItem } from '@mui/material';
import { EditIcon, MoreVertIcon, PersonIcon, PersonOffIcon } from 'components/appIcons';
import { IProduct } from './Products.model';

interface IProductsActionMenu {
  product: IProduct;
  triggerEditProduct: (product: IProduct) => void;
  doActivateProduct: (product: IProduct) => Promise<void>;
  doDeactivateProduct: (product: IProduct) => Promise<void>;
}

const ProductsActionMenu: React.FC<IProductsActionMenu> = ({
  product,
  triggerEditProduct,
  doActivateProduct,
  doDeactivateProduct,
}) => {
  const { t } = useTranslation();
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);

  const doEditProduct = useCallback(() => {
    triggerEditProduct(product);
  }, [triggerEditProduct, product]);

  const toggleProductStatus = useCallback(() => {
    setTogglingStatus(true);
    (product.status ? doDeactivateProduct(product) : doActivateProduct(product)).finally(() =>
      setTogglingStatus(false)
    );
  }, [doActivateProduct, doDeactivateProduct, product]);

  return (
    <>
      <IconButton ref={ref} onClick={() => setIsOpen(true)}>
        <MoreVertIcon />
      </IconButton>

      <Menu
        open={isOpen}
        anchorEl={ref.current}
        onClose={() => setIsOpen(false)}
        PaperProps={{
          sx: { width: 200, maxWidth: '100%' },
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem
          sx={{ color: product.status ? 'error.main' : 'success.main' }}
          onClick={toggleProductStatus}
          disabled={togglingStatus}
        >
          {togglingStatus ? <CircularProgress size={14} /> : product.status ? <PersonOffIcon /> : <PersonIcon />}
          {product.status ? t('labels:deactivate') : t('labels:activate')}
        </MenuItem>

        <MenuItem onClick={doEditProduct}>
          <EditIcon /> {t('labels:edit')}
        </MenuItem>
      </Menu>
    </>
  );
};

export default ProductsActionMenu;
