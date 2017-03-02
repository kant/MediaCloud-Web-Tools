import React from 'react';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import { injectIntl } from 'react-intl';
import { push } from 'react-router-redux';
import AppToolbar from './AppToolbar';
import messages from '../../../resources/messages';
import { getBrandColors } from '../../../styles/colors';
import AppNoticesContainer from './AppNoticesContainer';

const localMessages = {
  goHome: { id: 'brand.goHome', defaultMessage: 'go home' },
};

class BrandMasthead extends React.Component {

  onRouteToLogout = () => {
    this.context.router.push('/logout');
  }

  onRouteToLogin = () => {
    this.context.router.push('/logout');
  }

  render() {
    const { drawer, name, description, backgroundColor, mastheadText, navigateToHome } = this.props;
    const { formatMessage } = this.props.intl;
    const brandColors = getBrandColors();
    const styles = {
      root: {
        backgroundColor,
      },
      right: {
        float: 'right',
      },
      clear: {
        clear: 'both',
      },
    };
    const createMastheadText = () => ({ __html: (mastheadText !== null) ? mastheadText : name });
    return (
      <div className="app-header">
        <AppNoticesContainer />
        <AppToolbar
          backgroundColor={brandColors.light}
          drawer={drawer}
        />
        <div id="branding-masthead" style={styles.root} >
          <Grid>
            <Row>
              <Col lg={6} md={6} sm={6}>
                <h1>
                  <a href={`#${formatMessage(localMessages.goHome)}`} onClick={navigateToHome}>
                    <img alt={formatMessage(messages.suiteName)} src={'/static/img/mediacloud-logo-white-2x.png'} width={65} height={65} />
                  </a>
                  <strong dangerouslySetInnerHTML={createMastheadText()} />
                </h1>
              </Col>
              <Col lg={6} md={6} sm={6}>
                <div style={styles.right} >
                  <small>{description}</small>
                </div>
              </Col>
            </Row>
          </Grid>
        </div>
      </div>
    );
  }

}

BrandMasthead.propTypes = {
  // from parent
  name: React.PropTypes.string.isRequired,
  description: React.PropTypes.string.isRequired,
  backgroundColor: React.PropTypes.string.isRequired,
  lightColor: React.PropTypes.string.isRequired,
  drawer: React.PropTypes.node,
  // from context
  intl: React.PropTypes.object.isRequired,
  // state
  mastheadText: React.PropTypes.string,
  // from dispatch
  navigateToHome: React.PropTypes.func.isRequired,
};

BrandMasthead.contextTypes = {
  router: React.PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  mastheadText: state.app.mastheadText,
});

const mapDispatchToProps = dispatch => ({
  navigateToHome: (event) => {
    event.preventDefault();
    dispatch(push('/home'));
  },
});

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(
      BrandMasthead
    )
  );