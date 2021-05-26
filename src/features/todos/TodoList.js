import React from 'react';
import { connect } from 'react-redux';
import { createSelector, unwrapResult } from '@reduxjs/toolkit';
import PropTypes from 'prop-types';
import { withRouter, matchPath } from 'react-router-dom';
import { toast } from 'react-toastify';
import TodoFooter from './TodoFooter';
import TodoItem from './TodoItem';
import TodoDraft from './TodoDraft';
import {
  onNewTodoInput,
  onStopTyping,
  onAddTodo,
  onUpdate,
  onToggleAll,
  onDestroy,
  onClearCompleted,
  fetchTodos,
  addTodo,
  update,
  toggleAll,
  destroy,
  clearCompleted,
} from './todosSlice';
import { VisibilityFilters } from '../filters/filtersSlice';

const ENTER_KEY = 13;
const WAIT_INTERVAL = 1e3;

const getFilterFromUrl = (url) => {
  const match = matchPath(
    url,
    {
      path: '/todo/:filter(active|completed|todo)?',
    },
  );

  return match === null ? '' : match.params.filter || 'all';
};

const getTodoFromUrl = (url) => {
  const match = matchPath(
    url,
    {
      path: '/todo/:id',
    },
  );

  return match === null ? '' : match.params.id;
};

const selectTodos = (state) => state.todos.items;
const selectFilter = (state, match) => {
  const { url } = match;
  const show = getFilterFromUrl(url);
  const todo = getTodoFromUrl(url);

  return { show, todo };
};

const selectVisibleTodos = createSelector(
  [selectTodos, selectFilter],
  (todos, filter) => {
    switch (filter.show) {
      case VisibilityFilters.SHOW_ALL:
        return todos;
      case VisibilityFilters.SHOW_COMPLETED:
        return todos.filter((t) => t.completed);
      case VisibilityFilters.SHOW_ACTIVE:
        return todos.filter((t) => !t.completed);
      case VisibilityFilters.SHOW_TODO:
        return todos.filter((t) => t.id === filter.todo);
      default:
        throw new Error(`Unknown filter: ${filter}`);
    }
  },
);

const mapStateToProps = (state, { match }) => ({
  todos: selectVisibleTodos(state, match),
  typings: Object.values(state.todos.typings),
  editing: match.params.action === 'edit' && match.params.id,
  count: state.todos.items.length,
  activeTodoCount: state.todos.items.reduce(
    (accum, todo) => (todo.completed ? accum : accum + 1), 0,
  ),
  completedCount: state.todos.items.reduce(
    (accum, todo) => (!todo.completed ? accum : accum + 1), 0,
  ),
  status: state.todos.status,
  isTyping: state.todos.isTyping,
  info: state.todos.info,
  error: state.todos.error,
});

const mapDispatchToProps = {
  onNewTodoInput,
  onStopTyping,
  onAddTodo,
  onUpdate,
  onToggleAll,
  onDestroy,
  onClearCompleted,
  fetchTodos,
  addTodo,
  update,
  toggleAll,
  destroy,
  clearCompleted,
};

class TodoList extends React.PureComponent {
  state = {
    editing: this.props.editing,
    newTodo: '',
  };

  timer = 0;

  typing = false;

  componentDidMount() {
    this.showTodos();
    document.title = 'Todo';
    document.body.classList = 'todo';
  }

  componentDidUpdate(prevProps) {
    const {
      editing, status, error, info,
    } = this.props;

    if (editing !== prevProps.editing) {
      this.setState({ editing });
    }
    if (status === 'idle' && info.length && info !== prevProps.info) {
      toast.success(<div className="debug-info">{info}</div>);
    }
    if (status === 'error' && status !== prevProps.status) {
      toast.error(error);
    }
  }

  handleChange = (e) => {
    const { value } = e.target;

    clearTimeout(this.timer);
    this.typing = true;
    this.setState({ newTodo: value });
    this.props.onNewTodoInput({ text: value });
    this.timer = setTimeout(this.stopTyping, WAIT_INTERVAL);
  }

  stopTyping = () => {
    this.typing = false;
    this.props.onStopTyping();
  }

  handleNewTodoKeyDown = (e) => {
    if (e.keyCode !== ENTER_KEY) {
      return;
    }

    e.preventDefault();

    const val = this.state.newTodo.trim();

    if (val) {
      this.props.addTodo(val)
        .then(unwrapResult)
        .then((data) => this.props.onAddTodo(data));
      this.setState({ newTodo: '' });
    }
  }

