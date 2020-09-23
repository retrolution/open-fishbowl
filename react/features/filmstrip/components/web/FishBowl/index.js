// @flow
import React, { useCallback, useState } from 'react';
import Tooltip from '@atlaskit/tooltip';
import ReactDOM from 'react-dom';

import { connect } from '../../../../base/redux';
import { translate } from '../../../../base/i18n';
import { getPositionMode } from './getPositionMode';

import {
    getTableViewSeats,
    isTableViewMuttingEnabledSelector,
} from '../../../../video-layout/functions';
import {
    isLocalParticipantModerator,
    getParticipantsWithoutSeat,
    getParticipantsWithSeat,
    getLocalParticipant
} from '../../../../base/participants';
import { SET_TABLE_VIEW_SEATS, ENABLE_TABLE_VIEW_MUTTING } from '../../../../video-layout/actionTypes';
import { DisplayLeaveMessage } from './DisplayLeaveMessage';
import { IncButton } from './IncButton';
import ActivityIndication from './ActivityIndication';
import { Icon, IconMicrophone, IconMicDisabled } from '../../../../base/icons';

import { SpectatorSeat } from './SpeactatorSeat';
import ParticipantSeat from './ParticipantSeat';

const getWidthForSeats = seats => {
    // computer on a max width of 500
    switch (seats) {
    case 0: return 0;
    case 1: return 400;
    case 2: return 250;
    case 3: return 225;
    case 4: return 200;
    case 5: return 185;
    case 6: return 170;
    case 7: return 150;
    default: return 150;
    }
};


const getDistanceRatioForSeats = seats => {
    switch (seats) {
    case 0: return 0;
    case 1: return 0;
    case 2: return 25;
    case 3: return 28;
    case 4: return 30;
    case 5: return 32;
    case 6: return 35;
    case 7: return 35;
    default: return 35;
    }
};


const getCircleDiameter = () => {

    const mode = getPositionMode();

    if (mode === 'wide') {
        // if (window.innerWidth > 900 && window.innerHeight > 900) {
        return window.innerHeight * 0.84;

        // }

        // return 500;

    } else if (mode === 'narrow') {
        return window.innerWidth * 0.8;
    }

    return Math.min(window.innerHeight / 2, window.innerWidth / 2, 500);

};


const getHeightForSeats = getWidthForSeats;

const mapContent = (content, language) => {
    if (typeof content === 'string') {
        return content;
    }

    return () => <>
        <h2>{content.title}</h2>
        {content.lines.map((line, index) => (<React.Fragment key = { `fragment_${language}_${index}` } >
            <br />
            <span key = { `span_${language}_${index}` } >
                {line}
            </span></React.Fragment>))}
    </>;
};

type Props = {
    t: Function,
    i18n: Object,
    setSeats: Function,
    isTableViewMuttingEnabled: Boolean,
    enableMutting: Function,
    disableMutting: Function,
    isModerator: Boolean,
    seats: Number,
    spectators: Array,
    shouldDisplayLeaveMessage: Boolean,
    isFishBowlFull: Boolean,
    isLocalParticipantInTheFishbowl: Boolean
}

/**
 *  Fishbowl component.
 *
 *  @returns {React.Node}
 */
