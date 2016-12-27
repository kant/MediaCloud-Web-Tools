import React from 'react';
import Link from 'react-router/lib/Link';
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from 'react-intl';
import DataCard from '../../common/DataCard';

const localMessages = {
  title: { id: 'story.details.title',
    defaultMessage: 'About this Story',
  },
  publisher: { id: 'story.details.publisher', defaultMessage: '<b>Published by</b>: ' },
  extractorVersion: { id: 'story.details.extractorVersion', defaultMessage: '<b>Extractor Version</b>: {version}' },
  geocoderVersion: { id: 'story.details.geocoderVersion', defaultMessage: '<b>Geocoder Version</b>: {version}' },
  dateGuessMethod: { id: 'story.details.dateGuess', defaultMessage: '<b>Date Guessed From</b>: {method}' },
  apSyndicated: { id: 'story.details.apSyndicated', defaultMessage: '<b>AP Story?</b> {apSyndicated}' },
  wordCount: { id: 'story.details.wordCount', defaultMessage: '<b>Word Count</b>: {wordCount}' },
  unknown: { id: 'story.details.unknown', defaultMessage: 'Unknown' },
};

const StoryDetails = (props) => {
  const { story } = props;
  const { formatMessage } = props.intl;
  return (
    <DataCard>
      <h2>
        <FormattedMessage {...localMessages.title} />
      </h2>
      <ul>
        <li>
          <FormattedHTMLMessage {...localMessages.publisher} />
          <Link to={`/topics/${props.topicId}/media/${story.media_id}`}>{story.media_name}</Link>
        </li>
        <li>
          <FormattedHTMLMessage
            {...localMessages.extractorVersion}
            values={{ version: story.extractorVersion || formatMessage(localMessages.unknown) }}
          />
        </li>
        <li>
          <FormattedHTMLMessage
            {...localMessages.geocoderVersion}
            values={{ version: story.geocoderVersion || formatMessage(localMessages.unknown) }}
          />
        </li>
        <li>
          <FormattedHTMLMessage
            {...localMessages.dateGuessMethod}
            values={{ method: story.dateGuessMethod || formatMessage(localMessages.unknown) }}
          />
        </li>
        <li>
          <FormattedHTMLMessage
            {...localMessages.apSyndicated}
            values={{ apSyndicated: story.ap_syndicated || formatMessage(localMessages.unknown) }}
          />
        </li>
        <li>
          <FormattedHTMLMessage
            {...localMessages.wordCount}
            values={{ wordCount: story.word_count || formatMessage(localMessages.unknown) }}
          />
        </li>
      </ul>
    </DataCard>
  );
};

StoryDetails.propTypes = {
  // from parent
  topicId: React.PropTypes.number.isRequired,
  story: React.PropTypes.object.isRequired,
  // from context
  intl: React.PropTypes.object.isRequired,
};

export default injectIntl(
  StoryDetails
);
