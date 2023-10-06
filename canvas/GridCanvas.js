const defaultGridCanvasOptions = {
  canvas: {
    ...defaultCanvasOptions,
  },
  grid: {
    square: true,
    axis: {
      displayed: true,
      x: {
        lineColor: "#222",
        lineWidth: 1,
      },
      y: {
        lineColor: "#222",
        lineWidth: 1,
      },
    },
    gridLines: {
      displayed: true,
      horiz: {
        displayed: true,
        lineColor: "grey",
        lineWidth: 0.5,
      },
      verti: {
        displayed: true,
        lineColor: "grey",
        lineWidth: 0.5,
      },
    },
    subGridLines: {
      displayed: true,
      horiz: {
        displayed: true,
        lineColor: "lightGrey",
        lineWidth: 0.5,
      },
      verti: {
        displayed: true,
        lineColor: "lightGrey",
        lineWidth: 0.5,
      },
    },
    pxStep: {
      min: 100,
      max: 100,
    },
    fontOptions: {
      fontStyle: "15px Arial",
    },
  },
};

/**
 * A class used to easely graph grids
 */
class GridCanvas extends MathCanvas {
  #xSubSections;
  #ySubSections;
  #xPow;
  #yPow;
  #xStep;
  #yStep;
  #renderOnChange = true;
  /**
   * @param {HTMLElement} parent Parent element to append canvas to
   * @param {String} [id] optional ID given to the created canvas element, auto-generated if not precised
   * @param [options] Options for canvas dimensions and grid rendering
   */
  constructor(parent, id, options = defaultGridCanvasOptions) {
    // sets every non defined options to default
    options = { ...defaultGridCanvasOptions, ...options };
    console.log(options);
    super(parent, id, options.canvas);
    this.options = options;

    //sets plane to default plane ([0,0,canvas.width,canvas.height])
    this.setPlane();
  }

