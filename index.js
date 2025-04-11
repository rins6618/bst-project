const { stdout } = require('node:process');

/** @template T */
class BSTNode {
    /** @type {T} */
    value;
    /** @type {BSTNode<T>|null} */
    left;
    /** @type {BSTNode<T>|null} */
    right;

    /** @param {T} value  */
    constructor(value) {
        this.value = value;
    }
};

/** @typedef {[number, number]} Width */

/**
 * @template T
 * @typedef {{node: BSTNode<T>, range: Width}} NodeView
 * @param {T[]} arr
 * @param {(a: T, b: T) => number} sort
 * @returns {BSTNode<T>|null} 
 */
function buildTree(arr, sort = ((a, b) => a - b)) {
    if (arr.length === 0) return null;
    arr.sort(sort);
    arr = arr.filter((val, i) => arr.indexOf(val) === i);
    
    const [rStart, rEnd] = [0, arr.length - 1];
    const mid = Math.floor(rEnd / 2);
    let middleElem = arr[mid];

    const root = new BSTNode(middleElem);

    /** @type {NodeView<T>[]} */
    const queue = [{node: root, range: [rStart, rEnd]}];

    for (let qidx = 0; qidx < queue.length; qidx++) {
        const element = queue[qidx];
        let node = element.node;
        let [front, back] = element.range;
        let index = front + Math.floor((back - front) / 2);

        if (front < index) {
            let midLeft = front + Math.floor((index - 1 - front) / 2);
            let left = new BSTNode(arr[midLeft]);
            node.left = left;
            queue.push({node: left, range: [front, index - 1]});
        }
        if (back > index) {
            let midRight = index + 1 + Math.floor((back - index - 1) / 2);
            let right = new BSTNode(arr[midRight]);
            node.right = right;
            queue.push({node: right, range: [index + 1, back]});
        }
    } 

    return root;
}

/** @template T */
class Tree {

    /** @type {BSTNode<T> | null} */
    root;

    /** @param {T[]} arr  */
    constructor(arr) {
        this.root = buildTree(arr);
    }

    /** @param {T} val  */
    insert(val) {
        const tempNode = new BSTNode(val);
        if (this.root == null) {
            this.root = tempNode;
        }

        let parent = null;
        let ref = this.root;
        while (ref != null) {
            parent = ref;
            if (ref.value > val) {
                ref = ref.left;
            } else if (ref.value < val) {
                ref = ref.right;
            } else {
                return;
            }
        }
        if (parent.value > val) {
            parent.left = tempNode;
        } else if (parent.value < val) {
            parent.right = tempNode;
        }
    }

    /** 
     * @param {BSTNode<T>} node  
     * @param {BSTNode<T>} parent  
     * */
   #removeNode(node, parent) {
       /** 
        * @param {BSTNode<T>} node1
         * @param {BSTNode<T>} node2
         */
        const swapNodes = (node1, node2) => {
            let aux = node2.value;
            node2.value = node1.value;
            node1.value = aux;
        }
        
        if (node == null) return;       

