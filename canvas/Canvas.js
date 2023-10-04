const defaultCanvasOptions = {
  setSizeToParent: true,
  dims: {
    initialWidth: 100,
    initialHeight: 100,
  },
};

/**
 * notifies a change in an object in console
 */
console.alertChange = function () {
  for (const argument of arguments) {
    console.log(
      `%c ${argument}`,
      `background:#e0dd80;color:#000;padding:5px;border-radius:5px;margin-top:5px;margin-bottom:5px;`
    );
  }
};

/**
 * creates a new canvas and appends it to argument parent
 * sets its size to match parent or to dims in options if
 * setSizeToParent set to false
 */
class Canvas {
  /**
   *
   * @param {HTMLElement} parent parent element of the canvas to create
   * @param {String} [id] optional id of the canvas, otherwise auto-generated
   * @param  [options] options for canvas dimensions
   * @returns {String} id
   */
  constructor(parent, id, options = defaultCanvasOptions) {
    if (!parent || typeof parent != "object")
      throw new Error("parent is required to instantiate Canvas");
    this.canvas = document.createElement("canvas");
    this.canvas.id = id || UID("canvas");
    this.canvas.style.position = "absolute";

    this.parent = parent;
    this.parent.appendChild(this.canvas);
    if (options.setSizeToParent) this.setSizeToParent();
    else {
      this.setSize(options.dims.initialWidth, options.dims.initialHeight);
    }

    this.c = this.canvas.getContext("2d");

    this.options = options;
  }

  /**
   * Sets size of canvas following parameters
   * @param {Number} width -the with to set the canvas to
   * @param {Number} height -the height to set the canvas to
   */
  setSize(width, height) {
    if (typeof width != "number")
      throw new Error("Width parameter must be of type number");
    if (typeof height != "number")
      throw new Error("Height parameter must be of type number");

    this.canvas.width = width;
    this.canvas.height = height;
  }

  /**sets canvas size to parent current size */
  setSizeToParent() {
    if (!this.parent) throw new Error("no parent found to set size to");
    this.canvas.width = this.parent.clientWidth;
    this.canvas.height = this.parent.clientHeight;
  }

  /**
   *sets canvas size with a callback accessing the canvas' parent
   width and height and returning the desired width and height in an array
   * @param {Function} callback callback that takes as params the width
   * and height of the canvas parent, and returns the desired canvas width
   * and height in an array: (w,h)=> [canvasInducedWidth, canvasInducedHeight];
   */
  setSizeFromParentSize(callback = (w, h) => [w, h]) {
    const dims = callback(this.parent.width, this.parent.height);
    this.setSize(dims[0], dims[1]);
  }

  clear() {
    const { canvas } = this;
    this.c.clearRect(0, 0, canvas.width, canvas.height);
  }

  /**
   * returns the id of the canvas
   * @returns {String} canvas id
   */
  getCanvasId() {
    return this.canvas.id;
  }
}