  handleToggleAll = (e) => {
    const { checked } = e.target;
    this.props.toggleAll(checked)
      .then(unwrapResult)
      .then((data) => this.props.onToggleAll(data));
  }

  handleToggle = (todoToToggle) => () => {
    const completed = !todoToToggle.completed;
    const todo = { ...todoToToggle, ...{ completed } };
    this.props.update(todo)
      .then(unwrapResult)
      .then((data) => this.props.onUpdate(data));
  }

  handleDestroy = (todo) => () => {
    this.props.destroy(todo)
      .then(unwrapResult)
      .then((data) => this.props.onDestroy(data));
    this.cancel();
  }

  handleEdit = (todo) => {
    this.setState({ editing: todo.id });
  }

  handleSave = (todoToSave) => (text) => {
    const todo = { ...todoToSave, ...{ text } };
    this.props.update(todo)
      .then(unwrapResult)
      .then((data) => this.props.onUpdate(data));
    this.setState({ editing: null });
  }

  handleCancel = () => {
    this.setState({ editing: null });
  }

  handleClearCompleted = () => {
    this.props.clearCompleted()
      .then(unwrapResult)
      .then((data) => this.props.onClearCompleted(data));
  }

  showTodos = () => {
    this.props.fetchTodos();
  }

  render() {
    const {
      todos, typings, isTyping, count, activeTodoCount, completedCount,
    } = this.props;

    return <>
      <div className="todos-wrp todoapp">
        <header className="header">
          <h1>todos</h1>
          <input
            className="new-todo"
            placeholder="What needs to be done?"
            value={this.state.newTodo}
            onKeyDown={this.handleNewTodoKeyDown}
            onChange={this.handleChange}
            autoFocus={true}
          />
          {!!todos.length && <div><input
              id="toggle-all"
              className="toggle-all"
              type="checkbox"
              onChange={this.handleToggleAll}
              checked={activeTodoCount === 0}
            />
            <label
              htmlFor="toggle-all"
            />
          </div>}
        </header>
        {!!typings.length && <section className="draft">
          <div className="title">
            <span>Drafts listening...</span>
            {isTyping && <div className="wave">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
            </div>}
          </div>
          <ul className="todo-list">
            {typings.map((draft) => (
              <TodoDraft
                key={draft.id}
                draft={draft}
              />
            ), this)}
          </ul>
        </section>}
        {!!todos.length && <section className="main">
            {!!typings.length && <div className="title">Todos List</div>}
            <ul className="todo-list">
              {todos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={this.handleToggle}
                  onDestroy={this.handleDestroy}
                  onEdit={this.handleEdit}
                  editing={this.state.editing === todo.id}
                  onSave={this.handleSave}
                  onCancel={this.handleCancel}
                />
              ), this)}
            </ul>
          </section>
        }
        {!!count && <TodoFooter
            count={activeTodoCount}
            completedCount={completedCount}
            onClearCompleted={this.handleClearCompleted}
          />
        }
      </div>
    </>;
  }
}

TodoList.propTypes = {
  fetchTodos: PropTypes.func.isRequired,
  todos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]).isRequired,
      completed: PropTypes.bool.isRequired,
      text: PropTypes.string.isRequired,
    }).isRequired,
  ).isRequired,
  typings: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
      serverTime: PropTypes.string.isRequired,
    }).isRequired,
  ).isRequired,
  onNewTodoInput: PropTypes.func.isRequired,
  onStopTyping: PropTypes.func.isRequired,
  onAddTodo: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onToggleAll: PropTypes.func.isRequired,
  onDestroy: PropTypes.func.isRequired,
  onClearCompleted: PropTypes.func.isRequired,
  editing: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.string,
  ]).isRequired,
  count: PropTypes.number.isRequired,
  activeTodoCount: PropTypes.number.isRequired,
  completedCount: PropTypes.number.isRequired,
  status: PropTypes.string.isRequired,
  isTyping: PropTypes.bool.isRequired,
  info: PropTypes.string.isRequired,
  error: PropTypes.string.isRequired,
  update: PropTypes.func.isRequired,
  addTodo: PropTypes.func.isRequired,
  toggleAll: PropTypes.func.isRequired,
  destroy: PropTypes.func.isRequired,
  clearCompleted: PropTypes.func.isRequired,
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(TodoList),
);
