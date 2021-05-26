import React from 'react';
import { connect } from 'react-redux';
import { unwrapResult } from '@reduxjs/toolkit';
import PropTypes from 'prop-types';
import { fetchFamilyTree, addNode, updateNode } from './familyTreeSlice';
import Node from './Node';
import TreeParser from '../../common/TreeParser';

class FamilyTree extends React.PureComponent {
  state = {
    user: this.props.user,
    editing: null,
  }

  componentDidMount() {
    this.showFamilyTree();
    document.title = 'Family Tree';
    document.body.classList = 'family-tree';
  }

  showFamilyTree = () => {
    this.props.fetchFamilyTree()
      .then(unwrapResult)
      .then((data) => {
        if (data.length) return;
        const { id, name, gender } = this.state.user;
        const node = {
          user: id, name, gender, owner: true,
        };
        this.props.addNode({ node });
      });
  }

  handleNameEdit = (node) => {
    this.setState({ editing: node.id });
  }

  handleNameSave = (node) => {
    this.props.updateNode(node);
    this.setState({ editing: null });
  }

  handleEditCancel = () => {
    this.setState({ editing: null });
  }

  handleAddParent = (item, relation) => {
    const user = this.state.user.id;
    const srcId = item.id;
    const type = 'addParent';

    const name = `${item.name}'s ${relation}`;
    const gender = relation === 'Mom' ? 'F' : 'M';
    const roleAsParent = relation;
    const children = [item.id];

    const node = {
      user, name, gender, roleAsParent, children,
    };
    const action = {
      type, srcId, node,
    };

    this.props.addNode({ action });
  }

  handleAddPartner = (item, relation) => {
    const user = this.state.user.id;
    const srcId = item.id;
    const type = 'addPartner';

    const name = `${item.name}'s ${relation}`;
    const gender = relation === 'Wife' ? 'F' : 'M';
    const partners = [item.id];

    const node = {
      user, name, gender, partners,
    };
    const action = {
      type, srcId, node,
    };

    this.props.addNode({ action });
  }

  handleAddChild = (item, relation) => {
    const user = this.state.user.id;
    const srcId = item;
    const type = 'addChild';

    const name = `${item.name}'s ${relation}`;
    const gender = relation === 'Daughter' ? 'F' : 'M';

    const node = {
      user, name, gender,
    };
    const action = {
      type, srcId, node,
    };

    this.props.addNode({ action });
  }

  render() {
    const { tree, graph } = this.props;

    return <div className="family-tree-app">
      <div className="tree-container">
        <div className="stage">
          <svg className="links-wrp" />
          <div className="nodes-wrp">
            {tree.map((item) => (
              <Node
                key={item.id}
                data={item}
                graph={graph[item.id]}
                editing={this.state.editing === item.id}
                onAddParent={this.handleAddParent}
                onAddPartner={this.handleAddPartner}
                onAddChild={this.handleAddChild}
                onNameEdit={this.handleNameEdit}
                onNameSave={this.handleNameSave}
                onEditCancel={this.handleEditCancel}
              />
            ), this)}
          </div>
        </div>
      </div>
    </div>;
  }
}

FamilyTree.propTypes = {
  user: PropTypes.object.isRequired,
  graph: PropTypes.object.isRequired,
  tree: PropTypes.array.isRequired,
  fetchFamilyTree: PropTypes.func.isRequired,
  addNode: PropTypes.func.isRequired,
  updateNode: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  const { nodes } = state.familyTree;
  const parser = new TreeParser(nodes.map((a) => ({ ...a })));
  const graph = parser.getGraph();
  const tree = parser.getTree();
  return {
    user: state.user.user,
    graph,
    tree,
  };
};

export default connect(
  mapStateToProps,
  { fetchFamilyTree, addNode, updateNode },
)(FamilyTree);
