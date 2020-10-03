// @flow

import { getCurrentConference, CONFERENCE_WILL_JOIN } from '../base/conference';
import {
    PIN_PARTICIPANT,
    getPinnedParticipant,
    pinParticipant,
    participantUpdated,
    getLocalParticipant
} from '../base/participants';
import { MiddlewareRegistry, StateListenerRegistry } from '../base/redux';
import { SET_DOCUMENT_EDITING_STATUS } from '../etherpad';

import {
    SET_TILE_VIEW, SET_TABLE_VIEW, SET_TABLE_VIEW_SEATS, ENABLE_TABLE_VIEW_MUTTING, FORCE_SEAT_POSITION
} from './actionTypes';
import { setTileView } from './actions';


let didSendCommandCount = 0;


const checkEndpointParticipantUpdated = (store, next, { participant } = {}) => {
    if (participant) {
        const { id, requiredSeat } = participant;

        if (requiredSeat !== undefined) {
            store.dispatch(participantUpdated({
                id,
                requiredSeat,
                local: true
            }));
        }
    }
};

import './subscriber';

let previousTileViewEnabled;

/**
 * Middleware which intercepts actions and updates tile view related state.
 *
 * @param {Store} store - The redux store.
 * @returns {Function}
 */
MiddlewareRegistry.register(store => next => action => {
    const result = next(action);

    switch (action.type) {

    // Actions that temporarily clear the user preferred state of tile view,
    // then re-set it when needed.
    case PIN_PARTICIPANT: {
        const pinnedParticipant = getPinnedParticipant(store.getState());

        if (pinnedParticipant) {
            _storeTileViewStateAndClear(store);
        } else {
            _restoreTileViewState(store);
        }
        break;
    }
    case SET_DOCUMENT_EDITING_STATUS:
        if (action.editing) {
            _storeTileViewStateAndClear(store);
        } else {
            _restoreTileViewState(store);
        }
        break;

    // Things to update when tile view state changes
    case SET_TILE_VIEW:
    case SET_TABLE_VIEW: {
        if (action.enabled && getPinnedParticipant(store)) {
            store.dispatch(pinParticipant(null));
        }
        break;
    }

    case SET_TABLE_VIEW_SEATS: {
        const { conference } = store.getState()['features/base/conference'];
        const { id, requiredSeat } = getLocalParticipant(store.getState());

        if (action.local) {
            didSendCommandCount += 1;
            conference
            && conference.sendCommand(
                SET_TABLE_VIEW_SEATS,
                { value: action.seats || '0' },
            );
        }
        if (requiredSeat >= action.seats) {
            // my seat does not exist any more
            store.dispatch(participantUpdated({
                id,
                local: true,
                requiredSeat: null
            }));
        }

        break;
    }

    case ENABLE_TABLE_VIEW_MUTTING: {
        if (action.local) {
            const { conference } = store.getState()['features/base/conference'];

            conference
            && conference.sendCommand(
                ENABLE_TABLE_VIEW_MUTTING,
                { value: Boolean(action.enabled) },
            );
        }
        break;
    }

    case FORCE_SEAT_POSITION: {
        checkEndpointParticipantUpdated(store, next, action);
        break;
    }

    case CONFERENCE_WILL_JOIN: {
        const { dispatch } = store;
        const { conference } = action;

        conference.addCommandListener(SET_TABLE_VIEW_SEATS, ({ value }) => {
            const seats = Number.parseInt(value, 10);

            if (didSendCommandCount > 0) {
                // when we just send the command,
                // we want wait before next value, so there is not back and fort with old value
                didSendCommandCount -= 1;

                return;
            }

            if (store.getState()['features/video-layout'].tableViewSeats === seats) {
                return;
            }

            dispatch({
                type: SET_TABLE_VIEW_SEATS,
                remote: true,
                seats
            });
        });

        conference.addCommandListener(ENABLE_TABLE_VIEW_MUTTING, ({ value }) => {
            dispatch({
                type: ENABLE_TABLE_VIEW_MUTTING,
                enabled: Boolean(value),
                remote: true
            });
        });

        conference.addCommandListener(FORCE_SEAT_POSITION, ({ attributes: { id, requiredSeat } }) => {
            const { id: localParticipantId } = getLocalParticipant(store.getState());

            if (id !== localParticipantId) {
                return;
            }

            dispatch({
                type: FORCE_SEAT_POSITION,
                participant: {
                    id,
                    local: true,
                    requiredSeat: requiredSeat == undefined ? null : Number.parseInt(requiredSeat, 10)
                }
            });
        });
    }
    }

    return result;
});

/**
 * Respores tile view state, if it wasn't updated since then.
 *
 * @param {Object} store - The Redux Store.
 * @returns {void}
 */
function _restoreTileViewState({ dispatch, getState }) {
    const { tileViewEnabled } = getState()['features/video-layout'];

    if (tileViewEnabled === undefined && previousTileViewEnabled !== undefined) {
        dispatch(setTileView(previousTileViewEnabled));
    }

    previousTileViewEnabled = undefined;
}


/**
 * Set up state change listener to perform maintenance tasks when the conference
 * is left or failed.
 */
StateListenerRegistry.register(
    state => getCurrentConference(state),
    (conference, { dispatch }, previousConference) => {
        if (conference !== previousConference && previousConference) {
            // conference changed, left or failed...
            // Clear tile view state.
            dispatch(setTileView());
        }
    });

/**
 * Stores the current tile view state and clears it.
 *
 * @param {Object} store - The Redux Store.
 * @returns {void}
 */
function _storeTileViewStateAndClear({ dispatch, getState }) {
    const { tileViewEnabled } = getState()['features/video-layout'];

    if (tileViewEnabled !== undefined) {
        previousTileViewEnabled = tileViewEnabled;
        dispatch(setTileView(undefined));
    }
}
