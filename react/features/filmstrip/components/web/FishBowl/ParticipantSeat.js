// @flow
import React from 'react';
import { Seat } from './Seat';
import { connect } from '../../../../base/redux';
import { getParticipanByRequiredSeatIndex } from '../../../../base/participants';

type Props = {
    index: Number,
    seatWidth: Number,
    seatHeight: Number,
    vertical: Number,
    horizontal: Number,
    dominantSpeaker: Boolean
}

/**
 * React component.
 *
 * @returns {React.node}
 */
export function ParticipantSeat({ index, seatWidth, seatHeight, vertical, horizontal, dominantSpeaker }: Props) {

    return (<div
        className = { `
            table-view__seat-container
            table-view__seat-container-table
            ${dominantSpeaker && 'table-view__seat-container_dominant'}`
        }
        key = { `seat_${index}` }
        style = {{
            width: seatWidth,
            height: seatHeight,
            top: `calc(50% - ${seatHeight}px/2  + ${vertical}%)`,
            left: `calc(50% - ${seatWidth}px/2 + ${horizontal}%)`,
            borderRadius: seatWidth,
            lineHeight: `${seatHeight}px`
        }}>
        <Seat
            height = { seatHeight }
            index = { index } />
    </div>);
}

export default connect((state, { index }) => {
    const participant = getParticipanByRequiredSeatIndex(state, index);


    return {
        participant,
        dominantSpeaker: participant && participant.dominantSpeaker
    };
})(ParticipantSeat);
