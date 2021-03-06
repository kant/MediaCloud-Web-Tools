import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl, FormattedHTMLMessage } from 'react-intl';
import { connect } from 'react-redux';
// import { push } from 'react-router-redux';
import { selectQuery, resetSelected, resetQueries, resetSentenceCounts, resetSampleStories, resetStoryCounts,
  resetGeo, updateTimestampForQueries, removeDeletedQueries } from '../../../actions/explorerActions';
import QueryBuilderContainer from './QueryBuilderContainer';
import QueryResultsContainer from '../results/QueryResultsContainer';
import { WarningNotice } from '../../common/Notice';
import composeUrlBasedQueryContainer from '../UrlBasedQueryContainer';

const localMessages = {
  register: { id: 'explorer.queryBuilder.urlParams', defaultMessage: 'Register for a free Media Cloud account to get access to all the Explorer features! <a href="http://tools.mediacloud.org/#/user/signup">Register Now</a>' },
};

class DemoQueryBuilderContainer extends React.Component {
  componentWillMount() {
    const { selectFirstQuery, queries } = this.props;
    // console.log(queries[0]);
    selectFirstQuery(queries[0]);  // on first load select first by default so the builder knows which one to render in the form
  }
  /*
  componentWillUnmount() {
    const { resetExplorerData } = this.props;
    resetExplorerData();
  }
  */
  render() {
    const { queries, handleSearch, samples, location, lastSearchTime } = this.props;
    const isEditable = location.pathname.includes('queries/demo/search');
    return (
      <div className="query-container query-container-demo">
        <WarningNotice><FormattedHTMLMessage {...localMessages.register} />
        </WarningNotice>
        <QueryBuilderContainer isEditable={isEditable} onSearch={() => handleSearch()} />
        <QueryResultsContainer
          lastSearchTime={lastSearchTime}
          queries={queries}
          samples={samples}
          onSearch={() => handleSearch()}
        />
      </div>
    );
  }
}

DemoQueryBuilderContainer.propTypes = {
  intl: PropTypes.object.isRequired,
  // from parent
  initialValues: PropTypes.object,
  // from state
  location: PropTypes.object,
  queries: PropTypes.array.isRequired,
  samples: PropTypes.array,
  lastSearchTime: PropTypes.number,
  resetExplorerData: PropTypes.func.isRequired,
  selectFirstQuery: PropTypes.func,

  handleSearch: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  queries: state.explorer.queries.queries,
  lastSearchTime: state.explorer.lastSearchTime.time,
  samples: state.explorer.samples.list,
});

// push any updates (including selected) into queries in state, will trigger async load in sub sections
const mapDispatchToProps = dispatch => ({
  resetExplorerData: () => { // TODO we will reduce this down to one call
    dispatch(resetSelected());
    dispatch(resetQueries());
    dispatch(resetSentenceCounts());
    dispatch(resetSampleStories());
    dispatch(resetStoryCounts());
    dispatch(resetGeo());
  },
  selectFirstQuery: (query) => {
    dispatch(selectQuery(query));
  },
  reallyHandleSearch: () => {
    dispatch(removeDeletedQueries());
    dispatch(updateTimestampForQueries());
  },
});

function mergeProps(stateProps, dispatchProps, ownProps) {
  return Object.assign({}, stateProps, dispatchProps, ownProps, {
    handleSearch: () => {
      dispatchProps.reallyHandleSearch(stateProps.queries);
    },
  });
}

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps, mergeProps)(
      composeUrlBasedQueryContainer()(
        DemoQueryBuilderContainer
      )
    )
  );
