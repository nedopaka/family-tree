const treeApi = require('express').Router({ mergeParams: true });

module.exports = treeApi;

/**
 * Fetch tree's nodes
 */
treeApi.get('/:user([a-f\\d]{24})', async (req, res) => {
  const { user } = req.params;

  req.context.models.Tree.find({ user })
    .then((nodes) => res.send(nodes))
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err });
    });
});

/**
 * Create generic node without side effects
 */
treeApi.post('/node', (req, res) => {
  if (!req.body.node) {
    const message = 'Request\'s body is empty';
    res.status(500).json({ res: 0, action: 'add', message });
    return;
  }

  const {
    user, name, gender, owner, children, partners,
  } = req.body.node;

  req.context.models.Tree.create({
    user,
    name,
    gender,
    owner,
    children,
    partners,
  })
    .then((node) => {
      console.log(`${new Date()} - family tree's node added: ${JSON.stringify(node)}`);
      res.json({ res: 1, action: 'add', node });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err });
    });
});

/**
 * Process tree's action
 */
treeApi.post('/action', (req, res) => {
  let message;
  if (!req.body.action) {
    message = 'Request\'s body is empty';
    res.status(500).json({ res: 0, action: 'add', message });
    return;
  }

  const {
    type, srcId, node,
  } = req.body.action;

  if (!type) {
    message = 'Action\'s type is missing';
    res.status(500).json({ res: 0, action: 'add', message });
    return;
  }
  if (!srcId) {
    message = 'Action\'s srcId is missing';
    res.status(500).json({ res: 0, action: 'add', message });
    return;
  }
  if (!node) {
    message = 'Action\'s node is missing';
    res.status(500).json({ res: 0, action: 'add', message });
    return;
  }

  const {
    user, name, gender, owner, roleAsParent, children, partners,
  } = node;

  req.context.models.Tree.create({
    user,
    name,
    gender,
    owner,
    roleAsParent,
    children,
    partners,
  })
    .then(async (newNode) => {
      console.log(`${new Date()} - family tree's node added: ${JSON.stringify(newNode)}`);
      let conditions;
      let update;
      let parents;
      let updatedNode;
      switch (type) {
        case 'addParent':
          parents = await req.context.models.Tree.find({ children: srcId });
          if (parents.length < 2) return null;
          // partners update
          conditions = { _id: parents[0].id };
          update = { $addToSet: { partners: parents[1].id } };
          updatedNode = await req.context.models.Tree
            .findOneAndUpdate(conditions, update, { new: true });
          if (updatedNode) {
            console.log(`${new Date()} - family tree's node updated: ${JSON.stringify(updatedNode)}`);
          }
          conditions = { _id: parents[1].id };
          update = { $addToSet: { partners: parents[0].id } };
          updatedNode = await req.context.models.Tree
            .findOneAndUpdate(conditions, update, { new: true });
          if (updatedNode) {
            console.log(`${new Date()} - family tree's node updated: ${JSON.stringify(updatedNode)}`);
          }
          return null;
        case 'addPartner':
          conditions = {
            _id: srcId,
            partners: { $ne: newNode.id },
          };
          update = {
            $addToSet: { partners: newNode.id },
          };
          return req.context.models.Tree.findOneAndUpdate(conditions, update, { new: true });
        case 'addChild':
          conditions = {
            _id: srcId,
            children: { $ne: newNode.id },
          };
          update = {
            $addToSet: { children: newNode.id },
          };
          return req.context.models.Tree.findOneAndUpdate(conditions, update, { new: true });
        default:
          message = 'Undefined node\'s action';
          return Promise.reject(message);
      }
    })
    .then((updNode) => {
      if (updNode) {
        console.log(`${new Date()} - family tree's node updated: ${JSON.stringify(updNode)}`);
      }
      return req.context.models.Tree.find({ user });
    })
    .then((nodes) => {
      res.json({ res: 1, action: 'add', nodes });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err });
    });
});

/**
 * Update tree's node
 */
treeApi.put('/:id', (req, res) => {
  if (!req.body.node) {
    const message = 'Request\'s body is empty';
    res.status(500).json({ res: 0, action: 'update', message });
    return;
  }

  const data = req.body.node;
  const { id } = data;

  req.context.models.Tree.findByIdAndUpdate(
    id,
    data,
    { new: true },
  )
    .then((node) => {
      console.log(`${new Date()} - family tree's node updated: ${JSON.stringify(node)}`);
      res.json({ res: 1, action: 'update', node });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err });
    });
});

/**
 * Delete tree's node
 */
treeApi.delete('/:id([a-f\\d]{24})', (req, res) => {
  const { id } = req.params;
  let user;

  req.context.models.Tree.findById(id)
    .then((node) => {
      user = node.user;
      node.remove();
    })
    .then(() => {
      req.context.models.Tree.updateMany({ user }, { $pull: { children: id, partners: id } });
    })
    .then(() => req.context.models.Tree.find({ user }))
    .then((nodes) => {
      console.log(`${new Date()} - family tree's node removed: ${id}`);
      res.json({
        res: 1, action: 'delete', id, nodes,
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err });
    });
});
