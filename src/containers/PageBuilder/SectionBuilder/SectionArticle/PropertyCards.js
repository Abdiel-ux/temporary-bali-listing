import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from './PropertyCards.module.css';
import IconCollection from '../../../../components/IconCollection/IconCollection';
import useDisableBodyScrollOnSwipe from '../../../../util/useDisableBodyScrollOnSwipe';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { types as sdkTypes } from '../../../../util/sdkLoader';
import { getListingsById } from '../../../../ducks/marketplaceData.duck';
import { fetchFeaturedListings } from '../../../LandingPage/LandingPage.duck';
import { NamedLink } from '../../../../components/NamedLink/NamedLink';
import { sortTags, capitaliseFirstLetter } from '../../../../util/helper';
import { createSlug } from '../../../../util/urlHelpers';
import { useHistory, useLocation } from 'react-router-dom';
import { handleToggleFavorites, isFavorite as isFavoriteUtil } from '../../../../util/userFavorites';
import { updateProfile } from '../../../ProfileSettingsPage/ProfileSettingsPage.duck';
import { useRouteConfiguration } from '../../../../context/routeConfigurationContext';
import classNames from 'classnames';
import { FormattedMessage, useIntl } from 'react-intl';
import ImageSlider from '../../../../components/ImageSlider/ImageSlider';

const { LatLng: SDKLatLng, LatLngBounds: SDKLatLngBounds } = sdkTypes;

const formatPriceInMillions = actualPrice => {
  if (!actualPrice) return null;

  // Check if the price is in millions (1,000,000 or more)
  if (actualPrice >= 1000000) {
    const millions = actualPrice / 1000000;
    // If it's a whole number, show without decimal
    if (millions % 1 === 0) {
      return `${millions}M`;
    } else {
      // Show with one decimal place for partial millions
      return `${millions.toFixed(1)}M`;
    }
  }

  // For smaller amounts, show the actual price
  return `${actualPrice.toLocaleString()}`;
};

