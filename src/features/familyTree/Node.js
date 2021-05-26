import React from 'react';
import classNames from 'classnames';
import PropTypes, { bool, number, string } from 'prop-types';
import styled from 'styled-components';
import NodeMenu from './NodeMenu';

export default class Node extends React.PureComponent {
  state = {
    x: 0,
    y: 0,
    editName: this.props.data.name,
  }

  editField = React.createRef();

  componentDidUpdate(prevProps) {
    if (!prevProps.editing && this.props.editing) {
      const input = this.editField.current;
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  }

  handleNameEdit = () => {
    const { data } = this.props;

    this.props.onNameEdit(data);
    this.setState({ editName: data.name });
  }

  handleSubmit = () => {
    const { data } = this.props;
    const name = this.state.editName.trim();
    const node = { ...data, ...{ name } };

    this.props.onNameSave(node);
    this.setState({ editName: name });
  }

  handleChange = (e) => {
    if (this.props.editing) {
      this.setState({ editName: e.target.value });
    }
  }

  handleKeyDown = (e) => {
    if (e.which === 27) {
      const { name } = this.props.data;
      this.setState({ editName: name });
      this.props.onEditCancel(e);
    }
    if (e.which === 13) {
      this.handleSubmit();
    }
  }

  onDragStart = (e) => {
    this.initialX = e.clientX;
    this.initialY = e.clientY;
    this.startX = this.state.x;
    this.startY = this.state.y;

    this.onDrag(e);

    document.body.addEventListener('mousemove', this.onDrag);
    document.body.addEventListener('mouseup', this.onDragEnd);
  }

  onDrag = (e) => {
    const x = this.startX + e.clientX - this.initialX;
    const y = this.startY + e.clientY - this.initialY;

    this.setState({
      x,
      y,
    });
  }

  onDragEnd = (e) => {
    this.onDrag(e);
    this.startX = this.state.x;
    this.startY = this.state.y;

    document.body.removeEventListener('mousemove', this.onDrag);
    document.body.removeEventListener('mouseup', this.onDragEnd);
  }

  addMom = () => {
    const { data, onAddParent } = this.props;
    onAddParent(data, 'Mom');
  }

  addDad = () => {
    const { data, onAddParent } = this.props;
    onAddParent(data, 'Dad');
  }

  addPartner = () => {
    const { data, onAddPartner } = this.props;
    const partner = data.gender === 'M' ? 'Wife' : 'Husband';
    onAddPartner(data, partner);
  }

  addSon = () => {
    const { data, onAddChild } = this.props;
    onAddChild(data, 'Son');
  }

  addDaughter = () => {
    const { data, onAddChild } = this.props;
    onAddChild(data, 'Daughter');
  }

  render() {
    const {
      data, editing,
    } = this.props;
    const partner = data.gender === 'M' ? 'Wife' : 'Husband';

    return <NodeItem className={classNames(
      'node',
      { editing },
    )}
        onMouseDown={this.onDragStart}
        xPos={data.x}
        yPos={data.y}
      >
      <div data-node-name={data.name}
        className={classNames(
          'node-inner',
          {
            male: data.gender === 'M',
            female: data.gender === 'F',
            owner: data.owner,
          },
        )}
      >
        <div className="title" onDoubleClick={this.handleNameEdit}>
          {data.name}
        </div>
        <input
          ref={this.editField}
          className="edit"
          value={this.state.editName}
          onBlur={this.handleSubmit}
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
          autoFocus={true}
        />
        <div className="actions">
          <div className="add-btn addMom" onClick={this.addMom}>Mom</div>
          <div className="add-btn addDad" onClick={this.addDad}>Dad</div>
          <div className="add-btn addPartner" onClick={this.addPartner}>
            {partner}
          </div>
          <div className="add-btn addSon" onClick={this.addSon}>Son</div>
          <div className="add-btn addDaughter" onClick={this.addDaughter}>Daughter</div>
        </div>
        <NodeMenu className="item-menu" />
      </div>
    </NodeItem>;
  }
}

Node.propTypes = {
  data: PropTypes.shape({
    id: string,
    name: string,
    gender: string,
    birthday: string,
    owner: bool,
    x: number,
    y: number,
  }).isRequired,
  editing: PropTypes.bool.isRequired,
  onAddParent: PropTypes.func.isRequired,
  onAddPartner: PropTypes.func.isRequired,
  onAddChild: PropTypes.func.isRequired,
  onNameEdit: PropTypes.func.isRequired,
  onNameSave: PropTypes.func.isRequired,
  onEditCancel: PropTypes.func.isRequired,
};

const NodeItem = styled.div.attrs((props) => ({
  style: {
    left: `${props.xPos}px`,
    top: `${props.yPos}px`,
  },
}))`
  position: absolute;
`;
