const defaultGraphCanvasOptions = {
  ...defaultCanvasOptions,
  color: "red",
};

let plotStyles = ["line", "dot", "towers"];

class GraphCanvas extends MathCanvas {
  #renderOnChange = true;
  #values;
  #plotStyle = "line";
  #plotColor = "red";
  #dotRadius = 3;

  constructor(parent, id, options = defaultGraphCanvasOptions) {
    super(parent, id, options);
  }

  /**
   * Choose wether to render on every graph canvas change or manualy
   * @param {Boolean} renderOnChange
   */
  renderOnChange(renderOnChange) {
    this.#renderOnChange = renderOnChange;
  }

  /**
   *
   * @param {Array<[Number,Number]>} values values to plot,
   * vals = [[x,y],[x1,y1],[x2,y2]...]
   */
  setValuesToPlot(values) {
    if (!values) throw new Error("No values passed as parameter");
    if (values.some((v) => v.length != 2))
      throw new Error("Values must be of type Array<Array[2]>");
    if (values.some((v) => typeof v[0] != "number" || typeof v[1] != "number"))
      throw new Error("Values to plot can only be numbers.");

    this.#values = values;
  }

  setPlotStyle(plotStyle) {
    if (!plotStyles.some((p) => p == plotStyle))
      throw Error(`Plot style "${plotStyle}" is not supported by graph canvas`);
    this.#plotStyle = plotStyle;
  }

  /**
   * Sets the color of the graph
   * @param {String} color
   */
  setPlotColor(color) {
    this.#plotColor = color;
  }

  /**
   * Plots current values of the graph
   * @param {Boolean} autoPlane If set to true, the plane in which the graph
   * will be drawn will range from x and y min and max values.
   *
   * The graph will then be perfectly contained in the canvas
   */
  plot(autoPlane = false) {
    if (!this.#values) throw new Error("No values to plot.");
    if (this.#values.some((v) => v.length != 2))
      throw new Error("Values to plot must be of type Array<Array[2]>");
    if (
      this.#values.some(
        (v) => typeof v[0] != "number" || typeof v[1] != "number"
      )
    )
      throw new Error("Values to plot can only be numbers.");

    const vals = this.#values;
    let xSortedValues = [...vals.sort((a, b) => a[0] - b[0])];
    if (autoPlane) {
      let ySortedValues = [...vals.sort((a, b) => a[1] - b[1])];

      let xmin = xSortedValues[0][0];
      let xmax = xSortedValues[xSortedValues.length - 1][0];
      let ymin = ySortedValues[0][1];
      let ymax = ySortedValues[ySortedValues.length - 1][1];

      this.setPlane([xmin, ymin, xmax, ymax]);
    }

    let lv = xSortedValues[0];
    if (this.#plotStyle == "line")
      for (let i = 1; i < xSortedValues.length; i++) {
        let v = xSortedValues[i];
        let from = [lv[0], lv[1]];
        let to = [v[0], v[1]];
        lv = v;
        this.drawLine(from, to, this.#plotColor);
      }
    if (this.#plotStyle == "dot")
      for (let i = 0; i < xSortedValues.length; i++) {
        let v = xSortedValues[i];
        this.circ(
          v[0],
          v[1],
          this.#dotRadius,
          0,
          2 * Math.PI,
          this.#plotColor,
          true,
          true
        );
      }
    if (this.#plotStyle == "towers")
      for (let i = 0; i < xSortedValues.length; i++) {
        let v = xSortedValues[i];
        let pv = xSortedValues[i - 1] || [this.plane[0], v[1]];
        let nv = xSortedValues[i + 1] || [this.plane[2], v[1]];

        let xStart = v[0] - (v[0] - pv[0]) / 2;
        let xEnd = nv[0] - (nv[0] - v[0]) / 2;

        this.fillRect(
          xStart,
          this.plane[1],
          xEnd - xStart,
          v[1],
          this.#plotColor
        );
      }
  }
}
