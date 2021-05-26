class TreeParser {
  tree = [];

  graph = {};

  nodeWidth = 300;

  nodeHeight = 150;

  horizMargin = 20;

  vertMargin = 20;

  constructor(nodes) {
    if (!nodes.length) return;
    this.tree = nodes;
    this.buildGraph();
    this.rank();
    this.normalizeLayers();
    this.sortNodesInLayers();
    this.assignCoordinates();
  }

  getGraph = () => this.graph

  getTree = () => this.tree

  buildGraph = () => {
    for (let t = 0; t < this.tree.length; t += 1) {
      this.graph[this.tree[t].id] = {
        id: this.tree[t].id,
        index: t,
        children: [],
        partners: [],
        parents: [],
        layer: 0,
      };
    }
    for (let t = 0; t < this.tree.length; t += 1) {
      const person = this.tree[t];
      const personNode = this.graph[person.id];
      for (let c = 0; c < person.children.length; c += 1) {
        const childNode = this.graph[person.children[c]];
        personNode.children.push(childNode);
        childNode.parents.push(personNode);
      }
      for (let p = 0; p < person.partners.length; p += 1) {
        personNode.partners.push(this.graph[person.partners[p]]);
      }
    }
  }

  /**
   * Depth first search on `graph`. Each 'node' is the id of one person.
   * Returns an array with the ids in the order they were finished (so that if u
   * is a child of v, u always appears after v)
   */
  dfs = () => {
    const result = [];
    // color for each node (unset => white, 1 => gray, 2 => black)
    const colors = [];

    const impl = (node) => {
      colors[node.id] = 1;

      for (let out = 0; out < node.children.length; out += 1) {
        const child = node.children[out];
        if (!colors[child.id]) {
          impl(child);
        } else if (colors[child.id] === 2) {
          console.log(`cross edge ${node.id} to ${child.id}`);
        }
      }

      colors[node.id] = 2;
      result.push(node);
    };

    Object.keys(this.graph).forEach((id) => {
      if (!colors[id]) {
        impl(this.graph[id]);
      }
    });

    return result;
  }

  /**
   * Compute the min of a and b, ignoring undefined values for a
   */
  min = (a, b) => {
    if (a === undefined) {
      return b;
    }
    return Math.min(a, b);
  }

  max = (a, b) => {
    if (a === undefined) {
      return b;
    }
    return Math.max(a, b);
  }

  /**
   * Compute the 'rank' (i.e. layer) of each person.
   * Starting from the children, assign each person to a layer such that the
   * person is above all its children.
   */
  rank = () => {
    const nodes = this.dfs();

    // Assign layer 0 to nodes with no children, then
    // put their parents one layer above, and so on.

    for (let id = 0; id < nodes.length; id += 1) {
      const node = nodes[id];
      if (!node.children.length) {
        node.layer = 0;
      } else {
        node.layer = 1;
        for (let p = 0; p < node.partners.length; p += 1) {
          if (node.partners[p].layer !== undefined) {
            node.layer = node.partners[p].layer;
            break;
          }
        }

        for (let c = 0; c < node.children.length; c += 1) {
          node.layer = this.max(node.layer, node.children[c].layer + 1);
        }
      }
    }

    // With the algorithm above, it is possible that we now have a child
    // on layer 0, whereas its parent has been set on layer 2 or above to
    // match the partner. We thus do a second pass to try and shortnen the
    // edges, by moving the children up.
    // We repeat until there are no more changes

    let changed = true;

    while (changed) {
      changed = false;

      for (let id = 0; id < nodes.length; id += 1) {
        const node = nodes[id];
        let parentsLayer;
        for (let p = 0; p < node.parents.length; p += 1) {
          parentsLayer = this.min(parentsLayer, node.parents[p].layer);
        }

        if (parentsLayer !== undefined && parentsLayer - 1 > node.layer) {
          node.layer = parentsLayer - 1;
          changed = true;
        }
      }
    }
  }

  /**
   * Normalize the layers, since the rank has assigned layers with any value
   * between -inf..+inf. We also move the oldest ancestor to layer 0, so that
   * it appears at the top of the diagram, rather than have children at the
   * bottom of the diagram.
   */
  normalizeLayers = () => {
    let maxLayer;

    Object.keys(this.graph).forEach((id) => {
      const node = this.graph[id];
      maxLayer = this.max(maxLayer, node.layer);
    });
    Object.keys(this.graph).forEach((id) => {
      const node = this.graph[id];
      node.layer = maxLayer - node.layer;
    });
  }

  /**
   * For each layer, the list of persons on that layer
   */
  perLayer = () => {
    const layers = [];
    Object.keys(this.graph).forEach((id) => {
      const node = this.graph[id];
      if (!layers[node.layer]) {
        layers[node.layer] = [];
      }
      layers[node.layer].push(node);
      node.pos_in_layer = layers[node.layer].length;
    });
    return layers;
  }

  /**
   * Sort nodes within each layer so as to minimize crossing of edges.
   * We use the barycenter method.
   */
  sortNodesInLayers = () => {
    const layers = this.perLayer();

    // compute the barycenter
    for (let l = 1; l < layers.length; l += 1) {
      for (let c = 0; c < layers[l - 1].length; c += 1) {
        const childNode = layers[l - 1][c];
        let total = 0;
        let count = 1;

        for (let p = 0; p < childNode.parents.length; p += 1) {
          const parentNode = childNode.parents[p];
          total += parentNode.pos_in_layer;
          count += 1;
        }

        childNode.weight_in_layer = total / count;
      }

      // Sort nodes on the layer
      layers[l - 1].sort(
        (c1, c2) => c1.weight_in_layer < c2.weight_in_layer,
      );

      // Reset the positions in layers
      for (let c = 0; c < layers[l - 1].length; c += 1) {
        const childNode = layers[l - 1][c];
        childNode.pos_in_Layer = c;
      }
    }
  }

  /**
   * Assign actual coordinates to each node based on information computed
   * previously.
   */
  assignCoordinates = () => {
    Object.keys(this.graph).forEach((id) => {
      const node = this.graph[id];
      this.tree[node.index].x = (this.nodeWidth + this.horizMargin) * node.pos_in_layer;
      this.tree[node.index].y = (this.nodeHeight + this.vertMargin) * node.layer;
    });

    // We again use the barycenter algorithm to get the exact coordinates
    const layers = this.perLayer();

    for (let iteration = 0; iteration < 20; iteration += 1) {
      // top-down

      for (let l = 1; l < layers.length; l += 1) {
        let minX = 0;

        for (let c = 0; c < layers[l].length; c += 1) {
          const childNode = layers[l][c];
          let total = 0;
          let count = 0;

          for (let p = 0; p < childNode.parents.length; p += 1) {
            const parentNode = childNode.parents[p];
            total += this.tree[parentNode.index].x;
            count += 1;
          }

          if (count !== 0) {
            this.tree[childNode.index].x = this.max(minX, total / count);
          } else {
            this.tree[childNode.index].x = this.max(minX, this.tree[childNode.index].x);
          }
          minX = this.tree[childNode.index].x + this.nodeWidth + this.horizMargin;
        }
      }

      // bottom-up
      for (let l = layers.length - 2; l >= 0; l -= 1) {
        let minX = 0;

        for (let c = 0; c < layers[l].length; c += 1) {
          const parentNode = layers[l][c];
          let total = 0;
          let count = 0;

          for (let p = 0; p < parentNode.children.length; p += 1) {
            const childNode = parentNode.children[p];
            total += this.tree[childNode.index].x;
            count += 1;
          }

          if (count !== 0) {
            this.tree[parentNode.index].x = this.max(minX, total / count);
          } else {
            this.tree[parentNode.index].x = this.max(minX, this.tree[parentNode.index].x);
          }
          minX = this.tree[parentNode.index].x + this.nodeWidth + this.horizMargin;
        }
      }
    }

    // Normalize coordinates, so that the left-most child is at x=0
    let minX;
    for (let l = 0; l < layers.length; l += 1) {
      minX = this.min(minX, this.tree[layers[l][0].index].x);
    }
    Object.keys(this.graph).forEach((id) => {
      this.tree[this.graph[id].index].x -= minX;
    });
  }
}

export default TreeParser;
