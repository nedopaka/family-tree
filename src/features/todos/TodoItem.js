import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const ESCAPE_KEY = 27;
const ENTER_KEY = 13;

export default class TodoItem extends React.PureComponent {
  state = { editText: this.props.todo.text };

  editField = React.createRef();

  componentDidUpdate(prevProps) {
    if (!prevProps.editing && this.props.editing) {
      const node = this.editField.current;
      node.focus();
      node.setSelectionRange(node.value.length, node.value.length);
    }
  }

  handleSubmit = () => {
    const { todo } = this.props;
    const val = this.state.editText.trim();

    if (val) {
      this.props.onSave(todo)(val);
      this.setState({ editText: val });
      return;
    }
    this.props.onDestroy(todo)();
  }

  handleEdit = () => {
    const { todo } = this.props;

    this.props.onEdit(todo);
    this.setState({ editText: todo.text });
  }

  handleKeyDown = (e) => {
    if (e.which === ESCAPE_KEY) {
      this.setState({ editText: this.props.todo.text });
      this.props.onCancel(e);
    }
    if (e.which === ENTER_KEY) {
      this.handleSubmit(e);
    }
  }

  handleChange = (e) => {
    if (this.props.editing) {
      this.setState({ editText: e.target.value });
    }
  }

  render() {
    const { todo } = this.props;

    return (
      <li className={classNames({
        completed: this.props.todo.completed,
        editing: this.props.editing,
      })}>
        <div className="view">
          <input
            className="toggle"
            type="checkbox"
            checked={this.props.todo.completed}
            onChange={this.props.onToggle(todo)}
          />
          <label onDoubleClick={this.handleEdit}>
            {todo.text}
          </label>
          <button className="destroy" onClick={this.props.onDestroy(todo)} />
        </div>
        <input
          ref={this.editField}
          className="edit"
          value={this.state.editText}
          onBlur={this.handleSubmit}
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
          autoFocus={true}
        />
      </li>
    );
  }
}

TodoItem.propTypes = {
  todo: PropTypes.shape({
    id: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]).isRequired,
    completed: PropTypes.bool.isRequired,
    text: PropTypes.string.isRequired,
  }).isRequired,
  editing: PropTypes.bool.isRequired,
  onSave: PropTypes.func.isRequired,
  onDestroy: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onToggle: PropTypes.func.isRequired,
};
