import React from 'react';
import { Form as FinalForm } from 'react-final-form';
import classNames from 'classnames';

import { FormattedMessage, useIntl } from '../../../util/reactIntl';

import { Form, PrimaryButton } from '../..';

import css from './InquiryWithoutPaymentForm.module.css';

const renderForm = formRenderProps => {
  // FormRenderProps from final-form
  const {
    formId,
    className,
    rootClassName,
    handleSubmit,
    agentorowner,
    handleWhatsappClick,
    contacting,
  } = formRenderProps;
  const classes = classNames(rootClassName || css.root, className);

  return (
    <Form id={formId} onSubmit={handleSubmit} className={classes}>
      <div className={css.submitButton}>
        <PrimaryButton
          type="button"
          className={css.button}
          onClick={handleWhatsappClick}
          disabled={contacting}
        >
          {contacting ? (
            'Added to favorite list'
          ) : (
            <>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M14.8651 13.403C14.4109 13.5886 14.1208 14.2997 13.8264 14.663C13.6754 14.8491 13.4954 14.8781 13.2634 14.7848C11.5586 14.1056 10.2517 12.968 9.31091 11.3991C9.15153 11.1558 9.18013 10.9636 9.37231 10.7377C9.65637 10.403 10.0136 10.0228 10.0904 9.57187C10.2611 8.57438 8.957 5.48016 7.23481 6.88219C2.27919 10.9205 15.5017 21.6309 17.8881 15.8381C18.5631 14.1961 15.6179 13.0945 14.8651 13.403ZM12.0001 21.9037C10.2475 21.9037 8.52294 21.4378 7.01309 20.5556C6.77075 20.4136 6.47778 20.3761 6.20684 20.4497L2.92606 21.3502L4.06888 18.8325C4.2245 18.4898 4.18466 18.0909 3.96481 17.7863C2.74231 16.0917 2.09591 14.0911 2.09591 12C2.09591 6.53859 6.53872 2.09578 12.0001 2.09578C17.4615 2.09578 21.9039 6.53859 21.9039 12C21.9039 17.4609 17.4611 21.9037 12.0001 21.9037ZM12.0001 0C5.38325 0 0.000125453 5.38312 0.000125453 12C0.000125453 14.3278 0.661063 16.5633 1.91684 18.5034L0.0938755 22.5183C-0.0744058 22.8891 -0.0129995 23.3231 0.250438 23.632C0.452938 23.8687 0.745907 24 1.04825 24C1.72419 24 5.40997 22.8417 6.34794 22.5844C8.08184 23.512 10.0267 24 12.0001 24C18.6165 24 24.0001 18.6164 24.0001 12C24.0001 5.38312 18.6165 0 12.0001 0Z"
                  fill="white"
                />
              </svg>
              {agentorowner === 'agent' ? (
                <FormattedMessage id="OrderPanel.contactAgent" />
              ) : (
                <FormattedMessage id="OrderPanel.contactOwner" />
              )}
            </>
          )}
        </PrimaryButton>
      </div>
    </Form>
  );
};

/**
 * A form for sending an inquiry without payment.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.rootClassName] - Custom class that overrides the default class for the root element
 * @param {string} [props.className] - Custom class that extends the default class for the root element
 * @param {string} props.formId - The ID of the form
 * @param {Function} props.onSubmit - The function to handle the form submission
 * @returns {JSX.Element}
 */
const InquiryWithoutPaymentForm = props => {
  const intl = useIntl();
  const initialValues = {};

  return <FinalForm initialValues={initialValues} {...props} intl={intl} render={renderForm} />;
};

export default InquiryWithoutPaymentForm;
