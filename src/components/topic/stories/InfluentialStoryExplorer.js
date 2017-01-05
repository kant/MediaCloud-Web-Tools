import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import moment from 'moment';
import * as d3 from 'd3';
import dc from 'dc';
import crossfilter from 'crossfilter';
import LoadingSpinner from '../../common/LoadingSpinner';
import messages from '../../../resources/messages';
import { googleFavIconUrl, storyDomainName } from '../../../lib/urlUtil';

const localMessages = {
  storiesChartTitle: { id: 'topic.influentialStoryExplorer.storiesChart.title', defaultMessage: 'Stories Each Day in this Timespan' },
  storiesChartY: { id: 'topic.influentialStoryExplorer.storiesChart.y', defaultMessage: 'stories / day' },
  storiesChartX: { id: 'topic.influentialStoryExplorer.storiesChart.x', defaultMessage: 'date' },
  languagesChartTitle: { id: 'topic.influentialStoryExplorer.languageChart.title', defaultMessage: 'Languages Detected' },
  facebookChartTitle: { id: 'topic.influentialStoryExplorer.facebookChart.title', defaultMessage: 'Facebook Shares' },
  facebookChartY: { id: 'topic.influentialStoryExplorer.facebookChart.y', defaultMessage: 'stories' },
  facebookChartX: { id: 'topic.influentialStoryExplorer.facebookChart.x', defaultMessage: 'shares' },
  bitlyChartTitle: { id: 'topic.influentialStoryExplorer.bitlyChart.title', defaultMessage: 'Bit.ly Clicks' },
  bitlyChartY: { id: 'topic.influentialStoryExplorer.bitlyChart.y', defaultMessage: 'stories' },
  bitlyChartX: { id: 'topic.influentialStoryExplorer.bitlyChart.x', defaultMessage: 'clicks' },
  inlinkChartTitle: { id: 'topic.influentialStoryExplorer.inlinkChart.title', defaultMessage: 'Media Inlinks' },
  inlinkChartY: { id: 'topic.influentialStoryExplorer.inlinkChart.y', defaultMessage: 'stories' },
  inlinkChartX: { id: 'topic.influentialStoryExplorer.inlinkChart.x', defaultMessage: 'media inlinks' },
};

const FACEBOOK_BIN_COUNT = 15;
const BITLY_BIN_COUNT = 15;
const INLINK_BIN_COUNT = 15;

class InfluentialStoryExplorer extends React.Component {

  componentDidMount() {
    const { selectedTimespan } = this.props;
    this.renderDC(selectedTimespan);
  }

  componentWillReceiveProps(nextProps) {
    const { selectedTimespan } = this.props;
    if ((nextProps.selectedTimespan) && (nextProps.selectedTimespan !== selectedTimespan)) {
      // we need these dates to render the charts right, cause some dates are outside this range
      this.renderDC(nextProps.selectedTimespan);
    }
  }

  csvFileUrl = () => {
    const { topicId, filters } = this.props;
    return `/api/topics/${topicId}/stories.csv?snapshotId=${filters.snapshotId}&timespanId=${filters.timespanId}&attach=0`;
  }

  resetLanguageChart = (event) => {
    event.preventDefault();
    this.state.charts.languageChart.filterAll();
    dc.redrawAll();
  }

  resetFacebookChart = (event) => {
    event.preventDefault();
    this.state.charts.facebookShareChart.filterAll();
    dc.redrawAll();
  }

  resetBitlyChart = (event) => {
    event.preventDefault();
    this.state.charts.bitlyClickChart.filterAll();
    dc.redrawAll();
  }

  resetInlinkChart = (event) => {
    event.preventDefault();
    this.state.charts.inlinkChart.filterAll();
    dc.redrawAll();
  }

  resetStoriesChart = (event) => {
    event.preventDefault();
    this.state.charts.storiesOverTimeChart.filterAll();
    dc.redrawAll();
  }

  showLoading = (isLoading) => {
    const loading = document.getElementById('story-explorer-loading');
    const content = document.getElementById('story-explorer-content');
    if (isLoading) {
      loading.style.display = 'block';
      content.style.display = 'none';
    } else {
      loading.style.display = 'none';
      content.style.display = 'block';
    }
  }

