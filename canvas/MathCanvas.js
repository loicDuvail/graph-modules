/**
 *Maps a value from an input range to an output range

 value can be outside of input range, but will then be mapped outside output range
 * @param {Number} val Value to map from input interval to output interval
 * @param {Array<Number>} param1 Input range to map value from
 * @param {Array<Number>} param2 Output range to map value to
 * @returns {Number} Mapped value
 */
function map(val, [minin, maxin], [minout, maxout]) {
  if (
    typeof val != "number" ||
    typeof minin != "number" ||
    typeof maxin != "number" ||
    typeof minout != "number" ||
    typeof maxout != "number"
  )
    throw new Error("every parameters must be of type Number");

  let in0_1Range = (val - minin) / (maxin - minin);
  return in0_1Range * (maxout - minout) + minout;
}

/**
 * Creates an object with math-conventional y-axis(from bottom to top)
 * and with added features such as plane mapping.
 *
 * (You can set new min
 * and max x and y values and every x and y input value for every methods
 * will be automatically mapped from this interval to the actual canvas dimensions.)
 */

class MathCanvas extends Canvas {
  /**
   * @param {HTMLElement} parent Parent element to append canvas to
   * @param {String} id ID given to the created canvas element
   * @param [options] Options for canvas dimensions
   */
  constructor(parent, id, options = defaultCanvasOptions) {
    if (!parent) throw new Error("Parent required to instantiate MathCanvas");
    super(parent, id, options);
    this.plane = [0, 0, this.canvas.width, this.canvas.height];

    this.optionalTxtContainer = document.createElement("div");
    this.optionalTxtContainer.style.position = "absolute";
    this.optionalTxtContainer.style.top = "0";
    this.optionalTxtContainer.style.left = "0";
    this.optionalTxtContainer.id = `container-for_${this.canvas.id}`;
    document.body.appendChild(this.optionalTxtContainer);
  }

  /**
   *Sets a new input plane,
   an input plane is the plane in which every coordinate input
   used when drawing a shape will be supposed to be contained.

   When using a drawing method, the x and y coordinates will then be mapped
   from this input plane to the actual canvas dims.
   * @param {Array<Number>} plane plane in which every coordinates
   * input will be contained, and then mapped to actual canvas dims when drawing
   * 
   * plane = [minX,minY,maxX,maxY]
   */
  setPlane(plane) {
    if (plane.length != 4)
      throw new Error('"plane" parameter must be an array of length 4');
    if (plane.some((val) => typeof val != "number"))
      throw new Error(
        'Every value inside "plane" array must be of type "Number"'
      );
    this.plane = plane;
  }

