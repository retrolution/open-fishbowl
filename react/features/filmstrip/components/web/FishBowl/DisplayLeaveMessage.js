/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { connect } from '../../../../base/redux';
import { translate } from '../../../../base/i18n';

const GREY = '#aaa';

import { getLocalParticipant } from '../../../../base/participants';

export const DisplayLeaveMessage = translate(connect(state => {
    return {

        canLeave: Number.isInteger(getLocalParticipant(state).requiredSeat)
    };
})(({ canLeave, t }) => (<div
    style = {{ position: 'absolute',
        left: 0,
        right: 0,
        margin: 'auto',
        top: '4%',
        width: 300,
        color: '#3A247F',
        background: 'white',
        padding: 8,
        borderStyle: 'solid',
        borderWidth: 1,
        borderRadius: 4,
        borderColor: '#3A247F',
        textAlign: 'center'  }}>
    <div
        style = {{ fontSize: 18,
            lineHeight: 1 }}>
        { t('fishbowl.full.main') }</div>
    {canLeave && <div
        style = {{ fontSize: 18,
            lineHeight: 1 }}>{ t('fishbowl.full.leave') }</div>}
</div>)));
