const Utils = {
  pluralize(count, word) {
    return count === 1 ? word : `${word}s`;
  },

  store(namespace, data) {
    if (data) {
      return localStorage.setItem(namespace, JSON.stringify(data));
    }

    const store = localStorage.getItem(namespace);
    return (store && JSON.parse(store)) || [];
  },
};

export default Utils;
