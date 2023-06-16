import type { Cache } from './interface';

interface Node<K, V> {
  key: K;
  value: V;
  prev?: Node<K, V>;
  next?: Node<K, V>;
}

export default function cacheLRU<K, V>(limit = 10): Cache<K, V> {
  let size = 0;

  let head: Node<K, V> | undefined = undefined;
  let tail: Node<K, V> | undefined = undefined;

  function find(key: K) {
    let node = head;
    while (node && node.key !== key) {
      node = node.next;
    }
    return node;
  }

  function moveToHead(node: Node<K, V>) {
    if (!node.prev) {
      // 本来在 HEAD 处，不需要移动
      return;
    }
    if (!node.next) {
      // 本来在 TAIL 处，尾部前移一个节点
      tail = node.prev;
      tail.next = undefined;
    } else {
      // 本来在其他位置，前后两个节点连接
      node.prev.next = node.next;
      node.next.prev = node.prev;
    }

    // 将节点移动到 HEAD 前
    node.next = head!;
    head!.prev = node;

    // 头部前移一个节点
    head = node;
    head.prev = undefined;
  }

  const inst = {
    size,
    limit,
    set: (key: K, value: V) => {
      if (!size || !head || !tail) {
        head = { key, value };
        tail = head;
        size = 1;
      } else {
        let temp = find(key);

        if (temp) {
          temp.value = value;
          moveToHead(temp);
        } else {
          temp = { key, value, next: head };
          head.prev = temp;
          head = temp;
          size += 1;
        }
      }
      if (size > limit) {
        tail = tail.prev;
        if (tail) {
          tail.next = undefined;
        }
        size = limit;
      }
    },
    get: (key: K) => {
      const temp = find(key);
      if (temp) {
        moveToHead(temp);
      }
      return temp?.value;
    },
    find: (key: K) => {
      return find(key)?.value;
    },
    has: (key: K) => find(key) !== undefined,
    del: (key: K) => {
      const temp = find(key);
      if (temp) {
        if (temp.prev) {
          temp.prev.next = temp.next;
        } else {
          head = temp.next;
        }
        if (temp.next) {
          temp.next.prev = temp.prev;
        } else {
          tail = temp.prev;
        }
        size -= 1;
      }
      return temp?.value;
    },
    clear: () => {
      head = undefined;
      tail = undefined;
      size = 0;
    },
    keys: () => {
      const list: K[] = [];
      let node = head;
      while (node) {
        list.push(node.key);
        node = node.next;
      }
      return list;
    },
    values: () => {
      const list: V[] = [];
      let node = head;
      while (node) {
        list.push(node.value);
        node = node.next;
      }
      return list;
    },
    entries: () => {
      const list: Array<[K, V]> = [];
      let node = head;
      while (node) {
        list.push([node.key, node.value]);
        node = node.next;
      }
      return list;
    },
    toJSON: () => {
      const list: Array<{ key: K, value: V }> = [];
      let node = head;
      while (node) {
        list.push({ key: node.key, value: node.value });
        node = node.next;
      }
      return list;
    }
  };

  Object.defineProperties(inst, {
    size: {
      get() {
        return size;
      }
    },
    limit: {
      get() {
        return limit;
      },
      set(v: number) {
        limit = v;

        let node = head;
        let idx = 0;
        while (node) {
          if (idx === limit) {
            tail = node.prev;
            if (tail) {
              tail.next = undefined;
            }
            size = limit;
            break;
          }
          node = node.next;
          idx++;
        }
      }
    }
  });

  return inst;
}