export const Icon = ({ type }) => {
  // Use emoji for demo, replace with SVG/icon in real app
  switch (type) {
    case 'bed':
      return (
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clip-path="url(#clip0_2022_280)">
            <path
              d="M0.650593 7.01098C0.655585 7.01049 0.745093 7.00048 0.750085 6.99999L11.2891 7.004C11.2936 7.00449 11.3446 7.01049 11.3496 7.01101C11.3561 7.0115 11.3626 7.0115 11.3691 7.0115C11.3726 7.0115 11.3766 7.01199 11.3791 7.0115C11.5171 7.0115 11.6291 6.89949 11.6291 6.76149C11.6291 6.71098 11.6146 6.66448 11.5891 6.62548L11.0001 4.71298V1.74999C11.0001 1.061 10.4396 0.5 9.75008 0.5H2.25009C1.56058 0.5 1.00009 1.061 1.00009 1.74999V4.71298L0.392101 6.68848C0.367609 6.76749 0.383593 6.85398 0.435601 6.91798C0.487585 6.98199 0.568093 7.01649 0.650593 7.01098ZM1.75009 4.49998H2.17959L2.41258 3.56799C2.49658 3.23349 2.79608 2.99998 3.14059 2.99998H4.75009C5.1636 2.99998 5.50009 3.33648 5.50009 3.74998V4.49998H6.5001V3.74998C6.5001 3.33648 6.83659 2.99998 7.2501 2.99998H8.8596C9.20411 2.99998 9.50359 3.23349 9.58759 3.56799L9.82058 4.49998H10.2501C10.3881 4.49998 10.5001 4.61199 10.5001 4.74999C10.5001 4.88799 10.3881 5 10.2501 5H9.81257C9.78606 5.075 9.75156 5.147 9.70108 5.21199C9.55757 5.39499 9.34208 5.49999 9.10958 5.49999H7.25008C6.92458 5.49999 6.64958 5.29048 6.54608 5H5.45408C5.35058 5.29051 5.07559 5.49999 4.75009 5.49999H2.89059C2.65809 5.49999 2.44258 5.39499 2.29909 5.21199C2.24859 5.14749 2.21409 5.075 2.1876 5H1.75009C1.61209 5 1.50009 4.88799 1.50009 4.74999C1.50009 4.61199 1.61209 4.49998 1.75009 4.49998Z"
              fill="#231F20"
            />
            <path
              d="M11.25 7.5H0.75C0.336492 7.5 0 7.83649 0 8.25V11.25C0 11.388 0.112008 11.5 0.250008 11.5H1.25002C1.38799 11.5 1.5 11.388 1.5 11.25V10.5H10.5V11.25C10.5 11.388 10.612 11.5 10.75 11.5H11.75C11.888 11.5 12 11.388 12 11.25V8.25C12 7.83649 11.6635 7.5 11.25 7.5Z"
              fill="#231F20"
            />
          </g>
          <defs>
            <clipPath id="clip0_2022_280">
              <rect width="12" height="12" fill="white" />
            </clipPath>
          </defs>
        </svg>
      );
    case 'bath':
      return (
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clip-path="url(#clip0_2022_288)">
            <path
              d="M9.16406 5.74219C9.16406 5.35448 8.84864 5.03906 8.46094 5.03906H7.75781C7.37011 5.03906 7.05469 5.35448 7.05469 5.74219V8.20312H9.16406V5.74219Z"
              fill="#231F20"
            />
            <path
              d="M1.42969 1.75781C1.42969 1.17633 1.90289 0.703125 2.48438 0.703125H3.1875C3.66267 0.703125 4.06537 1.01916 4.19681 1.452C3.41817 1.63252 2.83594 2.33133 2.83594 3.16406V3.51562H6.35156V3.16406C6.35156 2.30466 5.73148 1.58782 4.91531 1.43625C4.76374 0.620016 4.04681 0 3.1875 0H2.48438C1.51523 0 0.726562 0.788437 0.726562 1.75781V5.03906H1.42969V1.75781Z"
              fill="#231F20"
            />
            <path
              d="M9.86719 8.90625H6.35156V7.85156H0.726562V8.90625C0.726562 9.8262 1.23398 10.6297 1.98356 11.0519L1.53267 11.5028L2.02983 12L2.7094 11.3204C2.86411 11.351 3.02395 11.3672 3.1875 11.3672H8.8125C8.97605 11.3672 9.13589 11.351 9.2906 11.3204L9.97017 12L10.4674 11.5028L10.0165 11.0519C10.766 10.6297 11.2734 9.8262 11.2734 8.90625V7.85156H9.86719V8.90625Z"
              fill="#231F20"
            />
            <path
              d="M11.2969 5.74219H9.86719V7.14844H11.2969C11.6845 7.14844 12 6.83297 12 6.44531C12 6.05766 11.6845 5.74219 11.2969 5.74219Z"
              fill="#231F20"
            />
            <path
              d="M6.35156 5.74219H0.703125C0.315469 5.74219 0 6.05766 0 6.44531C0 6.83297 0.315469 7.14844 0.703125 7.14844H6.35156V5.74219Z"
              fill="#231F20"
            />
          </g>
          <defs>
            <clipPath id="clip0_2022_288">
              <rect width="12" height="12" fill="white" />
            </clipPath>
          </defs>
        </svg>
      );
    case 'area':
      return (
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clip-path="url(#clip0_2022_296)">
            <path
              d="M10.8462 1.47231L9.92315 1.01077V0H7.61546V1.01077L6.69238 1.47231V2.30769H10.8462V1.47231Z"
              fill="#231F20"
            />
            <path
              d="M10.3846 8.30774H7.15381V10.3847H10.3846V8.30774ZM9.23073 9.00005H8.30765V8.53851H9.23073V9.00005Z"
              fill="#231F20"
            />
            <path
              d="M1.61523 10.6153H5.53831V9.23071H1.61523V10.6153ZM2.99985 9.69225H3.92293V10.1538H2.99985V9.69225Z"
              fill="#231F20"
            />
            <path
              d="M1.61523 8.76926H5.53831V7.38464H1.61523V8.76926ZM2.99985 7.84618H3.92293V8.30772H2.99985V7.84618Z"
              fill="#231F20"
            />
            <path
              d="M1.38469 3.27225C1.23072 3.32669 1.10095 3.43381 1.01831 3.57467C0.935681 3.71553 0.905506 3.88108 0.933122 4.04204C0.960739 4.203 1.04437 4.34901 1.16923 4.45428C1.29409 4.55954 1.45215 4.61727 1.61546 4.61727C1.77877 4.61727 1.93683 4.55954 2.06169 4.45428C2.18655 4.34901 2.27018 4.203 2.2978 4.04204C2.32541 3.88108 2.29524 3.71553 2.21261 3.57467C2.12997 3.43381 2.0002 3.32669 1.84623 3.27225V1.15379H3.92315V2.09764C3.58083 2.1555 3.27274 2.33985 3.05993 2.61416C2.84712 2.88847 2.74512 3.23271 2.77416 3.57868C2.80319 3.92464 2.96113 4.24707 3.21668 4.48207C3.47223 4.71708 3.80674 4.8475 4.15392 4.8475C4.5011 4.8475 4.83561 4.71708 5.09116 4.48207C5.34671 4.24707 5.50465 3.92464 5.53369 3.57868C5.56272 3.23271 5.46073 2.88847 5.24792 2.61416C5.03511 2.33985 4.72701 2.1555 4.38469 2.09764V1.15379H5.53854V0.692251H4.38469V0.230713H3.92315V0.692251H1.84623V0.230713H1.38469V0.692251H0.692383V1.15379H1.38469V3.27225Z"
              fill="#231F20"
            />
            <path
              d="M12 5.76921H9.92308V5.0769H9V5.53844H9.46154V5.76921H8.07692V5.53844H8.53846V5.0769H7.61538V5.76921H0V6.23075H0.230769V12H11.7692V6.23075H12V5.76921ZM1.15385 6.92306H6V11.0769H1.15385V6.92306ZM10.8462 10.8461H6.69231V7.84614H10.8462V10.8461ZM8.88462 6.69229C8.95308 6.69229 9.02 6.71259 9.07693 6.75063C9.13385 6.78866 9.17822 6.84272 9.20442 6.90598C9.23062 6.96923 9.23747 7.03883 9.22412 7.10597C9.21076 7.17312 9.17779 7.2348 9.12938 7.28321C9.08097 7.33162 9.01929 7.36459 8.95215 7.37794C8.885 7.3913 8.8154 7.38445 8.75215 7.35825C8.6889 7.33205 8.63484 7.28768 8.5968 7.23076C8.55876 7.17383 8.53846 7.10691 8.53846 7.03844C8.53846 6.94664 8.57493 6.85859 8.63985 6.79367C8.70476 6.72876 8.79281 6.69229 8.88462 6.69229ZM10.0385 6.69229C10.1069 6.69229 10.1738 6.71259 10.2308 6.75063C10.2877 6.78866 10.3321 6.84272 10.3583 6.90598C10.3845 6.96923 10.3913 7.03883 10.378 7.10597C10.3646 7.17312 10.3316 7.2348 10.2832 7.28321C10.2348 7.33162 10.1731 7.36459 10.106 7.37794C10.0388 7.3913 9.96925 7.38445 9.90599 7.35825C9.84274 7.33205 9.78868 7.28768 9.75065 7.23076C9.71261 7.17383 9.69231 7.10691 9.69231 7.03844C9.69231 6.94664 9.72878 6.85859 9.79369 6.79367C9.85861 6.72876 9.94666 6.69229 10.0385 6.69229Z"
              fill="#231F20"
            />
          </g>
          <defs>
            <clipPath id="clip0_2022_296">
              <rect width="12" height="12" fill="white" />
            </clipPath>
          </defs>
        </svg>
      );
    case 'pool':
      return (
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clip-path="url(#clip0_2022_306)">
            <path
              d="M10.828 4.55826C10.4648 4.1992 10.0436 3.91901 9.58619 3.72637V4.81106C9.58619 5.00487 9.42871 5.16218 9.23467 5.16218C9.04063 5.16218 8.88316 5.00489 8.88316 4.81106V3.50564C8.61271 3.44782 8.33409 3.41833 8.05122 3.41833C7.85718 3.41833 7.66572 3.43214 7.47707 3.45954V4.81106C7.47707 5.00487 7.31959 5.16218 7.12556 5.16218C6.93152 5.16218 6.77404 5.00489 6.77404 4.81106V3.62925C6.62524 3.68004 6.47899 3.73997 6.33557 3.80925C5.28053 4.33357 4.10739 4.49648 2.97761 4.38975C1.36178 4.35579 -0.0548509 5.79087 0.00163344 7.40456C-0.00844468 8.96791 1.38077 10.3504 2.94574 10.3349C3.96374 10.2523 4.98175 10.3445 5.98895 10.7649C6.66131 11.0844 7.36481 11.3381 8.12362 11.3058C10.2862 11.2672 12.0248 9.47702 11.9997 7.31562C11.9875 6.2719 11.5713 5.29254 10.828 4.55826ZM8.3207 8.79635H8.31906C8.00927 8.79471 7.7182 8.67206 7.49908 8.45109C7.35379 8.29451 7.11053 8.25963 6.92985 8.37197V8.37173C6.89329 8.39351 6.85931 8.42159 6.82977 8.45318C6.60784 8.67602 6.31328 8.79797 6.00065 8.79633C5.68804 8.79797 5.39345 8.67602 5.17152 8.45318C5.14199 8.42159 5.10801 8.39348 5.07145 8.37173V8.37197C4.89077 8.25961 4.64751 8.29448 4.50222 8.45109C4.2831 8.67206 3.99206 8.79471 3.68224 8.79635H3.68059C3.48726 8.79635 3.33002 8.64023 3.32908 8.44687C3.32814 8.25284 3.48468 8.09505 3.67895 8.09414C3.80456 8.09367 3.92315 8.04101 4.01078 7.94878C4.33277 7.62342 4.81577 7.51716 5.24299 7.67773C5.31072 7.70255 5.37726 7.73508 5.4396 7.7737V7.77347C5.52374 7.82473 5.602 7.88747 5.67114 7.95909C5.75974 8.04734 5.87737 8.09601 6.00063 8.09393C6.12388 8.09604 6.24154 8.04736 6.33011 7.95909C6.39925 7.88747 6.47751 7.82473 6.56165 7.77347V7.7737C6.62399 7.73508 6.69053 7.70255 6.75827 7.67773C7.18549 7.51716 7.66846 7.62342 7.99047 7.94878C8.07836 8.04101 8.1967 8.09367 8.3223 8.09414C8.51657 8.09508 8.67311 8.25284 8.67217 8.44687C8.67131 8.64021 8.51404 8.79635 8.3207 8.79635ZM8.3207 7.12158H8.31906C8.00927 7.11994 7.7182 6.99729 7.49908 6.77632C7.35379 6.61973 7.11053 6.5... [truncated]"
              fill="#231F20"
            />
            <path
              d="M10.3125 1.04252C10.3125 1.23633 10.1551 1.39364 9.96103 1.39364H9.93759C9.74379 1.39364 9.58607 1.55116 9.58607 1.74476V3.7264C9.35969 3.63112 9.12464 3.55716 8.88304 3.50566V2.70443H7.47696V3.45954C7.23745 3.49395 7.00263 3.55059 6.77393 3.62925V1.74473C6.77393 1.164 7.24708 0.691406 7.8285 0.691406C8.02254 0.691406 8.18001 0.848695 8.18001 1.04252C8.18001 1.23635 8.02254 1.39364 7.8285 1.39364C7.63469 1.39364 7.47698 1.55116 7.47698 1.74476V2.00224H8.88307V1.74473C8.88307 1.164 9.35622 0.691406 9.93764 0.691406H9.96107C10.1551 0.691406 10.3125 0.848695 10.3125 1.04252Z"
              fill="#231F20"
            />
          </g>
          <defs>
            <clipPath id="clip0_2022_306">
              <rect width="12" height="12" fill="white" />
            </clipPath>
          </defs>
        </svg>
      );
    case 'land':
      return (
        <svg
          width="11"
          height="11"
          viewBox="0 0 11 11"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0.965918 9.6084L1.79815 8.77618L2.26969 9.24772C2.32689 9.30493 2.40188 9.33354 2.47684 9.33354C2.5518 9.33354 2.6268 9.30493 2.68398 9.24772C2.7984 9.13333 2.7984 8.94782 2.68398 8.8334L2.21244 8.36186L2.67834 7.89596L3.14988 8.36751C3.20709 8.42471 3.28207 8.45333 3.35703 8.45333C3.43199 8.45333 3.50699 8.42471 3.56418 8.36751C3.67859 8.25311 3.67859 8.0676 3.56418 7.95319L3.09264 7.48165L3.55854 7.01575L4.03008 7.48729C4.08729 7.5445 4.16227 7.57311 4.23725 7.57311C4.31223 7.57311 4.38721 7.5445 4.44439 7.48729C4.55881 7.3729 4.55881 7.18739 4.44439 7.07297L3.97285 6.60143L4.43875 6.13553L4.91029 6.60708C4.9675 6.66428 5.04248 6.6929 5.11744 6.6929C5.19242 6.6929 5.2674 6.6643 5.32461 6.60708C5.439 6.49266 5.439 6.30717 5.32461 6.19276L4.85307 5.72122L5.3175 5.25678L5.78906 5.72835C5.84627 5.78555 5.92125 5.81417 5.99621 5.81417C6.07117 5.81417 6.14617 5.78555 6.20336 5.72835C6.31777 5.61395 6.31777 5.42844 6.20336 5.31403L5.7318 4.84247L6.1977 4.37657L6.66926 4.84813C6.72646 4.90534 6.80145 4.93395 6.87641 4.93395C6.95137 4.93395 7.02637 4.90534 7.08355 4.84813C7.19797 4.73374 7.19797 4.54823 7.08355 4.43381L6.61199 3.96225L7.07789 3.49635L7.54943 3.9679C7.60664 4.0251 7.68162 4.05372 7.75658 4.05372C7.83154 4.05372 7.90654 4.0251 7.96373 3.9679C8.07814 3.8535 8.07814 3.66799 7.96373 3.55358L7.49219 3.08202L7.9582 2.61612L8.42975 3.08766C8.48695 3.14487 8.56193 3.17348 8.63689 3.17348C8.71186 3.17348 8.78686 3.14487 8.84404 3.08766C8.95846 2.97327 8.95846 2.78776 8.84404 2.67335L8.3725 2.2018L8.8384 1.7359L9.30998 2.20745C9.36719 2.26465 9.44217 2.29327 9.51713 2.29327C9.59209 2.29327 9.66709 2.26465 9.72428 2.20745C9.83869 2.09305 9.83869 1.90754 9.72428 1.79313L9.25275 1.32159L10.0835 0.490826C10.3612 0.21315 10.8359 0.40981 10.8359 0.802486V9.92006C10.8359 10.1635 10.6386 10.3608 10.3952 10.3608H1.2776C0.884902 10.3608 0.688242 9.88608 0.965918 9.6084ZM5.68762 8.59778H8.8525C8.97422 8.59778 9.07289 8.49911 9.07289 8.37739V5.21252C9.07289 5.016... [truncated]"
            fill="#231F20"
          />
        </svg>
      );
    case 'zone':
      return (
        <svg
          width="11"
          height="11"
          viewBox="0 0 11 11"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clip-path="url(#clip0_2433_19073)">
            <path
              d="M10.6656 10.5296L10.2 8.54834C9.63594 9.55771 8.73125 10.3218 7.67188 10.7218H10.5141C10.5625 10.7218 10.6062 10.6999 10.6359 10.6624C10.6656 10.6249 10.6766 10.5765 10.6656 10.5296Z"
              fill="#231F20"
            />
            <path
              d="M3.7875 5.41543L4.02656 5.09668H2.07344C2.00156 5.09668 1.9375 5.14668 1.92187 5.21699L1.53125 6.87793C2.3625 6.68418 3.34844 6.06543 3.78906 5.41543H3.7875Z"
              fill="#231F20"
            />
            <path
              d="M5.67188 7.59668C5.84375 7.59668 5.98438 7.45605 5.98438 7.28418V1.03418C5.98438 0.862305 5.84375 0.72168 5.67188 0.72168C5.5 0.72168 5.35938 0.862305 5.35938 1.03418V7.28418C5.35938 7.45605 5.5 7.59668 5.67188 7.59668Z"
              fill="#231F20"
            />
            <path
              d="M10.0745 8.10918L10.0901 8.07637L9.75728 6.65918H9.35884C8.72603 6.65918 8.1104 6.77793 7.53853 7.00293C7.64478 7.13574 7.70259 7.28418 7.70259 7.44043C7.70259 8.05449 6.8104 8.53418 5.67134 8.53418C5.5729 8.53418 5.47759 8.52949 5.38384 8.52324C4.47759 9.24199 3.36665 9.64355 2.19478 9.66387L0.874464 9.68574L0.676027 10.5295C0.665089 10.5764 0.676027 10.6248 0.705714 10.6623C0.735402 10.6998 0.780714 10.7217 0.827589 10.7217H5.96978C7.72134 10.7217 9.33228 9.69668 10.0745 8.10918Z"
              fill="#231F20"
            />
            <path
              d="M8.08125 5.09668C7.65781 5.59355 7.14531 6.05293 6.57812 6.46074C6.85469 6.53418 7.09375 6.64043 7.27969 6.77012C7.92656 6.49355 8.62969 6.34824 9.35469 6.34824H9.67969L9.41406 5.21855C9.39687 5.14824 9.33437 5.09824 9.2625 5.09824H8.08281L8.08125 5.09668Z"
              fill="#231F20"
            />
            <path
              d="M4.94687 8.46211C4.43437 8.35898 4.02812 8.14961 3.8125 7.88086C2.93281 8.1793 2.03437 8.3543 1.18906 8.3668L0.953125 9.36992L2.19375 9.34961C3.19219 9.33242 4.14219 9.02148 4.94687 8.46211Z"
              fill="#231F20"
            />
            <path
              d="M3.64062 7.44043C3.64062 6.94512 4.22344 6.5373 5.04688 6.39824V5.09668H4.42188L4.04688 5.59668C3.53906 6.34824 2.39844 7.04355 1.45625 7.2123L1.25781 8.05449C2.03437 8.03418 2.85625 7.87324 3.66406 7.60449C3.65 7.55137 3.63906 7.49668 3.63906 7.44043H3.64062Z"
              fill="#231F20"
            />
            <path
              d="M7.67031 5.09668H6.29688V6.27949C6.80469 5.92324 7.27344 5.52793 7.67031 5.09668Z"
              fill="#231F20"
            />
            <path
              d="M5.04688 6.7168C4.38125 6.8418 3.95312 7.1543 3.95312 7.44023C3.95312 7.80898 4.65938 8.22148 5.67188 8.22148C6.68438 8.22148 7.39062 7.80898 7.39062 7.44023C7.39062 7.15273 6.9625 6.8418 6.29688 6.7168V7.28398C6.29688 7.6293 6.01719 7.90898 5.67188 7.90898C5.32656 7.90898 5.04688 7.6293 5.04688 7.28398V6.7168Z"
              fill="#231F20"
            />
            <path
              d="M9.24531 3.2998L8.66406 2.28418L9.24531 1.26855C9.30469 1.16387 9.22969 1.03418 9.10938 1.03418H6.29688V3.53418H9.10938C9.22969 3.53418 9.30469 3.40449 9.24531 3.2998Z"
              fill="#231F20"
            />
          </g>
          <defs>
            <clipPath id="clip0_2433_19073">
              <rect width="10" height="10" fill="white" transform="translate(0.671875 0.72168)" />
            </clipPath>
          </defs>
        </svg>
      );
    default:
      return null;
  }
};