const _FishBowl = ({
    t, i18n = {}, setSeats, isTableViewMuttingEnabled = false,
    enableMutting, disableMutting, isModerator = false, seats = 4,
    spectators = [], shouldDisplayLeaveMessage, isFishBowlFull, isLocalParticipantInTheFishbowl }: Props) => {

    const incSeats = useCallback(() => setSeats(seats + 1), [ seats ]);
    const devSeats = useCallback(() => {
        setSeats(Math.max(seats - 1, 0));
    }, [ seats ]);

    const [ shouldShowActivityIndicator, setShowActivityIndicator ] = useState(true);
    const hideActivityIndicator = useCallback(() => setShowActivityIndicator(false), []);

    const diameter = getCircleDiameter();
    const seatWidth = getWidthForSeats(seats) * diameter / 500;
    const seatHeight = getHeightForSeats(seats) * diameter / 500;
    const disanceRatio = getDistanceRatioForSeats(seats);

    const getComputedStyle = () => {
        return { width: diameter,
            height: diameter };
    };

    return (<React.Fragment>
        <div
            className = { `
            table-view-container
            ${isTableViewMuttingEnabled || 'table-view-container_inactive'}
            ${shouldDisplayLeaveMessage && 'table-view-container_full'} `
            }
            style = { getComputedStyle() }>

            {Array.from({ length: seats }).map((_, index) => {
                const angle = (360 / seats) * index;
                const horizontal = Math.floor(Math.cos(angle * 2 * Math.PI / 360) * disanceRatio);
                const vertical = Math.floor(Math.sin(angle * 2 * Math.PI / 360) * disanceRatio);

                return (<ParticipantSeat
                    horizontal = { horizontal }
                    index = { index }
                    key = { `participant_${index}` }
                    seatHeight = { seatHeight }
                    seatWidth = { seatWidth }
                    vertical = { vertical } />);
            })}
            {spectators.map((spectator, index) => (<SpectatorSeat
                key = { spectator.id }
                positionIndex = { index }
                positions = { spectators.length + (isFishBowlFull ? 1 : 0) }
                radius = { diameter / 2 }
                spectator = { spectator } />)
            )}
            { isFishBowlFull && <SpectatorSeat
                forceEmpty = { true }
                positionIndex = { spectators.length }
                positions = { spectators.length + 1 }
                radius = { diameter / 2 } />
            }
            {/* // for testing
                Array.from({ length: 17 }).map((spectator, index, arr) => (<SpectatorSeat
                key = { index }
                positionIndex = { index }
                positions = { arr.length }
                radius = { diameter / 2 } />)
                ) */}


            { shouldDisplayLeaveMessage && <DisplayLeaveMessage addSeats = { incSeats } />}
            { isModerator && <><span className = 'table-view__inc-buttons_background' />
                <Tooltip
                    content = { 'Remove a seat from the fishbowl' }
                    position = 'top'><IncButton
                        className = 'table-view__inc-button_dev'
                        onClick = { devSeats }>-
                    </IncButton>
                </Tooltip>
                <Tooltip
                    content = { 'Add a seat to the fishbowl' }
                    position = 'top'>
                    <IncButton
                        className = 'table-view__inc-button_inc'
                        onClick = { incSeats }>+</IncButton>
                </Tooltip>
            </>
            }
            { isModerator && <Tooltip
                content = { 'Toggle the fishbowl status' }
                position = 'top'>
                <IncButton
                    className = 'table-view__inc-button_mic'
                    onClick = { isTableViewMuttingEnabled ? disableMutting : enableMutting }>
                    <Icon src = { isTableViewMuttingEnabled ? IconMicrophone : IconMicDisabled } />
                </IncButton></Tooltip>}


        </div>
        { isModerator && shouldShowActivityIndicator && (
            <div className = 'table-view__activity--container'>
                <ActivityIndication
                    hide = { hideActivityIndicator }
                    isMuttingEnabled = { isTableViewMuttingEnabled }
                    toggleMutting = { isTableViewMuttingEnabled ? disableMutting : enableMutting } />
            </div>)}
        <MyTooltip
            isOpen = { shouldDisplayLeaveMessage }
            positionX = { -10 }
            positionY = { -50 }
            selector = '.table-view__seat-container_forceEmpty' >
               { t('fishbowl.help.action') }<br />  { t('fishbowl.help.leave') }
        </MyTooltip>
        <MyTooltip
            isOpen = { !shouldDisplayLeaveMessage && !isLocalParticipantInTheFishbowl}
            positionX = { 20 }
            positionY = { 20 }
            selector = '.fishbowl-seat_empty' >
             { t('fishbowl.help.action') }<br />  { t('fishbowl.help.join') }
        </MyTooltip>

    </React.Fragment>);
};

const MyTooltip = ({ isOpen, selector, children, positionY = 0, positionX = 0 }) => {

    const domNode = React.useMemo(() => document.createElement('div'), []);

    React.useEffect(() => {
        document.body.appendChild(domNode);

        return () => {
            document.body.removeChild(domNode);
        };
    }, [ domNode ]);

    if (!APP?.conference?.isJoined?.()) {
        return null;
    }

    const relativeElement = document.querySelector(selector);

    if (!isOpen || !relativeElement) {
        return null;
    }

    const { x, y } = relativeElement.getBoundingClientRect();

    return ReactDOM.createPortal(
        <div
            style = {{
                position: 'absolute',
                zIndex: 500,
                padding: 8,
                borderWidth: 1,
                borderRadius: 4,
                borderStyle: 'solid',
                borderColor: '#3A247F',
                top: y + positionY,
                left: x + positionX,
                background: 'white',
                color: '#3A247F',
                textAlign: 'center',
            }}>{children}</div>,
        domNode
    );
};

export const FishBowl = translate(connect(state => {
    const seats = getTableViewSeats(state);
    const spectators = getParticipantsWithoutSeat(state, seats);
    const participants = getParticipantsWithSeat(state, seats);


    return {
        isModerator: isLocalParticipantModerator(state),
        participants,
        spectators,
        shouldDisplayLeaveMessage: participants.length === seats,
        isFishBowlFull: participants.length === seats,
        seats,
        isTableViewMuttingEnabled: isTableViewMuttingEnabledSelector(state),
        isLocalParticipantInTheFishbowl: Number.isInteger(getLocalParticipant(state).requiredSeat)
    };
}, {
    setSeats: seats => {
        return {
            type: SET_TABLE_VIEW_SEATS,
            seats,
            local: true
        };
    },
    enableMutting: () => {
        return {
            type: ENABLE_TABLE_VIEW_MUTTING,
            enabled: true,
            local: true
        };
    },
    disableMutting: () => {
        return {
            type: ENABLE_TABLE_VIEW_MUTTING,
            enabled: false,
            local: true
        };
    }
})(_FishBowl));