  //* YOU MUST PASS THROUGH THIS FUNCTION TO INVERT Y-AXIS
  /**
   *Maps x and y from "inputInterval" property to the canvas actual pixel dimensions.
   
   (0 to canvas.<width/height>)
   * @param {Number} x x coordinate that will be mapped from input interval to [0, canvas.width]
   * @param {Number} y y coordinate that will be mapped from input interval to [0, canvas.height]
   * @returns {Array<Number>} Mapped x and y coordinates in an array
   */
  #mapCoords(x, y) {
    if (typeof x != "number" || typeof y != "number")
      throw new Error("x and y must be of type 'Number'");
    let { plane: inputInterval } = this;
    let mappedX = map(
      x,
      [inputInterval[0], inputInterval[2]],
      [0, this.canvas.width]
    );
    let mappedY = map(
      y,
      [inputInterval[1], inputInterval[3]],
      [this.canvas.height, 0]
    );
    //turn values to integers then add 0.5 to draw cleaner lines
    // --> view http://diveintohtml5.info/canvas.html#pixel-madness
    [mappedX, mappedY] = [parseInt(mappedX) + 0.5, parseInt(mappedY) + 0.5];
    return [mappedX, mappedY];
  }

  /**
   *Draws a line from a point to an other with given color (defaults to black).
   * @param {Array<number>} from [x,y] point the line starts at
   * @param {Array<number>} to [x,y] point the line ends at
   * @param {String} [color] Optional color of the line to draw, defaults to black
   * @param {Number} [lineWidth] Optional line width, defaults to 1
   */
  drawLine(from, to, color, lineWidth) {
    if (from.length != 2 || to.length != 2)
      throw new Error('"from" and "to" parameters must be arrays of length 2');
    if (
      from.some((val) => typeof val != "number") ||
      to.some((val) => typeof val != "number")
    )
      throw new Error(
        '"from" and "to" array parameters must only contain numbers'
      );
    if (color && typeof color != "string")
      throw new Error('"color" parameter must be of type "String"');

    let mapFrom = this.#mapCoords(from[0], from[1]);
    let mapTo = this.#mapCoords(to[0], to[1]);

    const { c } = this;
    c.strokeStyle = color || "black";
    c.lineWidth = lineWidth || 1;
    c.beginPath();
    c.moveTo(mapFrom[0], mapFrom[1]);
    c.lineTo(mapTo[0], mapTo[1]);
    c.stroke();
  }

  /**
   *Draws a rectangle from (x,y) to (x+w,y+h) filled with given color
   * @param {Number} x x coordinate of the bottom left of the rectangle
   * @param {Number} y y coordinate of the bottom left of the rectangle
   * @param {Number} w With of the rectangle
   * @param {Number} h Height of the rectangle
   * @param {String} [color] Optional color of the rectangle, defaults to black
   */
  fillRect(x, y, w, h, color) {
    if (typeof x != "number")
      throw new Error('Parameter "x" must be of type "Number"');
    if (typeof y != "number")
      throw new Error('Parameter "y" must be of type "Number"');
    if (typeof w != "number")
      throw new Error('Parameter "w" must be of type "Number"');
    if (typeof h != "number")
      throw new Error('Parameter "h" must be of type "Number"');
    if (color && typeof color != "string")
      throw new Error('Parameter "color" must be of type "String"');

    let [mappedX, mappedY] = this.#mapCoords(x, y);
    let [mappedW] = this.#mapCoords(w, 0);
    let { plane: inputInterval } = this;
    let mappedH = map(
      h,
      [inputInterval[1], inputInterval[3]],
      [0, this.canvas.height]
    );

    const { c } = this;

    c.fillStyle = color || "black";
    c.beginPath();
    // inverted h since canvas originaly draws from top to bottom
    // and math canvas does the inverse
    // --> to respect jsDoc description of MathCanvas.fillRect "from (x,y) to (x+w,y+h)"
    c.fillRect(mappedX, mappedY, mappedW, -mappedH);
  }

  /**
   * renders given text at given coordinates,
   * @param {String} txt
   * @param {Number} x
   * @param {Number} y
   * @param [options] options for text style as well as possibility to
   * forcefully set the text in bound if coordinates out of canvas boundaries
   * @param {Number} [maxWidth]
   */
  fillText(
    txt,
    x,
    y,
    options = {
      textAlign: "center",
      textBaseline: "middle",
      font: "20px Arial",
      color: "black",
      stayInbound: true,
      inBoundedColor: "grey",
      renderOutsideBorderIfOutOfBound: false,
    },
    maxWidth
  ) {
    if (typeof txt != "string")
      throw new Error('"txt" parameter must be of type "string"');
    if (typeof x != "number")
      throw new Error('"x" parameter must be of type "number"');
    if (typeof y != "number")
      throw new Error('"y" parameter must be of type "number"');

    [x, y] = this.#mapCoords(x, y);
    const { c } = this;
    c.textAlign = options.textAlign || "left";
    c.textBaseline = options.textBaseline || "middle";
    c.font = options.font || "20px monospace";
    c.fillStyle = options.color || "black";

    // if we want the text to be always visibile, even if out of canvas boudaries,
    // x and y positions are automatically set to in bound value
    // and color is set to "inBoundedColor"
    if (options.stayInbound) {
      let w = this.canvas.width;
      let h = this.canvas.height;
      let marginFromBorder = 10;
      let marginFromBottomBorder = 5;

      if (x < marginFromBorder || x > w || y < marginFromBorder || y > h) {
        c.fillStyle = options.inBoundedColor;
        if (options.renderOutsideBorderIfOutOfBound) {
          if (x < marginFromBorder) {
            x = -marginFromBorder;
            options.textAlign = "right";
          }
          if (x > w) {
            x = w + marginFromBorder;
            options.textAlign = "left";
          }
          if (y < 0) {
            y = -marginFromBorder;
            options.textBaseline = "bottom";
          }
          if (y > h) {
            y = h + marginFromBottomBorder;
            options.textBaseline = "top";
          }
          return this.htmlTxt(txt, x, y, { ...options, font: "Poppins" });
        }
      }

      if (x < marginFromBorder) {
        x = marginFromBorder;
        c.textAlign = "left";
      }
      if (x > w) {
        x = w - marginFromBorder;
        c.textAlign = "right";
      }
      if (y < marginFromBorder) {
        y = marginFromBorder;
        c.textBaseline = "top";
      }
      if (y > h - marginFromBottomBorder) {
        y = h - marginFromBottomBorder;
        c.textBaseline = "bottom";
      }
    }

    c.fillText(txt, x, y, maxWidth);
  }

  htmlTxt(
    txt,
    x,
    y,
    options = {
      textAlign: "right",
      textBaseline: "middle",
      color: "black",
      font: "Poppins",
    }
  ) {
    let txtContainer = document.createElement("div");
    txtContainer.innerText = txt;

    txtContainer.style.color = options.color || "black";
    txtContainer.style.fontFamily = options.font || "Arial";
    txtContainer.style.position = "absolute";

    let br = this.parent.getBoundingClientRect();
    txtContainer.style.top = y + br.y + "px";
    txtContainer.style.left = x + br.x + "px";

    let xTranslate = "0",
      yTranslate = "0";
    if (options.textAlign == "right") xTranslate = "-100%";
    if (options.textAlign == "center") xTranslate = "-50%";
    if (options.textBaseline == "middle") yTranslate = "-50%";
    if (options.textBaseline == "bottom") yTranslate = "-100%";
    txtContainer.style.transform = `translate(${xTranslate},${yTranslate})`;

    this.optionalTxtContainer.appendChild(txtContainer);
  }

  clearHtmlTxt() {
    let el = this.optionalTxtContainer;
    while (el.firstChild) el.removeChild(el.firstChild);
  }
  /**
   * draws an arc at given coordinate with parameters
   *
   * if "fill" not set to true, the arc will be stroked
   * @param {Number} x x coordinate of center of the arc
   * @param {Number} y y coordinate of center of the arc
   * @param {Number} radius radius IN ACTUAL PXs of the arc
   * @param {Number} startAngle start angle of the arc
   * @param {Number} endAngle end angle of the arc
   * @param {boolean} [counterClockWise] sense of rotation of the arc when drawing
   * @param {boolean} [fill] fill the arc or stroke it
   */
  circ(x, y, radius, startAngle, endAngle, color, counterClockWise, fill) {
    if (typeof x != "number")
      throw new Error('Parameter "x" must be of type "Number"');
    if (typeof y != "number")
      throw new Error('Parameter "y" must be of type "Number"');
    if (typeof radius != "number")
      throw new Error('Parameter "radius" must be of type "Number"');
    if (typeof startAngle != "number")
      throw new Error('Parameter "startAngle" must be of type "Number"');
    if (typeof endAngle != "number")
      throw new Error('Parameter "endAngle" must be of type "Number"');
    if (counterClockWise && typeof counterClockWise != "boolean")
      throw new Error(
        'Parameter "counterClockWise" must be of type "Boolean" or undefined'
      );
    if (fill && typeof fill != "boolean")
      throw new Error(
        'Parameter "fill" must be of type "Boolean" or undefined'
      );
    let [mappedX, mappedY] = this.#mapCoords(x, y);

    const { c } = this;

    c.beginPath();
    c.arc(mappedX, mappedY, radius, startAngle, endAngle, counterClockWise);
    if (fill) {
      c.fillStyle = color;
      c.fill();
    } else {
      c.strokeStyle = color;
      c.stroke();
    }
  }
}
