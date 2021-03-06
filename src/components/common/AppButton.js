import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';

/**
 * Simple wrapper so we can style all the button the same.  Use this instead of
 * material-ui's RaisedButton.
 * @see http://stackoverflow.com/questions/39458150/is-it-possible-to-add-a-custom-hover-color-to-raised-buttons
 */
class AppButton extends React.Component {

  state = {
    hoverClass: '',
  };

  handleMouseEnter = () => {
    const { disabled } = this.props;
    if ((disabled === false) || (disabled === undefined)) {
      this.setState({ hoverClass: 'hovering' });
    }
  }

  handleMouseLeave = () => {
    this.setState({ hoverClass: '' });
  }

  render() {
    const { flat, className } = this.props;
    const { formatMessage } = this.props.intl;
    const customClassName = className || '';
    const buttonProps = {
      onMouseEnter: this.handleMouseEnter,
      onMouseLeave: this.handleMouseLeave,
      ...this.props,
      className: `app-button ${this.state.hoverClass} ${customClassName}`,
    };
    delete buttonProps.intl;
    // automatically localize the label if it is a message object
    if ((buttonProps.label) && (typeof buttonProps.label === 'object')) {
      buttonProps.label = formatMessage(buttonProps.label);
    }
    let content = null;
    if (flat) {
      delete buttonProps.flat;
      content = <FlatButton {...buttonProps} />;
    } else {
      content = <RaisedButton {...buttonProps} />;
    }
    return content;
  }

}

AppButton.propTypes = {
  // from parent
  disabled: PropTypes.bool,
  flat: PropTypes.bool,
  className: PropTypes.string,
  // from composition chain
  intl: PropTypes.object.isRequired,
};

export default
  injectIntl(
    AppButton
  );
