// @flow
import React from 'react';
import { Seat } from './Seat';
import { getPositionMode } from './getPositionMode';


type Props = {
    spectator: Object,
    positionIndex: Number,
    positions: Number
}

const getSeatPosition = ({ positions, positionIndex, mode = 'square', radius = 500, seatRadius = 150 }) => {
    if (mode === 'square') {
        const angle = ((360 / positions) * positionIndex) + 45;
        const horizontal = Math.floor(Math.cos(angle * 2 * Math.PI / 360) * (radius + seatRadius));
        const vertical = Math.floor(-Math.sin(angle * 2 * Math.PI / 360) * (radius + seatRadius));

        return { angle,
            horizontal,
            vertical };
    }

    if (mode === 'wide' || mode === 'narrow') {
        if (positionIndex < 8) {
            const angles = [ -35, -12.5, 12.5, 35, 180 - 35, 180 - 12.5, 180 + 12.5, 180 + 35 ];
            const angle = angles[positionIndex] + (mode === 'narrow' ? 90 : 0);
            const horizontal = Math.floor(Math.cos(angle * 2 * Math.PI / 360) * (radius + seatRadius));
            const vertical = Math.floor(-Math.sin(angle * 2 * Math.PI / 360) * (radius + seatRadius));

            return { angle,
                horizontal,
                vertical };

        }

        const angles = [ -33, -33 / 2, 0, 33 / 2, 33, 180 - 33, 180 - 33 / 2, 180, 180 + 33 / 2, 180 + 33 ];
        const rang = Math.floor((positionIndex - 8) / angles.length) + 1;
        const angle = angles[(positionIndex - 8) % angles.length] + (mode === 'narrow' ? 90 : 0);
        const SPACE = seatRadius + 20 / 150 * seatRadius;
        const horizontal = Math.floor(Math.cos(angle * 2 * Math.PI / 360) * (radius + seatRadius + SPACE * rang));
        const vertical = Math.floor(-Math.sin(angle * 2 * Math.PI / 360) * (radius + seatRadius + SPACE * rang));

        return { angle,
            horizontal,
            vertical };


    }

};

const getSeatRadius = () => {

    if (window.innerWidth < 500) {
        return 60;
    } else if (window.innerWidth < 600) {
        return 80;
    }

    if (window.innerHeight < 400) {
        return 50;
    }

    if (window.innerHeight < 700) {
        return 100;
    }

    if (window.innerHeight < 900) {
        return 120;
    }

    return 150;
};

export const SpectatorSeat = ({ spectator, positionIndex, positions, radius = 500, forceEmpty }: Props) => {

    const seatRadius = getSeatRadius();

    const { angle, horizontal, vertical } = getSeatPosition({ positionIndex,
        positions,
        mode: getPositionMode(),
        radius,
        seatRadius });


    return (<div
        className = {
            `table-view__seat-container
             table-view__seat-container-spectator
             ${spectator && spectator.selected && 'table-view__seat-container_selected'}
             ${forceEmpty && 'table-view__seat-container_forceEmpty'}
             
             `
        }
        focusable = { true }
        style = {{
            width: seatRadius,
            height: seatRadius,
            top: `calc(50% - ${seatRadius}px/2  + ${vertical}px)`,
            left: `calc(50% - ${seatRadius}px/2 + ${horizontal}px)`,
            borderRadius: seatRadius,
            lineHeight: `${seatRadius}px`
        }}>
        <Seat
            height = { seatRadius }
            index = { spectator ? undefined : null }
            participant = { spectator }
            selected = { spectator && spectator.selected } />
    </div>);
};
