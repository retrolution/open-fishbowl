// @flow
import React, { useState, useCallback } from 'react';
import { Icon, IconClose } from '../../../../base/icons';
import { translate } from '../../../../base/i18n';
import { ActivityStep } from './ActivityStep';

const getUrl = () => {
    if (document.location.search) {
        return document.location.href;
    }

    return `${document.location.href}?tableViewEnabled=true`;

};

type Props = {
    hide: Function,
    isMuttingEnabled: Boolean,
    toggleMutting: Function,
    t: Function
}

/**
 * Component to display and control Activity Indication.
 *
 * @returns {React.Node}
 */
const ActivityIndication = ({ hide, isMuttingEnabled, toggleMutting, t }: Props) => {
    const [ step, setStep ] = useState(0);
    const next = useCallback(() => setStep(_step => _step + 1), []);
    const prev = useCallback(() => setStep(_step => _step - 1), []);

    const url = getUrl();
    const STEPS = t('fishbowl.activityIndication.steps', { returnObjects: true }) || [];

    return (<div className = 'activity-indication'>
        <div
            className = 'activity-indication__close'
            onClick = { hide }>
            <Icon src = { IconClose } />
        </div>
        <h1 className = 'activity-indication__title'>
            { t('fishbowl.activityIndication.title')}
        </h1>
        <div className = 'activity-indication__content'><ActivityStep
            step = { step }
            t = { t }
            url = { url } /></div>
        <div className = 'activity-indication__buttons'>
            { step > 0 && <button
                className = 'activity-indication__button'
                onClick = { prev }> { t('fishbowl.activityIndication.prev')}</button> }
            { (step + 1) < STEPS.length && <button
                className = 'activity-indication__button'
                onClick = { next }> { t('fishbowl.activityIndication.next')}</button>}
            { (step + 1) === STEPS.length && !isMuttingEnabled && <button
                className = 'activity-indication__button'
                onClick = { toggleMutting }> { t('fishbowl.activityIndication.done')}</button>}

            { isMuttingEnabled
            && <button
                className = 'activity-indication__button'
                onClick = { toggleMutting }>
                {isMuttingEnabled
                    ? t('fishbowl.activityIndication.mute.disable')
                    : t('fishbowl.activityIndication.mute.enable')}

            </button>
            }
        </div>
    </div>);
};


export default translate(ActivityIndication);
