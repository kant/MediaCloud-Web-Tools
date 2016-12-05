import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import composeAsyncContainer from '../../../common/AsyncContainer';
import { fetchCollectionList } from '../../../../actions/sourceActions';
import CollectionList from './CollectionList';

const MCCollectionListContainer = (props) => {
  const { name, description, collections } = props;
  return (
    <div className="mc-collections-list">
      <CollectionList
        collections={collections}
        title={name}
        description={description}
      />
    </div>
  );
};

MCCollectionListContainer.propTypes = {
  // from state
  collections: React.PropTypes.array.isRequired,
  name: React.PropTypes.string,
  description: React.PropTypes.string,
  fetchStatus: React.PropTypes.string.isRequired,
  // from context
  intl: React.PropTypes.object.isRequired,
  // from dispatch
  asyncFetch: React.PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  fetchStatus: state.sources.allCollections.fetchStatus,
  name: state.sources.allCollections.name,
  description: state.sources.allCollections.description,
  collections: state.sources.allCollections.collections,
});

const mapDispatchToProps = dispatch => ({
  asyncFetch: () => {
    dispatch(fetchCollectionList(5));
  },
});

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(
      composeAsyncContainer(
        MCCollectionListContainer
      )
    )
  );