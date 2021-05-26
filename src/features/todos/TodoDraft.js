import React from 'react';
import PropTypes from 'prop-types';
import TimeAgo from 'react-timeago';

export default class TodoDraft extends React.PureComponent {
  render() {
    const { draft } = this.props;

    return (
      <li>
        <div className="view draft-item">
          <label>
            {draft.text}
          </label>
          <span className="time" key={draft.serverTime}>
            <TimeAgo date={new Date().toString()} />
          </span>
        </div>
      </li>
    );
  }
}

TodoDraft.propTypes = {
  draft: PropTypes.shape({
    id: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]).isRequired,
    text: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    serverTime: PropTypes.string.isRequired,
  }).isRequired,
};
