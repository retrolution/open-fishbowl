// @flow
import React, { useCallback, useEffect } from 'react';
import { connect } from '../../../../base/redux';
import { VideoTrack, MEDIA_TYPE } from '../../../../base/media';
import {
    participantUpdated,
    getLocalParticipant,
    getParticipanByRequiredSeatIndex,
    getSelectedParticipant,
    isLocalParticipantModerator
} from '../../../../base/participants';
import { getTrackByMediaTypeAndParticipant } from '../../../../base/tracks';
import { IconChair } from '../../../../base/icons';
import { Avatar as AvatarDisplay } from '../../../../base/avatar';

import { ParticipantName } from './ParticipantName';


type Props = {
    canLeave: Boolean,

    selected: Boolean,

    canSelect: Boolean,

    index: Number,
    height: Number,
    participant: Object,
    participantUpdated: Function,

    localParticipantId: String,
    isModerator: Boolean,
    selectedParticipantId: String,

    videoTrack: Object
}

const _Seat = ({
    canLeave = false,
    selected,
    canSelect,
    index,
    height,
    videoTrack,
    participant,
    participantUpdated: _participantUpdated,
    localParticipantId,
    isModerator,
    selectedParticipantId
}: Props) => {

    const setLocalVideoTrack = useCallback(() => {
        _participantUpdated({
            id: localParticipantId,
            local: true,
            requiredSeat: index
        });
    }, [ localParticipantId, index ]);


    const setVideoTrack = useCallback(() => {
        if (!selectedParticipantId) {
            return setLocalVideoTrack();
        }

        _participantUpdated({
            id: selectedParticipantId,
            local: false,
            requiredSeat: index,
            fromModerator: isModerator
        });

    }, [ selectedParticipantId, setLocalVideoTrack ]);
    const removeVideoTrack = useCallback(() => {
        if (
            isModerator || (canLeave && participant && participant.local)
        ) {
            _participantUpdated({
                id: participant.id,
                local: participant.local || false,
                requiredSeat: null,
                fromModerator: isModerator && participant.id !== localParticipantId
            });
        }
    }, [ participant, localParticipantId ]);


    const onVideoClick = useCallback(() => {
        if (canSelect) {
            _participantUpdated({
                id: participant.id,
                local: true,
                selected: true
            });
        } else {
            removeVideoTrack();
        }
    }, [ canSelect, removeVideoTrack ]);

    const isLocal = participant && (participant.id === localParticipantId);


    useEffect(() => {
        if (selected) {
            document.addEventListener('click', () => {
                // after a click, not selected anymore
                requestAnimationFrame(() => {
                    _participantUpdated({
                        id: participant.id,
                        local: true,
                        selected: false
                    });
                });

            }, { capture: true,
                once: true });
        }

    }, [ selected ]);
    if (!participant) {
        return (<div
            className = { 'fishbowl-seat_empty' }
            onClick = { setVideoTrack }>
            <IconChair
                fill = '#ccc' />
        </div>);
    }
    if (!videoTrack || videoTrack.muted) {
        return (<>
            <AvatarDisplay
                className = 'userAvatar'
                participantId = { participant.id } />
            <ParticipantName
                allowEditing = { isLocal }
                className = 'fishbowl-seat__name_only'
                onClick = { onVideoClick }
                participantID = { participant && participant.id } /></>);
    }

    return (<div
        className = {
            `fishbowl-seat__container
             ${isLocal ? 'fishbowl-seat_local' : 'fishbowl-seat_remote'}
             ${participant.dominantSpeaker && 'fishbowl-seat_dominant'}
             `
        }
        onClick = { onVideoClick }
        style = {{ height }}>
        <VideoTrack
            className = 'fishbowl-seat__video'
            key = { `${participant && participant.id}_${height}` }
            style = {{ height }}
            videoTrack = { videoTrack } />
        <ParticipantName
            allowEditing = { isLocal }
            className = 'fishbowl-seat__name_over'
            participantID = { participant && participant.id } />
    </div>);
};

export const Seat = connect((state, ownProps) => {
    const participant = ownProps.participant || getParticipanByRequiredSeatIndex(state, ownProps.index);

    const videoTrack = participant
        && getTrackByMediaTypeAndParticipant(
            state['features/base/tracks'],
            MEDIA_TYPE.VIDEO,
            participant.id);

    const isModerator = isLocalParticipantModerator(state);
    const localParticipant = getLocalParticipant(state);
    const localParticipantId = localParticipant.id;
    const canSelect = isModerator && ownProps.participant && (ownProps.participant.id !== localParticipantId);

    const selectedParticipant = getSelectedParticipant(state);

    return {
        participant,
        videoTrack,
        localParticipantId,
        canSelect,
        selectedParticipantId: selectedParticipant && selectedParticipant.id,
        isModerator
    };
}, {
    participantUpdated
})(_Seat);
