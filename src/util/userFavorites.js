import { createResourceLocatorString } from './routes';

/**
 * Toggles the favorite status of a listing for the current user.
 *
 * If the user is not signed in, redirects them to the SignupPage.
 * If the listing is already a favorite, it will be removed from the favorites,
 * otherwise it will be added to the favorites.
 *
 * @param {Object} parameters - The function parameters.
 * @param {Object} parameters.currentUser - The current user object.
 * @param {Object} parameters.routes - The routing configuration.
 * @param {Object} parameters.location - The current location object.
 * @param {Object} parameters.history - The history object for navigation.
 * @param {Object} parameters.params - The parameters containing the listing id.
 * @param {Function} parameters.onUpdateFavorites - The function to update the user's favorites.
 * @returns {Function} A function that takes a boolean indicating the favorite status.
 */

export const handleToggleFavorites = parameters => isFavorite => {
  const { currentUser, routes, location, history } = parameters;

  if (!currentUser) {
    const state = {
      from: `${location.pathname}${location.search}${location.hash}`,
    };
    history.push(createResourceLocatorString('LoginPage', routes, {}, {}), state);
  } else {
    const { params, onUpdateFavorites } = parameters;
    const {
      attributes: { profile },
    } = currentUser;
    const { favorites = [] } = profile.privateData || {};

    let payload;

    if (!profile.privateData || !profile.privateData?.favorites) {
      payload = {
        privateData: {
          favorites: [params.id],
        },
      };
    } else if (isFavorite) {
      payload = {
        privateData: {
          favorites: favorites.filter(f => f !== params.id),
        },
      };
    } else {
      payload = {
        privateData: {
          favorites: [...favorites, params.id],
        },
      };
    }
    onUpdateFavorites(payload);
  }
};

/**
 * Checks if a listing is in the user's favorites.
 *
 * @param {Object} currentUser The current user object.
 * @param {String} listingId The ID of the listing to check.
 * @returns {Boolean} `true` if the listing is a favorite, `false` otherwise.
 */
export const isFavorite = (currentUser, listingId) => {
  if (!currentUser) {
    return false;
  }
  const {
    attributes: { profile },
  } = currentUser;
  const { favorites = [] } = profile.privateData || {};
  return favorites.includes(listingId);
};