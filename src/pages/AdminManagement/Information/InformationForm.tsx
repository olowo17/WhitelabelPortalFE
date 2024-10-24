import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, FormControl, FormHelperText, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import * as yup from 'yup';
import { Editor } from '@tinymce/tinymce-react';
import useToast from 'hooks/useToast';
import { useAnyUpdateValue, useFormValues } from 'hooks/useFormValues';
import { requiredOnly } from 'utils/validation';
import { IApiError } from 'models';
import { IInformation } from './Information.model';
import { createInfo, updateInfo } from './Information.service';

const mcePlugins = [
  'advlist autolink lists link image charmap print preview anchor',
  'searchreplace visualblocks code fullscreen',
  'insertdatetime media table paste code help wordcount',
];

const mceToolbar =
  'undo redo | formatselect | ' +
  'bold italic backcolor | alignleft aligncenter ' +
  'alignright alignjustify | bullist numlist outdent indent | ' +
  'removeformat | help';

const schema = yup.object().shape({
  code: requiredOnly('code'),
});

interface IInformationFormProps {
  closeForm: () => void;
  infoTypes: string[];
  info?: IInformation;
  searchInfos: () => void;
}

const InformationForm: React.FC<IInformationFormProps> = (props) => {
  const { info, searchInfos } = props;
  const { values, updateValue, errors, touched } = useFormValues(
    {
      code: info?.code || '',
      html: info?.html || '',
    },
    schema
  );
  const [initHTMLContent] = useState(values.html);
  const { showToast } = useToast();
  const handleChange = useAnyUpdateValue(updateValue);
  const onHTMLEditorChange = useCallback((newHTMLValue) => {
    updateValue({ target: { value: newHTMLValue, name: 'html', type: 'text', checked: false } } as any, 'html'); // TODO: use new form values method that updates input value
  }, []);
  const [submitting, setSubmitting] = useState(false);
  const { t } = useTranslation(['labels']);
  const actionStr = info ? t('labels:update') : t('labels:create');
  const editorRef = useRef<unknown>(null);

  const handleSubmit = useCallback(
    (evt) => {
      evt.preventDefault();
      if (errors) return;

      setSubmitting(true);
      (info ? updateInfo({ ...info, ...values }) : createInfo(values))
        .then((data) => {
          searchInfos();
          showToast({ message: data.description, type: 'success' });
          props.closeForm();
        })
        .catch((err: IApiError) => {
          showToast({ message: err.description, type: 'error' });
        })
        .finally(() => setSubmitting(false));
    },
    [values, errors, info, props.closeForm]
  );

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <Box marginBottom={2}>
          <FormControl fullWidth>
            <InputLabel id="info-form-code-label">{t('labels:type')}</InputLabel>
            <Select
              name="code"
              labelId="info-form-code-label"
              label={t('labels:type')}
              value={values.code}
              onChange={handleChange}
              error={Boolean(touched.code && errors?.code)}
              disabled={Boolean(info)}
            >
              <MenuItem value="">- Select -</MenuItem>
              {props.infoTypes.map((infoType) => (
                <MenuItem key={infoType} value={infoType}>
                  {infoType}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText error={Boolean(errors?.code)}>{touched.code && errors?.code}</FormHelperText>
          </FormControl>
        </Box>

        <Box>
          <Typography>{t('labels:content')}</Typography>
          <Editor
            apiKey={process.env.REACT_APP_TINY_MCE_KEY}
            onInit={(evt, editor) => (editorRef.current = editor)}
            initialValue={initHTMLContent}
            onEditorChange={onHTMLEditorChange}
            init={{
              height: 400,
              plugins: mcePlugins,
              toolbar: mceToolbar,
            }}
          />
        </Box>

        <LoadingButton
          type="submit"
          variant="contained"
          sx={{ marginTop: 2 }}
          loading={submitting}
          disabled={Boolean(errors)}
        >
          {actionStr}
        </LoadingButton>
      </form>
    </Box>
  );
};

export default InformationForm;