  /**
   *sets a virtual plane in which the grid will be displayed
   * @param {Array<Number>} plane plane = [xmin, ymin, xmax, ymax]
   * @override
   */
  setPlane(plane = [0, 0, this.canvas.width, this.canvas.height]) {
    if (plane.length != 4)
      throw new Error("Plane parameter must be an array of length 4.");
    if (plane.some((val) => typeof val != "number"))
      throw new Error("Plane parameter must be an array of numbers.");
    super.setPlane(plane);

    //also set new steps and pow base values
    this.autoStep();

    if (this.#renderOnChange) this.drawGrid();

    try {
      console.alertChange(
        `New plane set for #${this.canvas.id}: [${this.plane.map((val) =>
          GridCanvas.#formatValue(val, 2)
        )}] `
      );
    } catch (e) {}
  }

  /**
   * Gets the current plane
   * @returns current plane
   */
  getPlane() {
    return this.plane;
  }

  /**
   * Translates the plane by dx and dy
   * @param {Number} dx
   * @param {Number} dy
   */
  translate(dx, dy) {
    if (typeof dx != "number") throw new Error("dx must be of type number");
    if (typeof dy != "number") throw new Error("dy must be of type number");

    const p = this.plane;
    this.setPlane([p[0] - dx, p[1] - dy, p[2] - dx, p[3] - dy]);
  }

  /**
   * Define if the grid must be rerendered on every change (for instance plane change, xStep change...)
   * @param {Boolean} renderOnChange
   */
  renderOnChange(renderOnChange) {
    this.#renderOnChange = renderOnChange;
  }

  /**
   * Sets the step between each vertical grid line to xStep value
   * @param {Number} xStep The unit distance between each vertical grid line
   */
  setXStep(xStep) {
    if (typeof xStep != "number")
      throw new Error("xStep parameter must be of type number");

    this.#xStep = xStep;
    this.#xSubSections = xStep.toString().slice(-1) == "5" ? 5 : 4;
    if (this.#renderOnChange) this.drawGrid();
  }
  /**
   * Sets the step between each horizontal grid line to yStep value
   * @param {Number} yStep The unit distance between each horizontal grid line
   */
  setYStep(yStep) {
    if (typeof yStep != "number")
      throw new Error("yStep parameter must be of type number");

    this.#yStep = yStep;
    this.#ySubSections = yStep.toString().slice(-1) == "5" ? 5 : 4;
    if (this.#renderOnChange) this.drawGrid();
  }

  /**
   * Automaticaly sets x and y step values to an approriate value
   * depending on options.grid.pxStep.<min/max>
   */
  autoStep() {
    this.#setAutoStepAndPow();
    this.#setAutoStepAndPow(false);
    if (this.#renderOnChange) this.drawGrid();
  }

  /**
   * Refactors the plane values in order to render a square grid,
   * with equal x and y step unit.
   *
   * @param {Boolean} preserveXAxis If true, the x axis is preserved and only the y axis is modified
   * through its min and max values
   *
   * Otherwise, it is the x axis that is modified and the y axis is preserved
   */
  squarePlane(preserveXAxis = true) {
    const aspectRatio = this.canvas.height / this.canvas.width;
    const { plane: vp } = this;

    // yInterval/xInterval = this.canvas.height/this.canvas.width
    //--> xInterval * apsectRatio = yInterval
    //--> xInterval =
    if (!preserveXAxis) {
      let yInterval = vp[3] - vp[1];

      let newXInterval = yInterval / aspectRatio;
      let newXMin = -map(0, [vp[0], vp[2]], [0, newXInterval]);

      this.setPlane([newXMin, vp[1], newXMin + newXInterval, vp[3]]);
      [this.#xStep, this.#xPow] = [this.#yStep, this.#yPow];
    } else {
      let xInterval = vp[2] - vp[0];

      let newYInterval = xInterval * aspectRatio;
      let newYMin = -map(0, [vp[1], vp[3]], [0, newYInterval]);

      this.setPlane([vp[0], newYMin, vp[2], newYMin + newYInterval]);
      [this.#yStep, this.#yPow] = [this.#xStep, this.#xPow];
    }
    if (this.#renderOnChange) this.drawGrid();
  }

  /**
   * Draws a grid of the virtual plane, following current x and y step values.
   * 
   *If not manually set, they are automatically deduced from canvas size
   and options.grid.pxStep.<min/max> values
   */
  drawGrid() {
    this.clear();

    let xSubgridInterval = this.#xStep / this.#xSubSections;
    let ySubgridInterval = this.#yStep / this.#ySubSections;

    let gop = this.options.grid.gridLines;
    let sop = this.options.grid.subGridLines;

    let { plane: vp } = this;
    if (!vp)
      throw new Error(
        "No virtual plane defined, you can use setVirtualPlane method to fix this problem"
      );

    this.#drawGridValues();

    //draw vertical lines
    for (
      let x = vp[0] - (vp[0] % this.#xStep) - this.#xStep;
      x < vp[2];
      x += this.#xStep
    ) {
      if (gop.displayed && gop.verti.displayed)
        this.drawLine(
          [x, vp[1]],
          [x, vp[3]],
          gop.verti.lineColor,
          gop.verti.lineWidth
        );
      if (sop.displayed && sop.verti.displayed)
        for (
          let i = gop.verti.displayed && gop.displayed ? xSubgridInterval : 0;
          i < this.#xStep;
          i += xSubgridInterval
        ) {
          this.drawLine(
            [x + i, vp[1]],
            [x + i, vp[3]],
            sop.verti.lineColor,
            sop.verti.lineWidth
          );
        }
    }

    //draw horizontal lines
    for (
      let y = vp[1] - (vp[1] % this.#yStep) - this.#yStep;
      y < vp[3];
      y += this.#yStep
    ) {
      if (gop.displayed && gop.horiz.displayed)
        this.drawLine(
          [vp[0], y],
          [vp[2], y],
          gop.horiz.lineColor,
          gop.horiz.lineWidth
        );
      if (sop.displayed && sop.horiz.displayed)
        for (
          let i = gop.horiz.displayed && gop.displayed ? ySubgridInterval : 0;
          i < this.#yStep;
          i += ySubgridInterval
        ) {
          this.drawLine(
            [vp[0], y + i],
            [vp[2], y + i],
            sop.verti.lineColor,
            sop.verti.lineWidth
          );
        }
    }

    //draw axis
    this.#drawAxis();
  }

  /**
   * Draws axis of the plane if in range
   */
  #drawAxis() {
    let { plane: vp } = this;
    if (!vp)
      throw new Error(
        "No virtual plane defined, you can use setVirtualPlane method to fix this problem"
      );
    let { axis: axisOptions } = this.options.grid;

    this.drawLine(
      [0, vp[1]],
      [0, vp[3]],
      axisOptions.y.lineColor,
      axisOptions.y.lineWidth
    );
    this.drawLine(
      [vp[0], 0],
      [vp[2], 0],
      axisOptions.x.lineColor,
      axisOptions.x.lineWidth
    );
  }

  #drawGridValues() {
    const { plane: vp } = this;

    this.clearHtmlTxt();

    let xAxisTxtMarginTopPx = 10,
      yAxisTxtMarginRightPx = 10;

    let xAxisTxtMarginTop = map(
      xAxisTxtMarginTopPx,
      [0, this.canvas.height],
      [0, vp[3] - vp[1]]
    );
    let yAxisTxtMarginRight = map(
      yAxisTxtMarginRightPx,
      [0, this.canvas.width],
      [0, vp[2] - vp[0]]
    );

    for (let x = vp[0] - (vp[0] % this.#xStep); x < vp[2]; x += this.#xStep)
      if (x > this.#xStep / 2 || x < -this.#xStep / 2) {
        this.fillText(
          GridCanvas.#formatValue(x, this.#xPow),
          x,
          -xAxisTxtMarginTop,
          {
            textBaseline: "top",
            textAlign: "center",
            font: this.options.grid.fontOptions.fontStyle,
            stayInbound: true,
            inBoundedColor: "grey",
          }
        );
      }

    for (let y = vp[1] - (vp[1] % this.#yStep); y < vp[3]; y += this.#yStep)
      if (y > this.#yStep / 2 || y < -this.#yStep / 2) {
        this.fillText(
          GridCanvas.#formatValue(y, this.#yPow),
          -yAxisTxtMarginRight,
          y,
          {
            textBaseline: "middle",
            textAlign: "right",
            font: this.options.grid.fontOptions.fontStyle,
            stayInbound: true,
            inBoundedColor: "grey",
          }
        );
      }

    // if 0 in canvas range
    if (
      ((vp[0] < 0 && vp[2] > 0) || (vp[0] > 0 && vp[2] < 0)) &&
      ((vp[1] < 0 && vp[3] > 0) || (vp[1] > 0 && vp[3] < 0))
    )
      this.fillText("0", -xAxisTxtMarginTop, -yAxisTxtMarginRight, {
        textAlign: "right",
        textBaseline: "top",
        font: this.options.grid.fontOptions.fontStyle,
      });
  }

  /**
   * formats a value to a more compact and readable value
   * @param {Number} val the number to format
   * @param {Number} pow absolute value of power of ten
   *
   * used to know how to round a number
   */
  static #formatValue(val, pow) {
    if (typeof val != "number")
      throw new Error("val parameter must be of type number");
    if (typeof pow != "number")
      throw new Error("pow parameter must be of type number");

    //if val is integer
    if (Math.floor(val) == val) {
      return val.toString();
    } else {
      val = Math.round(val * 10 ** (pow + 1)) / 10 ** (pow + 1);
      return val.toString();
    }
  }

  /**
   * sets the virtual value between each grid line
   *
   * For instance, for x axis going from -5 to 5, we would want to have
   * vertical grid lines spaced by 1.
   *
   * But for x axis going from -20 to 20, we would want to have
   * vertical grid lines spaced by 5
   * @param {Boolean} forX If true, sets x step and pow, else y step and pow
   */
  #setAutoStepAndPow(forX = true) {
    let maxGridLineNb, minGridLineNb, interval;
    if (forX) {
      maxGridLineNb = this.canvas.width / this.options.grid.pxStep.min;
      minGridLineNb = this.canvas.width / this.options.grid.pxStep.max;
    } else {
      maxGridLineNb = this.canvas.height / this.options.grid.pxStep.min;
      minGridLineNb = this.canvas.height / this.options.grid.pxStep.max;
    }

    if (forX) interval = this.plane[2] - this.plane[0];
    else interval = this.plane[3] - this.plane[1];

    let possibleBases = [1, 2, 5];
    let virtualStep = 0;

    // if virtual step will be equal or greater than one
    if (interval > minGridLineNb) {
      let i = 0;
      while (maxGridLineNb * virtualStep < interval) {
        virtualStep =
          possibleBases[i % possibleBases.length] *
          10 ** Math.floor(i / possibleBases.length);
        i++;
      }
      i--;
      if (forX) {
        this.#xSubSections = i % 3 == 2 ? 5 : 4;
        this.#xStep = virtualStep;
        this.#xPow = Math.floor(i / 3);
        return;
      } else {
        this.#ySubSections = i % 3 == 2 ? 5 : 4;
        this.#yStep = virtualStep;
        this.#yPow = Math.floor(i / 3);
        return;
      }
    }
    // if virtual step will be less than one
    else {
      let i = 0;
      virtualStep = 1;
      while (minGridLineNb > interval / virtualStep) {
        virtualStep =
          (1 / possibleBases[i % possibleBases.length]) *
          10 ** -Math.floor(i / possibleBases.length);
        i++;
      }
      i -= 2;
      virtualStep =
        (1 / possibleBases[i % possibleBases.length]) *
        10 ** -Math.floor(i / possibleBases.length);

      if (forX) {
        this.#xSubSections = i % 3 == 2 ? 5 : 4;
        this.#xStep = virtualStep;
        this.#xPow = Math.floor(i / 3);
        return;
      } else {
        this.#ySubSections = i % 3 == 2 ? 5 : 4;
        this.#yStep = virtualStep;
        this.#yPow = Math.floor(i / 3);
        return;
      }
    }
  }
}
