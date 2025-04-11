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

    /** @param {(val: T, node: BSTNode<T>, i: number) => void} callback  */
    levelOrder(callback) {
        if (typeof callback !== 'function') {
            throw new TypeError("No callback provided");
        }

        const queue = [this.root];
        let i = 0;
        while (queue.length !== 0) {
            const node = queue.shift();
            if (node == null) continue;
            queue.push(node.left, node.right);
            callback(node.value, node, i);
            i++;
        }
    }

    /** @param {(val: T, node: BSTNode<T>, i: number) => void} callback  */
    inOrder(callback) { this.#xOrder(callback, 'in'); }

    /** @param {(val: T, node: BSTNode<T>, i: number) => void} callback  */
    preOrder(callback) { this.#xOrder(callback, 'pre'); }

    /** @param {(val: T, node: BSTNode<T>, i: number) => void} callback  */
    postOrder(callback) { this.#xOrder(callback, 'post'); }

    /**
     * @param {(val: T, node: BSTNode<T>, i: number) => void} callback 
     * @param {'post' | 'pre' | 'in'} method 
     */
    #xOrder(callback, method) {
        const stack = [];
        let viewed = this.root;
        let prev = null;
        let i = 0;
        while ((stack.length) != 0 || viewed != null) {
            if (method === 'pre') {
                if (viewed != null) {
                    callback(viewed.value, viewed, i);
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
                    callback(viewed.value, viewed, i);
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
                        callback(top.value, top, i);
                        prev = stack.pop();
                    }
                }
                i++;
            }
        } 
    }

    /** @param {T} value  */
    height(value) {
        const node = this.find(value);
        if (node == null) return null;
        return this.#heightNode(node);
    }

    /** @param {BSTNode<T> | null} node  */
    #heightNode(node) {
        if (node == null) return -1;
        return Math.max(-1, Math.max(1 + this.#heightNode(node.left), 1 + this.#heightNode(node.right)));
    }
    
    /** @param {T} value  */
    depth(value) {
        const node = this.find(value);
        if (node == null) return null;
        
        let view = this.root;
        let depth = 0;
        while (!Object.is(view, node)) {
            if (node.value > view.value) {
                view = view.right;
            } else {
                view = view.left;
            }
            depth += 1;
        }
        return depth;
    }

    isBalanced() {
        return this.#isNodeBalanced(this.root);
    }

    /** @param {BSTNode<T> | null} node  */
    #isNodeBalanced(node) {
        if (node == null) return true;
        const subtrees = Math.abs(this.#heightNode(node.left) - this.#heightNode(node.right)) <= 1; 
        return subtrees && this.#isNodeBalanced(node.left) && this.#isNodeBalanced(node.right);   
    }

    rebalance() {
        const arr = [];
        this.inOrder((val) => { arr.push(val) });
        this.root = buildTree(arr);
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


/*
1. Create a binary search tree from an array of random numbers < 100. X
    - You can create a function that returns an array of 
      random numbers every time you call it if you wish.
2. Confirm that the tree is balanced by calling isBalanced. X
3. Print out all elements in level, pre, post, and in order.
4. Unbalance the tree by adding several numbers > 100.
5. Confirm that the tree is unbalanced by calling isBalanced.
6. Balance the tree by calling rebalance.
7. Confirm that the tree is balanced by calling isBalanced.
8. Print out all elements in level, pre, post, and in order. 
*/

// Ad-hoc
/** @param {number} size */
const randomHelper = (size) => {
    const arr = [];
    while (size-- > 0) {       
        arr.push(Math.round(Math.random() * 100));
    }
    return arr;
}

const tree = new Tree(randomHelper(24));
console.log(`Is tree balanced? ${tree.isBalanced()}`);

let aux = [];
tree.levelOrder((v) => aux.push(v));
console.log(`Level order: [${aux.toString()}]`);
aux = [];
tree.preOrder((v) => aux.push(v));
console.log(`Pre order: [${aux.toString()}]`);
aux = [];
tree.inOrder((v) => aux.push(v));
console.log(`In order: [${aux.toString()}]`);
aux = [];
tree.postOrder((v) => aux.push(v));
console.log(`Post order: [${aux.toString()}]`);

console.log("Adding ~10 elements");
randomHelper(10).forEach((val) => tree.insert(val));
console.log(`Is tree balanced? ${tree.isBalanced()}`);
console.log(tree.height(tree.root.value));
console.log("Balancing");
tree.rebalance();
console.log(`Is tree balanced? ${tree.isBalanced()}`);
console.log(tree.height(tree.root.value));

aux = [];
tree.levelOrder((v) => aux.push(v));
console.log(`Level order: [${aux.toString()}]`);
aux = [];
tree.preOrder((v) => aux.push(v));
console.log(`Pre order: [${aux.toString()}]`);
aux = [];
tree.inOrder((v) => aux.push(v));
console.log(`In order: [${aux.toString()}]`);
aux = [];
tree.postOrder((v) => aux.push(v));
console.log(`Post order: [${aux.toString()}]`);
