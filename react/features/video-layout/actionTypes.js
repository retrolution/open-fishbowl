/**
 * The type of the action which sets the list of known participant IDs which
 * have an active screen share.
 *
 * @returns {{
 *     type: SCREEN_SHARE_PARTICIPANTS_UPDATED,
 *     participantIds: Array<string>
 * }}
 */
export const SCREEN_SHARE_PARTICIPANTS_UPDATED
    = 'SCREEN_SHARE_PARTICIPANTS_UPDATED';

/**
 * The type of the action which enables or disables the feature for showing
 * video thumbnails in a two-axis tile view.
 *
 * @returns {{
 *     type: SET_TILE_VIEW,
 *     enabled: boolean
 * }}
 */
export const SET_TILE_VIEW = 'SET_TILE_VIEW';


/**
 * The type of the action which enables or disables the feature for showing
 * video table
 *
 * @returns {{
    *     type: SET_TABLE_VIEW,
    *     enabled: boolean
    * }}
*/
export const SET_TABLE_VIEW = 'SET_TABLE_VIEW';


/**
 * The number of seats to the table
 * video table
 *
 * @returns {{
    *     type: SET_TABLE_VIEW,
    *     enabled: boolean
    * }}
*/
export const SET_TABLE_VIEW_SEATS = 'SET_TABLE_VIEW_SEATS';


/**
 * The flag to enable or not the table view mutting
 * video table
 *
 * @returns {{
    *     type: ENABLE_TABLE_VIEW_MUTTING,
    *     enabled: boolean
    * }}
*/
export const ENABLE_TABLE_VIEW_MUTTING = 'ENABLE_TABLE_VIEW_MUTTING';

/**
 * Used when moderator force a seat position
 *
 * @returns {{
    *  type: FORCE_SEAT_POSITION,
    *  participant: Object
    * }}
 */
export const FORCE_SEAT_POSITION = 'FORCE_SEAT_POSITION';
