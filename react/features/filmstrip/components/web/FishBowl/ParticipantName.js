// @flow
import React from 'react';
import { DisplayName } from '../../../../display-name';

type Props = {
    className: string,
    onClick: Function,
    participantID: string,
    allowEditing: Boolean
}

export const ParticipantName = ({ className, participantID, allowEditing, onClick }: Props) => (
    <div
        className = { className }
        onClick = { onClick }>
        <DisplayName
            allowEditing = { allowEditing }
            participantID = { participantID } />
    </div>);