const tabList = [
  { id: 'canggu', label: 'Canggu' },
  { id: 'ubud', label: 'Ubud' },
  { id: 'seminyak', label: 'Seminyak' },
  { id: 'sanur', label: 'Sanur' },
  { id: 'jimbaran', label: 'Jimbaran' },
];

export const customLocationBounds = [
  {
    id: 'canggu',
    bounds: new SDKLatLngBounds(
      new SDKLatLng(-8.57966544, 115.17228623),
      new SDKLatLng(-8.67330673, 115.09845393)
    ),
  },
  {
    id: 'ubud',
    bounds: new SDKLatLngBounds(
      new SDKLatLng(-8.44879721, 115.30985518),
      new SDKLatLng(-8.58531967, 115.20224382)
    ),
  },
  {
    id: 'sanur',
    bounds: new SDKLatLngBounds(
      new SDKLatLng(-8.65920685, 115.26954166),
      new SDKLatLng(-8.71088816, 115.22878674)
    ),
  },
  {
    id: 'seminyak',
    bounds: new SDKLatLngBounds(
      new SDKLatLng(-8.64217254, 115.19883816),
      new SDKLatLng(-8.71787404, 115.13914216)
    ),
  },
  {
    id: 'jimbaran',
    bounds: new SDKLatLngBounds(
      new SDKLatLng(-8.754441, 115.20630051),
      new SDKLatLng(-8.85126784, 115.12992051)
    ),
  },
];

