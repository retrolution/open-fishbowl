// @flow

import { ReducerRegistry, PersistenceRegistry, UrlRegistry } from '../base/redux';

import {
    SCREEN_SHARE_PARTICIPANTS_UPDATED,
    SET_TILE_VIEW,
    SET_TABLE_VIEW,
    SET_TABLE_VIEW_SEATS,
    ENABLE_TABLE_VIEW_MUTTING
} from './actionTypes';

const DEFAULT_STATE = {
    screenShares: [],

    /**
     * The indicator which determines whether the video layout should display
     * video thumbnails in a tiled layout.
     *
     * Note: undefined means that the user hasn't requested anything in particular yet, so
     * we use our auto switching rules.
     *
     * @public
     * @type {boolean}
     */
    tileViewEnabled: true,

    /**
     * The indicator which determines whether the video layout should display
     * a table width video thumbnail
     *
     * @public
     * @type {boolean}
     */
    tableViewEnabled: true,


    /**
     * The number of seat available at the table
     * can be  modified  by moderator
     * Default is 3
     *
     * @public
     * @type {integer}
     */

    tableViewSeats: 3,


    /**
     * A flag indicating whether the mutting is active or not
     * will be toggled by the moderator
     * default is false
     *
     * @public
     * @type {boolean}
     */

    isTableViewMuttingEnabled: false,

    __prevTileView: false,
};

const STORE_NAME = 'features/video-layout';

PersistenceRegistry.register(STORE_NAME, {
    tileViewEnabled: true,
    tableViewEnabled: true
}, DEFAULT_STATE);

UrlRegistry.register(STORE_NAME, {
    tableViewEnabled: true
}, DEFAULT_STATE);

ReducerRegistry.register(STORE_NAME, (state = DEFAULT_STATE, action) => {
    switch (action.type) {
    case SCREEN_SHARE_PARTICIPANTS_UPDATED: {
        return {
            ...state,
            screenShares: action.participantIds
        };
    }

    case SET_TILE_VIEW: {
        return {
            ...state,
            tileViewEnabled: action.enabled,
            tableViewEnabled: false
        };
    }

    case SET_TABLE_VIEW: {
        if (action.enabled) {
            return {
                ...state,
                tileViewEnabled: true,
                tableViewEnabled: true,
                __prevTileView: state.tileViewEnabled
            };
        }

        return {
            ...state,
            tileViewEnabled: state.__prevTileView,
            tableViewEnabled: false
        };
    }

    case SET_TABLE_VIEW_SEATS: {
        return {
            ...state,
            tableViewSeats: action.seats
        };
    }

    case ENABLE_TABLE_VIEW_MUTTING: {
        return {
            ...state,
            isTableViewMuttingEnabled: action.enabled
        };
    }
    }

    return state;
});
