// @flow

import VideoLayout from '../../../modules/UI/videolayout/VideoLayout.js';
import { CONFERENCE_JOINED, CONFERENCE_WILL_LEAVE } from '../base/conference';
import {
    DOMINANT_SPEAKER_CHANGED,
    PARTICIPANT_JOINED,
    PARTICIPANT_LEFT,
    PARTICIPANT_UPDATED,
    PIN_PARTICIPANT,
    getParticipantById,
    getLocalParticipant
} from '../base/participants';
import { MiddlewareRegistry } from '../base/redux';
import { TRACK_ADDED, TRACK_REMOVED } from '../base/tracks';
import { setAudioMuted, setVideoMuted } from '../base/media/actions';

import { SET_FILMSTRIP_VISIBLE } from '../filmstrip';

import './middleware.any';
import { ENABLE_TABLE_VIEW_MUTTING, SET_TABLE_VIEW, SET_TILE_VIEW } from './actionTypes.js';

declare var APP: Object;

const updateLocalTracks = (store, state, { isTableView, isTableViewMuttingEnabled, participant }) => {

    if (isTableView) {
        const localParticpant = participant && participant.local && participant.hasOwnProperty('requiredSeat')
            ? participant
            : getLocalParticipant(state);

        if (!isTableViewMuttingEnabled) {
            // unmute audio ?
        } else if (Number.isInteger(Number.parseInt(localParticpant.requiredSeat, 10))) {
            // at table
            // start video and audio
            store.dispatch(setAudioMuted(false, true));
            store.dispatch(setVideoMuted(false));
        } else {
            store.dispatch(setAudioMuted(true));
            store.dispatch(setVideoMuted(true));
        }
    } else {
        // dont do anything
    }
};

const updateVolumeForParticipant = (participant, store, force) => {
    const state = store.getState();
    const isTable = state['features/video-layout'].tableViewEnabled
        && state['features/video-layout'].isTableViewMuttingEnabled;

    if (force || participant.requiredSeat !== undefined) {
        const hasVolume = isTable ? Number.isInteger(Number.parseInt(participant.requiredSeat, 10)) : true;
        const video = VideoLayout.getSmallVideo(participant.id);

        if (video && video._setAudioVolume) {
            video._setAudioVolume(hasVolume ? 1 : 0);
        }
    }

    if (force || participant.local) {
        updateLocalTracks(
            store,
            state,
            {
                isTableView: state['features/video-layout'].tableViewEnabled,
                isTableViewMuttingEnabled: state['features/video-layout'].isTableViewMuttingEnabled,
                participant
            }
        );
    }
};

const updateVolumeForAllParticipants = (isTable, state) => {
    state['features/base/participants'].forEach(participant => {
        const video = VideoLayout.getSmallVideo(participant.id);

        if (video && video._setAudioVolume) {
            const hasVolume = isTable ? Number.isInteger(Number.parseInt(participant.requiredSeat, 10)) : true;

            video._setAudioVolume(hasVolume ? 1 : 0);
        }
    });
};

/**
 * Middleware which intercepts actions and updates the legacy component
 * {@code VideoLayout} as needed. The purpose of this middleware is to redux-ify
 * {@code VideoLayout} without having to simultaneously react-ifying it.
 *
 * @param {Store} store - The redux store.
 * @returns {Function}
 */
// eslint-disable-next-line no-unused-vars
MiddlewareRegistry.register(store => next => action => {
    // Purposefully perform additional actions after state update to mimic
    // being connected to the store for updates.
    const result = next(action);

    switch (action.type) {
    case CONFERENCE_JOINED:
        VideoLayout.mucJoined();
        break;

    case CONFERENCE_WILL_LEAVE:
        VideoLayout.reset();
        break;

    case PARTICIPANT_JOINED:
        updateVolumeForParticipant(action.participant, store, true);

        if (!action.participant.local) {
            VideoLayout.addRemoteParticipantContainer(
                getParticipantById(store.getState(), action.participant.id));
        }
        break;

    case PARTICIPANT_LEFT:
        VideoLayout.removeParticipantContainer(action.participant.id);
        break;

    case PARTICIPANT_UPDATED: {
        updateVolumeForParticipant(action.participant, store);

        // Look for actions that triggered a change to connectionStatus. This is
        // done instead of changing the connection status change action to be
        // explicit in order to minimize changes to other code.
        if (typeof action.participant.connectionStatus !== 'undefined') {
            VideoLayout.onParticipantConnectionStatusChanged(
                action.participant.id,
                action.participant.connectionStatus);
        }
        break;
    }

    case DOMINANT_SPEAKER_CHANGED:
        VideoLayout.onDominantSpeakerChanged(action.participant.id);
        break;

    case PIN_PARTICIPANT:
        VideoLayout.onPinChange(action.participant?.id);
        break;

    case SET_FILMSTRIP_VISIBLE:
        VideoLayout.resizeVideoArea();
        break;

    case TRACK_ADDED: {
        if (!action.track.local) {
            VideoLayout.onRemoteStreamAdded(action.track.jitsiTrack);
            updateVolumeForAllParticipants(
                store.getState()['features/video-layout'].isTableViewMuttingEnabled
                && store.getState()['features/video-layout'].tableViewEnabled,
                store.getState()
            );
        }
        const state = store.getState();

        updateLocalTracks(
            store,
            state,
            {
                isTableView: state['features/video-layout'].tableViewEnabled,
                isTableViewMuttingEnabled: state['features/video-layout'].isTableViewMuttingEnabled
            }
        );

        break;
    }
    case TRACK_REMOVED:
        if (!action.track.local) {
            VideoLayout.onRemoteStreamRemoved(action.track.jitsiTrack);
        }

        break;
    case SET_TABLE_VIEW:
    case SET_TILE_VIEW:
        updateVolumeForAllParticipants(
            store.getState()['features/video-layout'].isTableViewMuttingEnabled
            && action.type === SET_TABLE_VIEW
            && action.enabled,
            store.getState()
        );
        break;

    case ENABLE_TABLE_VIEW_MUTTING: {
        updateVolumeForAllParticipants(
            action.enabled && store.getState()['features/video-layout'].tableViewEnabled,
            store.getState()
        );
        const state = store.getState();

        updateLocalTracks(
            store,
            state,
            {
                isTableView: state['features/video-layout'].tableViewEnabled,
                isTableViewMuttingEnabled: action.enabled
            }
        );
    }
    }

    return result;
});


