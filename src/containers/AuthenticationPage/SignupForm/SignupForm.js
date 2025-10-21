import React from 'react';
import { Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { propTypes } from '../../../util/types';
import * as validators from '../../../util/validators';
import { getPropsForCustomUserFieldInputs } from '../../../util/userHelpers';

import { Form, PrimaryButton, FieldTextInput } from '../../../components';
import CustomExtendedDataField from '../../../components/CustomExtendedDataField/CustomExtendedDataField';

import FieldSelectUserType from '../FieldSelectUserType';
import UserFieldDisplayName from '../UserFieldDisplayName';
import UserFieldPhoneNumber from '../UserFieldPhoneNumber';
import ImageUploader from '../../../components/ImageUploader/ImageUploader';

import css from './SignupForm.module.css';

const getSoleUserTypeMaybe = userTypes =>
  Array.isArray(userTypes) && userTypes.length === 1 ? userTypes[0].userType : null;

const SignupFormComponent = props => (
  <FinalForm
    {...props}
    mutators={{ ...arrayMutators }}
    initialValues={{ userType: props.preselectedUserType || getSoleUserTypeMaybe(props.userTypes) }}
    render={formRenderProps => {
      const {
        rootClassName,
        className,
        formId,
        handleSubmit,
        inProgress,
        invalid,
        intl,
        termsAndConditions,
        preselectedUserType,
        userTypes,
        userFields,
        values,
        form,
      } = formRenderProps;

      const { userType, selfieDocumentLink, pub_role } = values || {};

      // email
      const emailRequired = validators.required(
        intl.formatMessage({
          id: 'SignupForm.emailRequired',
        })
      );
      const emailValid = validators.emailFormatValid(
        intl.formatMessage({
          id: 'SignupForm.emailInvalid',
        })
      );

      // password
      const passwordRequiredMessage = intl.formatMessage({
        id: 'SignupForm.passwordRequired',
      });
      const passwordMinLengthMessage = intl.formatMessage(
        {
          id: 'SignupForm.passwordTooShort',
        },
        {
          minLength: validators.PASSWORD_MIN_LENGTH,
        }
      );
      const passwordMaxLengthMessage = intl.formatMessage(
        {
          id: 'SignupForm.passwordTooLong',
        },
        {
          maxLength: validators.PASSWORD_MAX_LENGTH,
        }
      );
      const passwordMinLength = validators.minLength(
        passwordMinLengthMessage,
        validators.PASSWORD_MIN_LENGTH
      );
      const passwordMaxLength = validators.maxLength(
        passwordMaxLengthMessage,
        validators.PASSWORD_MAX_LENGTH
      );
      const passwordRequired = validators.requiredStringNoTrim(passwordRequiredMessage);
      const passwordValidators = validators.composeValidators(
        passwordRequired,
        passwordMinLength,
        passwordMaxLength
      );

      // Custom user fields. Since user types are not supported here,
      // only fields with no user type id limitation are selected.

      const filterUserFields =
        pub_role === undefined
          ? userFields.filter(
              elm =>
                ![
                  'companyname',
                  'id_card_nik',
                  'id_npwp_nik',
                  'company_address',
                  'company_registration',
                ].includes(elm.key)
            )
          : pub_role === 'individual'
          ? userFields.filter(elm => ['id_card_nik', 'role'].includes(elm.key))
          : pub_role === 'freelance'
          ? userFields.filter(elm => ['id_npwp_nik', 'role'].includes(elm.key))
          : pub_role === 'company'
          ? userFields.filter(elm =>
              ['companyname', 'company_address', 'company_registration', 'role'].includes(elm.key)
            )
          : [];

      const userFieldProps = getPropsForCustomUserFieldInputs(filterUserFields, intl, userType);

      // Separate fields based on pub_role value
      const roleSpecificField = userFieldProps.find(({ key }) => key === 'pub_role');
      const otherUserFields = userFieldProps.filter(({ key }) => key !== 'pub_role');

      const noUserTypes = !userType && !(userTypes?.length > 0);
      const userTypeConfig = userTypes.find(config => config.userType === userType);
      const showDefaultUserFields = userType || noUserTypes;
      const showCustomUserFields = (userType || noUserTypes) && userFieldProps?.length > 0;

      const classes = classNames(rootClassName || css.root, className);
      const submitInProgress = inProgress;

      let providerDisabled = false;
      if (userType === 'provider') {
        providerDisabled =
          pub_role === 'company'
            ? !values.companyDocumentLink
            : !values.idDocumentLink || !selfieDocumentLink;
      }

      const submitDisabled = invalid || submitInProgress || providerDisabled;

      const handleSelfieDocument = file => {
        form.change('selfieDocumentLink', file);
      };

      const handleIdDocument = file => {
        form.change('idDocumentLink', file);
      };

      const handleCompanyDocument = file => {
        form.change('companyDocumentLink', file);
      };

      return (
        <Form className={classes} onSubmit={handleSubmit}>
          <div className={css.formTitle}>
            <h2>
              <FormattedMessage id="SignupForm.signUp" />
            </h2>
            <p>
              <FormattedMessage id="SignupForm.description" />
            </p>
          </div>
          <div className={css.formContent}>
            <FieldSelectUserType
              name="userType"
              userTypes={userTypes}
              hasExistingUserType={!!preselectedUserType}
              intl={intl}
              validate={validators.required(
                intl.formatMessage({
                  id: 'FieldSelectUserType.required',
                })
              )}
            />
            {showDefaultUserFields ? (
              <div className={css.defaultUserFields}>
                <FieldTextInput
                  type="email"
                  id={formId ? `${formId}.email` : 'email'}
                  name="email"
                  autoComplete="email"
                  label={intl.formatMessage({
                    id: 'SignupForm.emailLabel',
                  })}
                  placeholder={intl.formatMessage({
                    id: 'SignupForm.emailPlaceholder',
                  })}
                  validate={validators.composeValidators(emailRequired, emailValid)}
                />
                <div className={css.name}>
                  <FieldTextInput
                    className={css.firstNameRoot}
                    type="text"
                    id={formId ? `${formId}.fname` : 'fname'}
                    name="fname"
                    autoComplete="given-name"
                    label={intl.formatMessage({
                      id: 'SignupForm.firstNameLabel',
                    })}
                    placeholder={intl.formatMessage({
                      id: 'SignupForm.firstNamePlaceholder',
                    })}
                    validate={validators.required(
                      intl.formatMessage({
                        id: 'SignupForm.firstNameRequired',
                      })
                    )}
                  />
                  <FieldTextInput
                    className={css.lastNameRoot}
                    type="text"
                    id={formId ? `${formId}.lname` : 'lname'}
                    name="lname"
                    autoComplete="family-name"
                    label={intl.formatMessage({
                      id: 'SignupForm.lastNameLabel',
                    })}
                    placeholder={intl.formatMessage({
                      id: 'SignupForm.lastNamePlaceholder',
                    })}
                    validate={validators.required(
                      intl.formatMessage({
                        id: 'SignupForm.lastNameRequired',
                      })
                    )}
                  />
                </div>

                <UserFieldDisplayName
                  formName="SignupForm"
                  className={css.row}
                  userTypeConfig={userTypeConfig}
                  intl={intl}
                />

                <FieldTextInput
                  className={css.password}
                  type="password"
                  id={formId ? `${formId}.password` : 'password'}
                  name="password"
                  autoComplete="new-password"
                  label={intl.formatMessage({
                    id: 'SignupForm.passwordLabel',
                  })}
                  placeholder={intl.formatMessage({
                    id: 'SignupForm.passwordPlaceholder',
                  })}
                  validate={passwordValidators}
                />

                <UserFieldPhoneNumber
                  formName="SignupForm"
                  className={css.row}
                  userTypeConfig={userTypeConfig}
                  intl={intl}
                />
              </div>
            ) : null}
            {/* Render the pub_role field separately if it exists */}
            {roleSpecificField ? (
              <div className={css.customFields}>
                <CustomExtendedDataField {...roleSpecificField} formId={formId} />
              </div>
            ) : null}
            {userType === 'provider' ? (
              <ImageUploader
                label={
                  pub_role === 'company'
                    ? intl.formatMessage({ id: 'SignupForm.companyNib' })
                    : intl.formatMessage({ id: 'SignupForm.idDocument' })
                }
                columns={1}
                dropzoneHeight="100px"
                labelText=""
                maxImages={1}
                onProfileChange={pub_role === 'company' ? handleCompanyDocument : handleIdDocument}
              />
            ) : null}
            {/* Render all other custom fields except pub_role */}
            {otherUserFields.length > 0 ? (
              <div className={css.customFields}>
                {otherUserFields.map(({ key, ...fieldProps }) => (
                  <CustomExtendedDataField key={key} {...fieldProps} formId={formId} />
                ))}
              </div>
            ) : null}
            {userType === 'provider' && pub_role && pub_role !== 'company' ? (
              <ImageUploader
                label={intl.formatMessage({ id: 'SignupForm.selfieDocument' })}
                columns={1}
                dropzoneHeight="100px"
                labelText=""
                maxImages={1}
                onProfileChange={handleSelfieDocument}
              />
            ) : null}
            <div className={css.bottomWrapper}>
              {termsAndConditions}
              <PrimaryButton type="submit" inProgress={submitInProgress} disabled={submitDisabled}>
                <FormattedMessage id="SignupForm.signUp" />
              </PrimaryButton>
            </div>
          </div>
        </Form>
      );
    }}
  />
);

/**
 * A component that renders the signup form.
 *
 * @component
 * @param {Object} props
 * @param {string} props.rootClassName - The root class name that overrides the default class css.root
 * @param {string} props.className - The class that extends the root class
 * @param {string} props.formId - The form id
 * @param {boolean} props.inProgress - Whether the form is in progress
 * @param {ReactNode} props.termsAndConditions - The terms and conditions
 * @param {string} props.preselectedUserType - The preselected user type
 * @param {propTypes.userTypes} props.userTypes - The user types
 * @param {propTypes.listingFields} props.userFields - The user fields
 * @returns {JSX.Element}
 */
const SignupForm = props => {
  const intl = useIntl();
  return <SignupFormComponent {...props} intl={intl} />;
};

export default SignupForm;
