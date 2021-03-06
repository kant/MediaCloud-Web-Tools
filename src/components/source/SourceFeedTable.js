import PropTypes from 'prop-types';
import React from 'react';
import Link from 'react-router/lib/Link';
import { FormattedMessage, injectIntl } from 'react-intl';
import messages from '../../resources/messages';
import { EditButton } from '../common/IconButton';


const SourceFeedTable = (props) => {
  const { feeds } = props;
  const content = null;
  if (feeds === undefined) {
    return (
      <div>
        { content }
      </div>
    );
  }
  return (
    <div className="source-feed-table">
      <table width="100%">
        <tbody>
          <tr>
            <th><FormattedMessage {...messages.feedName} /></th>
            <th><FormattedMessage {...messages.feedType} /></th>
            <th><FormattedMessage {...messages.feedIsActive} /></th>
            <th><FormattedMessage {...messages.feedUrl} /></th>
          </tr>
          {feeds.map((feed, idx) =>
            (<tr key={feed.feeds_id} className={`${(idx % 2 === 0) ? 'even' : 'odd'} feed-${(feed.active) ? 'active' : 'disabled'}`}>
              <td>
                {feed.name}
              </td>
              <td>
                {feed.type}
              </td>
              <td>
                {feed.active ? 'active' : 'disabled'}
              </td>
              <td>
                <a href={feed.url}>{feed.url}</a>
              </td>
              <td>
                <Link to={`/sources/${feed.media_id}/feeds/${feed.feeds_id}/edit`} >
                  <EditButton />
                </Link>
              </td>
            </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
};

SourceFeedTable.propTypes = {
  feeds: PropTypes.array,
  intl: PropTypes.object.isRequired,
};

export default injectIntl(SourceFeedTable);
