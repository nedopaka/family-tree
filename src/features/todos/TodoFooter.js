import React from 'react';
import PropTypes from 'prop-types';
import { NavLink as Link } from 'react-router-dom';
import Utils from '../../common/utils';

export default class TodoFooter extends React.PureComponent {
  render() {
    const activeTodoWord = Utils.pluralize(this.props.count, 'item');
    let clearButton = null;

    if (this.props.completedCount > 0) {
      clearButton = (
        <button
          className="clear-completed"
          onClick={this.props.onClearCompleted}>
            Clear completed
        </button>
      );
    }

    return (
      <footer className="footer">
        <span className="todo-count">
          <strong>{this.props.count}</strong> {activeTodoWord} left
        </span>
        <ul className="filters">
          <li>
            <Link
              exact
              to="/todo"
              activeClassName="selected">
                All
            </Link>
          </li>
          <li>
            <Link
              exact
              to="/todo/active"
              activeClassName="selected">
                Active
            </Link>
          </li>
          <li>
            <Link
              exact
              to="/todo/completed"
              activeClassName="selected">
                Completed
            </Link>
          </li>
        </ul>
        {clearButton}
      </footer>
    );
  }
}

TodoFooter.propTypes = {
  count: PropTypes.number,
  completedCount: PropTypes.number,
  onClearCompleted: PropTypes.func,
};
