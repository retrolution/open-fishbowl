// @flow
import React from 'react';
import { translateToHTML } from '../../../../base/i18n';

type Props = {
    t: Function,
    step: Number,
    url: String
}

export const ActivityStep = ({ t, step, url }: Props) => {
    const tStepKey = `fishbowl.activityIndication.steps.${step}`;
    const tStep = t(tStepKey, { returnObjects: true });


    return (<React.Fragment>{tStep.map((_, subIndex) =>
        (<div key = { `${tStepKey}.${subIndex}` }>
            {translateToHTML(t, `${tStepKey}.${subIndex}`, { url })}
        </div>))}</React.Fragment>);
};