const PropertyCards = () => {
  const { featuredListingIds, featuredListingsInProgress } = useSelector(state => state.LandingPage, shallowEqual);
  const currentUser = useSelector(state => state.user.currentUser, shallowEqual);
  const entities = useSelector(state => state.marketplaceData.entities, shallowEqual);
  const listings = getListingsById(entities, featuredListingIds);
  const USDConversionRate = useSelector(state => state.currency.conversionRate?.USD);
  const selectedCurrency = useSelector(state => state.currency.selectedCurrency);
  const needPriceConversion = selectedCurrency === 'USD';

  const [activeTab, setActiveTab] = useState('canggu');
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  const tabRefs = useRef([]);
  const dispatch = useDispatch();
  const intl = useIntl();
  const history = useHistory();
  const routeLocation = useLocation();
  const routes = useRouteConfiguration();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const idx = tabList.findIndex(tab => tab.id === activeTab);
      if (tabRefs.current[idx]) {
        const node = tabRefs.current[idx];
        setUnderlineStyle({
          left: node.offsetLeft,
          width: node.offsetWidth,
        });
      }
    }, 10);

    return () => clearTimeout(timeoutId);
  }, [activeTab]);

  return (
    <div className={styles.container}>
      <div className={styles.tabs} style={{ position: 'relative' }}>
        {tabList.map((tab, i) => (
          <button
            key={tab.id}
            ref={el => (tabRefs.current[i] = el)}
            className={
              activeTab === tab.id
                ? styles.tab + ' ' + styles.tabActive + ' ' + styles.tabBump
                : styles.tab
            }
            onClick={e => {
              setActiveTab(tab.id);
              // Add bump animation
              if (tabRefs.current[i]) {
                tabRefs.current[i].classList.remove(styles.tabBump);
                void tabRefs.current[i].offsetWidth; // force reflow
                tabRefs.current[i].classList.add(styles.tabBump);
              }
              const location = customLocationBounds.find(elm => elm.id === tab.id);
              dispatch(fetchFeaturedListings({ bounds: location.bounds }));
            }}
            type="button"
          >
            {tab.label}
          </button>
        ))}
        <span
          className={styles.tabUnderline}
          style={{
            left: underlineStyle.left,
            width: underlineStyle.width,
            transition: 'left 0.3s cubic-bezier(.4,0,.2,1), width 0.3s cubic-bezier(.4,0,.2,1)',
          }}
        />
      </div>
      <div className={styles.cardsWrapper}>
        {featuredListingsInProgress ? (
          'Loading..'
        ) : (
          <>
            {listings?.map((card, idx) => {
              const { attributes, images, author } = card;
              const imagesUrls = images.map(
                img => img.attributes.variants['featured-listing']?.url
              );
              const {
                title,
                description,
                price: p,
                publicData: {
                  pricee,
                  location,
                  propertytype,
                  bedrooms,
                  bathrooms,
                  landzone,
                  landsize,
                  categoryLevel1,
                  weekprice,
                  monthprice,
                  yearprice,
                  Freehold,
                },
              } = attributes;

              const tags = sortTags(pricee);
              const isRentals = categoryLevel1 === 'rentalvillas';
              const isLand = categoryLevel1 === 'landforsale';

              let price;

              if (isRentals) {
                if (pricee.includes('monthly')) {
                  price = monthprice;
                } else if (pricee.includes('weekly')) {
                  price = weekprice;
                } else if (pricee.includes('yearly')) {
                  price = yearprice;
                }
              } else {
                price = p.amount / 100;
              }

              if (needPriceConversion) {
                price = price * USDConversionRate;
              }

              const isFavorite = isFavoriteUtil(currentUser, card.id.uuid);
              const onToggleFavorites = e => {
                e.preventDefault();
                e.stopPropagation();
                handleToggleFavorites({
                  currentUser,
                  history,
                  location: routeLocation,
                  routes,
                  params: { id: card.id.uuid },
                  onUpdateFavorites: payload => dispatch(updateProfile(payload)),
                })(isFavorite);
              };

              return (
                <NamedLink
                  className={styles.card}
                  name="ListingPage"
                  params={{
                    id: card.id.uuid,
                    slug: createSlug(title),
                  }}
                  key={card.id.uuid}
                >
                  <div className={styles.imageWrapper}>
                    <ImageSlider loop={images.length > 1} images={imagesUrls} title={title} buttonSize='large'/>
                    <button 
                      className={classNames(styles.wishlistButton, isFavorite ? styles.active : '')} 
                      onClick={onToggleFavorites}>
                      <IconCollection name="icon-waislist" />
                    </button>
                  </div>
                  <div className={styles.cardDetails}>
                    <div className={styles.cardDetailsTop}>
                      <div className={styles.tags}>
                        {tags?.map(tag => (
                          <span className={styles.tag} key={tag}>
                            {intl.formatMessage({ id: tag })}
                          </span>
                        ))}
                        {!!Freehold && (
                          <span className={styles.tag}>{capitaliseFirstLetter(Freehold)}</span>
                        )}
                        <NamedLink
                          className={styles.listedBy}
                          name="ProfilePage"
                          params={{ id: author.id.uuid }}
                        >
                          <span className={styles.listedBy}>
                            {intl.formatMessage({ id: 'ListingPage.aboutProviderTitle'})}:{' '}
                            <span className={styles.listedByName}>
                              {author.attributes.profile.displayName}
                            </span>
                          </span>
                        </NamedLink>
                      </div>
                      <div className={styles.title}>{title}</div>
                    </div>
                    <div className={styles.cardDetailsBottom}>
                      <div className={styles.location}>
                        {propertytype && (
                          <>
                            <span className={styles.typeIcon}>
                              <IconCollection name="typeIcon" />
                            </span>
                            <span className={styles.type}>{capitaliseFirstLetter(propertytype)}</span>
                          </>
                        )}
                        <span className={styles.locationWrapper}>
                          <span className={styles.locationIcon}>
                            <IconCollection name="locationIcon" />
                          </span>
                          {location?.address}
                        </span>
                      </div>
                      <div className={styles.bottomContent}>
                        <div className={styles.icons}>
                          {!!bedrooms && (
                            <span className={styles.iconItem}>
                              <Icon type="bed" /> {bedrooms} {intl.formatMessage({ id: 'ListingCard.bedroom' }, { count: bedrooms })}
                            </span>
                          )}
                          {!!bathrooms && (
                            <span className={styles.iconItem}>
                              <Icon type="bath" /> {bathrooms} {intl.formatMessage({ id: 'ListingCard.bathroom' }, { count: bathrooms })}
                            </span>
                          )}
                          {!!landsize && isLand && (
                            <span className={styles.iconItem}>
                              <Icon type="land" /> {landsize} m2
                            </span>
                          )}
                          {!!landzone && isLand && (
                            <span className={styles.iconItem}>
                              <Icon type="zone" /> {landzone} Zone
                            </span>
                          )}
                        </div>
                        <div className={styles.price}>
                          <span className={styles.priceValue}>
                            {formatPriceInMillions(price)} {needPriceConversion ? "USD" : "IDR"}
                          </span>
                          {isRentals && (
                            <span className={styles.priceUnit}>
                              {monthprice 
                                ? '/ ' + intl.formatMessage({ id: 'ListingCard.monthly' }) 
                                : weekprice 
                                ? '/ ' + intl.formatMessage({ id: 'ListingCard.weekly' }) 
                                : '/ ' + intl.formatMessage({ id: 'ListingCard.yearly' })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </NamedLink>
              );
            })}
          </>
        )}
      </div>
      <button
        className={styles.browseAllButton}
        onClick={() => history.push('/s?pub_categoryLevel1=rentalvillas')}
      >
        <FormattedMessage id="FeaturedListing.browseAllListings" />
      </button>
    </div>
  );
};

export default PropertyCards;