        if (node.left == null && node.right == null) {
            const idx = node.value < parent.value ? 'left' : 'right';
            parent[idx] = null;
            return;
        } else if (node.left == null || node.right == null) {
            const child = node.left == null ? 'right' : 'left';
            swapNodes(node[child], node);
            this.#removeNode(node[child], node);
        } else {
            /** @param {BSTNode<T>} node */
            const findNext = (node) => {
                let parent = node;
                node = node.right;
                while (node != null && node.left != null) {
                    parent = node;
                    node = node.left;
                }
                return [parent, node];
            }
            
            const [subparent, replace] = findNext(node);
            swapNodes(replace, node);
            this.#removeNode(replace, subparent);
        }

    }

    /** @param {T} val  */
    removeValue(val) {
        let parent = this.root;
        let ref = this.root;
        while (ref != null) {
            if (ref.value > val) {
                parent = ref;
                ref = ref.left;
            } else if (ref.value < val) {
                parent = ref;
                ref = ref.right;
            } else {
                this.#removeNode(ref, parent);
                return true;
            }
        }

        return false;
    }

    /** @param {T} value  */
    find(value) {
        let ref = this.root;
        while (ref != null) {
            if (ref.value > value) {
                ref = ref.left;
            } else if (ref.value < value) {
                ref = ref.right;
            } else {
                return ref;
            }
        }

        return null;
    }

    /** @param {(v: BSTNode<T>) => void} callback  */
    levelOrder(callback) {
        if (typeof callback !== 'function') {
            throw new TypeError("No callback provided");
        }

        const queue = [this.root];
        while (queue.length !== 0) {
            const node = queue.shift();
            if (node == null) continue;
            queue.push(node.left, node.right);
            callback(node);
        }
    }

    /** @param {(v: BSTNode<T>) => void} callback  */
    inOrder(callback) { this.#xOrder(callback, 'in'); }

    /** @param {(v: BSTNode<T>) => void} callback  */
    preOrder(callback) { this.#xOrder(callback, 'pre'); }

    /** @param {(v: BSTNode<T>) => void} callback  */
    postOrder(callback) { this.#xOrder(callback, 'post'); }

    /**
     * @param {(v: BSTNode<T>) => void} callback 
     * @param {'post' | 'pre' | 'in'} method 
     */
    #xOrder(callback, method) {
        const stack = [];
        let viewed = this.root;
        let prev = null;

        while ((stack.length) != 0 || viewed != null) {
            if (method === 'pre') {
                if (viewed != null) {
                    callback(viewed);
                    if (viewed.right != null) {
                        stack.push(viewed.right);
                    }
                    viewed = viewed.left;
                } else {
                    viewed = stack.pop();
                }
            } else if (method === 'in') {
                if (viewed != null) {
                    stack.push(viewed);
                    viewed = viewed.left;
                } else {
                    viewed = stack.pop();
                    callback(viewed);
                    viewed = viewed.right;
                }
            } else {
                if (viewed != null) {
                    stack.push(viewed);
                    viewed = viewed.left;
                } else {
                    /** @type {BSTNode<T>} */
                    const top = stack.at(-1);
                    if (top.right != null && !Object.is(top.right, prev)) {
                        viewed = top.right;
                    } else {
                        callback(top);
                        prev = stack.pop();
                    }
                }
            }
        } 
    }
}

/** 
 * @template T
 * @param {BSTNode<T>} node  */
function prettyPrint (node, prefix = "", isLeft = true) {
    if (node == null) {
      return;
    }
    if (node.right != null) {
      prettyPrint(node.right, `${prefix}${isLeft ? "│      " : "       "}`, false);
    }
    console.log(`${prefix}${isLeft ? "└───── " : "┌───── "}${node.value}`);
    if (node.left != null) {
      prettyPrint(node.left, `${prefix}${isLeft ? "       " : "│      "}`, true);
    }
};

/** @param {string} title */
const separator = (n, title) => {
    const SIZE = 4;
    n *= 4;
    console.log('='.repeat(n));
    console.log(title.padStart((title.length + n) / 2, '~').padEnd(n, '~'));
    console.log('='.repeat(n));
};

const tree = new Tree([1, 7, 4, 23, 8, 9, 4, 3, 5, 7, 9, 67, 6345, 324]);
prettyPrint(tree.root);

separator(12, 'Inserting');
tree.insert(144);
prettyPrint(tree.root);

separator(12, 'Deleting');
tree.removeValue(144);
prettyPrint(tree.root);

separator(12, 'Finding');
prettyPrint(tree.find(67));

separator(12, 'Level Order, Pre/In/Postorder');
prettyPrint(tree.root);
tree.levelOrder((v) => {stdout.write(v.value + ' => ')})
console.log();
tree.inOrder((v) => {stdout.write(v.value + ' => ')})
console.log();
tree.preOrder((v) => {stdout.write(v.value + ' => ')})
console.log();
tree.postOrder((v) => {stdout.write(v.value + ' => ')})
console.log();