  renderDC = (selectedTimespan) => {
    const { formatMessage } = this.props.intl;
    // show a spinner while it loads
    this.showLoading(true);
    // set up chart containers
    const storiesOverTimeChart = dc.barChart('#stories-over-time-chart');
    const storyCount = dc.dataCount('#story-counts');
    const languageChart = dc.pieChart('#language-chart');
    const storyTable = dc.dataTable('#story-table');
    const facebookShareChart = dc.barChart('#facebook-share-chart');
    const bitlyClickChart = dc.barChart('#bitly-click-chart');
    const inlinkChart = dc.barChart('#inlink-chart');
    // load the data up
    d3.csv(this.csvFileUrl(), (data) => {
      this.showLoading(false);
      // set up some binning
      const maxFacebookShares = d3.max(data.map(d => d.facebook_share_count));
      const facebookBinSize = maxFacebookShares / FACEBOOK_BIN_COUNT;
      const maxBitlyClicks = d3.max(data.map(d => d.bitly_click_count));
      const bitlyBinSize = maxBitlyClicks / BITLY_BIN_COUNT;
      const maxInlinks = d3.max(data.map(d => d.media_inlink_count));
      const inlinkBinSize = d3.max([1, (maxInlinks / INLINK_BIN_COUNT)]);  // don't do < 1 for bin size
      // clean up the data
      for (let i = 0; i < data.length; i += 1) {
        const d = data[i];
        d.publishDate = new Date(d.publish_date.substring(0, 4), d.publish_date.substring(5, 7), d.publish_date.substring(8, 10));
        d.publishMonth = d.publishDate.getMonth(); // pre-calculate month for better performance
        d.bitly_click_count = +d.bitly_click_count; // coerce to number
        d.facebook_share_count = +d.facebook_share_count;
        d.inlink_count = +d.inlink_count;
        d.media_id = +d.media_id;
        d.media_inlink_count = +d.media_inlink_count;
        d.outlink_count = +d.outlink_count;
        d.domain = storyDomainName(d);
      }
      // set up all the dimensions and groups that feed the charts
      const dateExtents = [selectedTimespan.startDateObj, selectedTimespan.endDateObj];
      const totalDays = moment(selectedTimespan.endDateObj).diff(moment(selectedTimespan.startDateObj), 'days');
      const ndx = crossfilter(data);
      const all = ndx.groupAll();
      const publishDateDimension = ndx.dimension(d => d.publishDate);
      const publishDateGroup = publishDateDimension.group(); // .reduceSum(() => 1);
      const languageDimension = ndx.dimension(d => d.language);
      const languageGroup = languageDimension.group();
      const facebookDimension = ndx.dimension(d => d.facebook_share_count);
      const facebookGroup = facebookDimension.group(d => Math.floor(d / facebookBinSize) * facebookBinSize);
      const bitlyDimension = ndx.dimension(d => d.bitly_click_count);
      const bitlyGroup = bitlyDimension.group(d => Math.floor(d / bitlyBinSize) * bitlyBinSize);
      const inlinkDimension = ndx.dimension(d => d.media_inlink_count);
      const inlinkGroup = inlinkDimension.group(d => Math.floor(d / inlinkBinSize) * inlinkBinSize);
      // histogram of stories
      storiesOverTimeChart
        .width(1000).height(200)
        .dimension(publishDateDimension)
        .group(publishDateGroup)
        .gap(0)
        .x(d3.scaleTime().domain(dateExtents))
        .xUnits(() => totalDays)
        .yAxisLabel(formatMessage(localMessages.storiesChartY))
        .xAxisLabel(formatMessage(localMessages.storiesChartX));
      // language pie chart
      languageChart
        .width(180).height(180)
        .radius(80)
        .turnOnControls(true)
        .controlsUseVisibility(false)
        .dimension(languageDimension)
        .group(languageGroup);
      // facebook share histogram
      facebookShareChart
        .width(380).height(200)
        .group(facebookGroup)
        .dimension(facebookDimension)
        .gap(1)
        .x(d3.scaleLinear().domain([0, maxFacebookShares]))
        .xUnits(() => FACEBOOK_BIN_COUNT)
        .xAxisLabel(formatMessage(localMessages.facebookChartX))
        .yAxisLabel(formatMessage(localMessages.facebookChartY))
        .renderHorizontalGridLines(true);
      // bit.ly click histogram
      bitlyClickChart
        .width(380).height(200)
        .group(bitlyGroup)
        .dimension(bitlyDimension)
        .gap(1)
        .x(d3.scaleLinear().domain([0, maxBitlyClicks]))
        .xUnits(() => BITLY_BIN_COUNT)
        .yAxisLabel(formatMessage(localMessages.bitlyChartY))
        .xAxisLabel(formatMessage(localMessages.bitlyChartX))
        .renderHorizontalGridLines(true);
      // media inlink histogram
      inlinkChart
        .width(380).height(200)
        .group(inlinkGroup)
        .dimension(inlinkDimension)
        .gap(1)
        .x(d3.scaleLinear().domain([0, maxInlinks]))
        .xUnits(() => d3.min([maxInlinks, INLINK_BIN_COUNT]))
        .yAxisLabel(formatMessage(localMessages.inlinkChartY))
        .xAxisLabel(formatMessage(localMessages.inlinkChartX))
        .renderHorizontalGridLines(true);
      // show how many stories are included
      storyCount
        .dimension(ndx)
        .group(all);
      // and set up the story table
      storyTable
        .dimension(publishDateDimension)
        .size(50)
        .group((d) => {
          const format = d3.format('02d');
          return `${d.publishDate.getFullYear()}/${format((d.publishDate.getMonth() + 1))}`;
        })
        .showGroups(false)
        .columns([
          d => moment(d.publishDate).format('MMM D, YYYY'),
          d => `<img className="google-icon" src=${googleFavIconUrl(d.domain)} alt=${d.domain} />`,
          d => d.media_name,
          d => d.title,
          d => d.media_inlink_count,
          d => d.outlink_count,
          d => d.bitly_click_count,
          d => d.facebook_share_count,
        ])
        .sortBy(d => d.media_inlink_count)  // TODO: make this selectable
        .order(d3.descending);
      this.setState({
        charts: {
          languageChart,
          bitlyClickChart,
          facebookShareChart,
          inlinkChart,
          storiesOverTimeChart,
        },
      });
      dc.renderAll();
    });
  }

