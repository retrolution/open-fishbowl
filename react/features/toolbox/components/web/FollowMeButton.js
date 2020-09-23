// @flow

import { translate } from '../../../base/i18n';
import { IconDownload } from '../../../base/icons';
import { connect } from '../../../base/redux';
import { AbstractButton, type AbstractButtonProps } from '../../../base/toolbox/components';
import { isLocalParticipantModerator } from '../../../base/participants';
import { isFollowMeActive } from '../../../follow-me';
import { setFollowMe } from '../../../base/conference';


type Props = AbstractButtonProps & {
    _active: Boolean
};

/**
 * Implements an {@link AbstractButton} to open the user documentation in a new window.
 */
class FollowMeButton extends AbstractButton<Props, *> {
    accessibilityLabel = 'toolbar.accessibilityLabel.followMe';
    icon = IconDownload;
    label = 'toolbar.followMe';
    toggledLabel = 'toolbar.unfollowMe';

    /**
     * Handles clicking / pressing the button, and opens a new window with the user documentation.
     *
     * @private
     * @returns {void}
     */
    _handleClick() {
        this.props.dispatch(setFollowMe(!this.props._active));
    }

    /**
     * Use to detect state of the button.
     *
     * @private
     * @returns {boolean}
     */
    _isToggled() {
        return this.props._active;
    }
}


/**
 * Maps part of the redux state to the component's props.
 *
 * @param {Object} state - The redux store/state.
 * @returns {Object}
 */
function _mapStateToProps(state: Object) {
    const { followMeEnabled } = state['features/base/conference'];

    const followMeActive = isFollowMeActive(state);
    const visible = isLocalParticipantModerator(state) && !followMeActive;

    return {
        _active: followMeEnabled,
        visible
    };
}

export default translate(connect(_mapStateToProps)(FollowMeButton));
