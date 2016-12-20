import React, {PropTypes} from 'react';
import Dropdown from 'shared/components/Dropdown';
import ReactTooltip from 'react-tooltip';

const DEFAULT_RULE_MESSAGE = '报警规则:{{ .ID }},报警级别:{{ .Level }},Pool:{{ index .Tags "pool" }}';
const DEFAULT_POST_URL = 'https://alerthandler.example.com';

export const RuleMessage = React.createClass({
  propTypes: {
    rule: PropTypes.shape({
      postUrl: PropTypes.string.isRequired,
    }).isRequired,
    actions: PropTypes.shape({
      updateMessage: PropTypes.func.isRequired,
      updatePostUrl: PropTypes.func.isRequired,
    }).isRequired,
    enabledAlerts: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  },

  getInitialState() {
    return {
      post_url: this.props.rule.postUrl ? this.props.rule.postUrl : DEFAULT_POST_URL,
    };
  },

  handleChangeMessage() {
    const {actions, rule} = this.props;
    actions.updateMessage(rule.id, this.message.value);
  },

  handleChooseAlert(item) {
    const {actions} = this.props;
    actions.updateAlerts(item.ruleID, [item.text]);
  },

  handleChangePostUrl(e) {
    const {actions, rule} = this.props;
    actions.updatePostUrl(rule.id, e.target.value);
    this.setState({post_url: e.target.value});
  },

  render() {
    const {rule, actions} = this.props;
    const alerts = this.props.enabledAlerts.map((text) => {
      return {text, ruleID: rule.id};
    });

    return (
      <div className="kapacitor-rule-section">
        <h3 className="rule-section-heading">Alert Message</h3>
        <div className="rule-section-body">
          <textarea
            className="alert-message"
            ref={(r) => this.message = r}
            onChange={() => actions.updateMessage(rule.id, this.message.value)}
            placeholder="Compose your alert message here"
            value={rule.message ? rule.message : DEFAULT_RULE_MESSAGE}
          >{DEFAULT_RULE_MESSAGE}</textarea>
          <div className="alert-message--formatting">
            <p>Templates:</p>
            <code data-tip="The ID of the alert">&#123;&#123;.ID&#125;&#125;</code>
            <code data-tip="Measurement name">&#123;&#123;.Name&#125;&#125;</code>
            <code data-tip="The name of the task">&#123;&#123;.TaskName&#125;&#125;</code>
            <code data-tip="Concatenation of all group-by tags of the form <code>&#91;key=value,&#93;+</code>. If no groupBy is performed equal to literal &quot;nil&quot;">&#123;&#123;.Group&#125;&#125;</code>
            <code data-tip="Map of tags. Use <code>&#123;&#123; index .Tags &quot;key&quot; &#125;&#125;</code> to get a specific tag value">&#123;&#123;.Tags&#125;&#125;</code>
            <code data-tip="Alert Level, one of: <code>INFO</code><code>WARNING</code><code>CRITICAL</code>">&#123;&#123;.Level&#125;&#125;</code>
            <code data-tip="Map of fields. Use <code>&#123;&#123; index .Fields &quot;key&quot; &#125;&#125;</code> to get a specific field value">&#123;&#123;.Fields&#125;&#125;</code>
            <code data-tip="The time of the point that triggered the event">&#123;&#123;.Time&#125;&#125;</code>
            <ReactTooltip effect="solid" html={true} offset={{top: -4}} class="influx-tooltip kapacitor-tooltip" />
          </div>
          <div className="rule-section--item bottom alert-message--endpoint">
            <p>Send this Alert to:</p>
            <Dropdown className="size-256" selected={rule.alerts[0] || 'Choose an output'} items={alerts} onChoose={this.handleChooseAlert} />
            <p>Post to:</p>
            <input
              type="text"
              className="form-control input-sm size-166"
              onChange={this.handleChangePostUrl}
              value={this.state.post_url}
            />
          </div>
        </div>
      </div>
    );
  },
});
export default RuleMessage;