  render() {
    return (
      <div className="story-explorer">
        <Grid>
          <div id="story-explorer-loading" style={{ display: 'none' }}>
            <Row>
              <Col lg={12}>
                <LoadingSpinner />
              </Col>
            </Row>
          </div>
          <div id="story-explorer-content" style={{ display: 'none' }}>
            <Row>
              <Col lg={10}>
                <div id="stories-over-time-chart">
                  <h3>
                    <FormattedMessage {...localMessages.storiesChartTitle} />
                    <small>
                      <span className="reset" style={{ display: 'none' }} >
                        <span className="filter" />
                        &nbsp;
                        <a onClick={this.resetStoriesChart} tabIndex={0}><FormattedMessage {...messages.reset} /></a>
                      </span>
                    </small>
                  </h3>
                </div>
              </Col>
              <Col lg={2}>
                <div id="language-chart">
                  <h3>
                    <FormattedMessage {...localMessages.languagesChartTitle} />
                    <small><a className="reset" onClick={this.resetLanguageChart} style={{ display: 'none' }} tabIndex={0}><FormattedMessage {...messages.reset} /></a></small>
                  </h3>
                </div>
              </Col>
            </Row>
            <Row>
              <Col lg={4}>
                <div id="facebook-share-chart">
                  <h3>
                    <FormattedMessage {...localMessages.facebookChartTitle} />
                    <small><a className="reset" onClick={this.resetFacebookChart} style={{ display: 'none' }} tabIndex={0}><FormattedMessage {...messages.reset} /></a></small>
                  </h3>
                </div>
              </Col>
              <Col lg={4}>
                <div id="bitly-click-chart">
                  <h3>
                    <FormattedMessage {...localMessages.bitlyChartTitle} />
                    <small><a className="reset" onClick={this.resetBitlyChart} style={{ display: 'none' }} tabIndex={0}><FormattedMessage {...messages.reset} /></a></small>
                  </h3>
                </div>
              </Col>
              <Col lg={4}>
                <div id="inlink-chart">
                  <h3>
                    <FormattedMessage {...localMessages.inlinkChartTitle} />
                    <small><a className="reset" onClick={this.resetInlinkChart} style={{ display: 'none' }} tabIndex={0}><FormattedMessage {...messages.reset} /></a></small>
                  </h3>
                </div>
              </Col>
            </Row>
            <Row>
              <Col lg={12}>
                <div id="story-counts">
                  Selected
                  &nbsp;<span className="filter-count" />&nbsp;
                  out of <span className="total-count" /> records.
                </div>
              </Col>
            </Row>
            <Row>
              <Col lg={12}>
                <table id="story-table">
                  <thead>
                    <tr className="header">
                      <th><FormattedMessage {...messages.storyDate} /></th>
                      <th>{}</th>
                      <th><FormattedMessage {...messages.media} /></th>
                      <th><FormattedMessage {...messages.storyTitle} /></th>
                      <th><FormattedMessage {...messages.mediaInlinks} /></th>
                      <th><FormattedMessage {...messages.outlinks} /></th>
                      <th><FormattedMessage {...messages.bitlyClicks} /></th>
                      <th><FormattedMessage {...messages.facebookShares} /></th>
                    </tr>
                  </thead>
                </table>
              </Col>
            </Row>
          </div>
        </Grid>
      </div>
    );
  }
}

InfluentialStoryExplorer.propTypes = {
  // from the composition chain
  intl: React.PropTypes.object.isRequired,
  // from parent
  filters: React.PropTypes.object.isRequired,
  topicId: React.PropTypes.number.isRequired,
  selectedTimespan: React.PropTypes.object,
};

export default
  injectIntl(
    InfluentialStoryExplorer
  );
