import React, {PropTypes} from 'react';
import classNames from 'classnames';
import _ from 'lodash';
import selectStatement from '../../chronograf/utils/influxql/select';

import DatabaseList from '../../chronograf/components/DatabaseList';
import MeasurementList from '../../chronograf/components/MeasurementList';
import FieldList from '../../chronograf/components/FieldList';
import TagList from '../../chronograf/components/TagList';

const DB_TAB = 'databases';
const MEASUREMENTS_TAB = 'measurments';
const FIELDS_TAB = 'fields';
const TAGS_TAB = 'tags';
const EVERY_TAB = 'every';
const DATE_RANGE_TAB = 'date_range';

const DEFAULT_EVERY_TIME = '1m';
const DEFAULT_DATE_RANGE_FROM = '8';
const DEFAULT_DATE_RANGE_TO = '20';

export const DataSection = React.createClass({
  propTypes: {
    source: PropTypes.shape({
      links: PropTypes.shape({
        kapacitors: PropTypes.string.isRequired,
      }).isRequired,
    }),
    query: PropTypes.shape({
      id: PropTypes.string.isRequired,
      every: PropTypes.string.isRequired,
      date_range_from: PropTypes.string.isRequired,
      date_range_to: PropTypes.string.isRequired,
    }).isRequired,
    addFlashMessage: PropTypes.func,
    actions: PropTypes.shape({
      chooseNamespace: PropTypes.func.isRequired,
      chooseMeasurement: PropTypes.func.isRequired,
      applyFuncsToField: PropTypes.func.isRequired,
      chooseTag: PropTypes.func.isRequired,
      groupByTag: PropTypes.func.isRequired,
      toggleField: PropTypes.func.isRequired,
      groupByTime: PropTypes.func.isRequired,
      toggleTagAcceptance: PropTypes.func.isRequired,
      setEvery: PropTypes.func.isRequired,
      setDateRangeFrom: PropTypes.func.isRequired,
      setDateRangeTo: PropTypes.func.isRequired,
    }).isRequired,
  },

  childContextTypes: {
    source: PropTypes.shape({
      links: PropTypes.shape({
        proxy: PropTypes.string.isRequired,
        self: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
  },

  getChildContext() {
    return {source: this.props.source};
  },

  getInitialState() {
    return {
      activeTab: DB_TAB,
      every: this.props.query.every ? this.props.query.every : DEFAULT_EVERY_TIME,
      date_range_from: this.props.query.date_range_from ? this.props.query.date_range_from : DEFAULT_DATE_RANGE_FROM,
      date_range_to: this.props.query.date_range_to ? this.props.query.date_range_to : DEFAULT_DATE_RANGE_TO,
    };
  },

  handleChooseNamespace(namespace) {
    this.props.actions.chooseNamespace(this.props.query.id, namespace);

    this.setState({activeTab: MEASUREMENTS_TAB});
  },

  handleChooseMeasurement(measurement) {
    this.props.actions.chooseMeasurement(this.props.query.id, measurement);

    this.setState({activeTab: FIELDS_TAB});
  },

  handleToggleField(field) {
    this.props.actions.toggleField(this.props.query.id, field, true);
  },

  handleGroupByTime(time) {
    this.props.actions.groupByTime(this.props.query.id, time);
  },

  handleApplyFuncsToField(fieldFunc) {
    this.props.actions.applyFuncsToField(this.props.query.id, fieldFunc);
  },

  handleChooseTag(tag) {
    this.props.actions.chooseTag(this.props.query.id, tag);
  },

  handleToggleTagAcceptance() {
    this.props.actions.toggleTagAcceptance(this.props.query.id);
  },

  handleGroupByTag(tagKey) {
    this.props.actions.groupByTag(this.props.query.id, tagKey);
  },

  handleClickTab(tab) {
    this.setState({activeTab: tab});
  },

  handleInputEvery(e) {
    this.props.actions.setEvery(this.props.query.id, e.target.value);
    this.setState({every: e.target.value});
  },

  handleInputDateRangeFrom(e) {
    this.props.actions.setDateRangeFrom(this.props.query.id, e.target.value);
    this.setState({date_range_from: e.target.value});
  },

  handleInputDateRangeTo(e) {
    this.props.actions.setDateRangeTo(this.props.query.id, e.target.value);
    this.setState({date_range_to: e.target.value});
  },

  render() {
    const {query} = this.props;
    const timeRange = {lower: 'now() - 15m', upper: null};
    const statement = query.rawText || selectStatement(timeRange, query) || `SELECT "fields" FROM "db"."rp"."measurement"`;

    return (
      <div className="kapacitor-rule-section">
        <h3 className="rule-section-heading">Select a Time Series</h3>
        <div className="rule-section-body">
          <div className="query-editor kapacitor-metric-selector">
            <div className="query-editor__code">
              <pre className={classNames("", {"rq-mode": query.rawText})}><code>{statement}</code></pre>
            </div>
            {this.renderEditor()}
          </div>
        </div>
      </div>
    );
  },

  renderEditor() {
    const {activeTab} = this.state;
    const {query} = this.props;
    if (query.rawText) {
      return (
        <div className="generic-empty-state query-editor-empty-state">
          <p className="margin-bottom-zero">
            <span className="icon alert-triangle"></span>
            &nbsp;Only editable in the <strong>Raw Query</strong> tab.
          </p>
        </div>
      );
    }

    return (
      <div className="kapacitor-tab-list">
        <div className="query-editor__tabs">
          <div onClick={_.wrap(DB_TAB, this.handleClickTab)} className={classNames("query-editor__tab", {active: activeTab === DB_TAB})}>Databases</div>
          <div onClick={_.wrap(MEASUREMENTS_TAB, this.handleClickTab)} className={classNames("query-editor__tab", {active: activeTab === MEASUREMENTS_TAB})}>Measurements</div>
          <div onClick={_.wrap(FIELDS_TAB, this.handleClickTab)} className={classNames("query-editor__tab", {active: activeTab === FIELDS_TAB})}>Fields</div>
          <div onClick={_.wrap(TAGS_TAB, this.handleClickTab)} className={classNames("query-editor__tab", {active: activeTab === TAGS_TAB})}>Tags</div>
          <div onClick={_.wrap(EVERY_TAB, this.handleClickTab)} className={classNames("query-editor__tab", {active: activeTab === EVERY_TAB})}>Every</div>
          <div onClick={_.wrap(DATE_RANGE_TAB, this.handleClickTab)} className={classNames("query-editor__tab", {active: activeTab === DATE_RANGE_TAB})}>Hour Range</div>
        </div>
        {this.renderList()}
      </div>
    );
  },

  renderList() {
    const {query} = this.props;

    switch (this.state.activeTab) {
      case DB_TAB:
        return (
          <DatabaseList
            query={query}
            onChooseNamespace={this.handleChooseNamespace}
          />
        );
      case MEASUREMENTS_TAB:
        return (
          <MeasurementList
            query={query}
            onChooseMeasurement={this.handleChooseMeasurement}
          />
        );
      case FIELDS_TAB:
        return (
          <FieldList
            query={query}
            onToggleField={this.handleToggleField}
            onGroupByTime={this.handleGroupByTime}
            applyFuncsToField={this.handleApplyFuncsToField}
            isKapacitorRule={true}
          />
        );
      case TAGS_TAB:
        return (
          <TagList
            query={query}
            onChooseTag={this.handleChooseTag}
            onGroupByTag={this.handleGroupByTag}
            onToggleTagAcceptance={this.handleToggleTagAcceptance}
          />
        );
      case EVERY_TAB:
        return (
          <div>
            <div className="query-editor__list-header">
              <input
                className="form-control input-sm size-166"
                type="text"
                value={this.state.every}
                onChange={this.handleInputEvery}
              />
            </div>
          </div>
        );
      case DATE_RANGE_TAB:
        return (
          <div>
            <div className="query-editor__list-header">
              <input
                className="form-control input-sm size-166"
                type="text"
                value={this.state.date_range_from}
                onChange={this.handleInputDateRangeFrom}
              />
              -
              <input
                className="form-control input-sm size-166"
                type="text"
                value={this.state.date_range_to}
                onChange={this.handleInputDateRangeTo}
              />
            </div>
          </div>
        );
      default:
        return <ul className="query-editor__list"></ul>;
    }
  },
});

export default DataSection;
